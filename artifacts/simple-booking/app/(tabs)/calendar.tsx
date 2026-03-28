import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import type { Appointment } from "@/context/DataContext";
import { useData } from "@/context/DataContext";

const DAYS = ["Pzr", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

function dateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function todayStr(): string {
  return dateStr(new Date());
}

function getDaysInMonth(year: number, month: number): Date[] {
  const result: Date[] = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    result.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return result;
}

export default function CalendarScreen() {
  const C = Colors.light;
  const insets = useSafeAreaInsets();
  const { appointments } = useData();

  const today = new Date();
  const [viewDate, setViewDate] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selectedDate, setSelectedDate] = useState(todayStr());

  const days = useMemo(() => getDaysInMonth(viewDate.year, viewDate.month), [viewDate]);

  const apptsByDate = useMemo(() => {
    const map: Record<string, number> = {};
    appointments.forEach((a) => {
      map[a.date] = (map[a.date] ?? 0) + 1;
    });
    return map;
  }, [appointments]);

  const selectedAppts = useMemo(() => {
    return appointments.filter((a) => a.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, selectedDate]);

  const prevMonth = () => {
    setViewDate((v) => {
      if (v.month === 0) return { year: v.year - 1, month: 11 };
      return { year: v.year, month: v.month - 1 };
    });
  };

  const nextMonth = () => {
    setViewDate((v) => {
      if (v.month === 11) return { year: v.year + 1, month: 0 };
      return { year: v.year, month: v.month + 1 };
    });
  };

  const firstDayOfWeek = new Date(viewDate.year, viewDate.month, 1).getDay();
  const blanks = Array(firstDayOfWeek).fill(null);

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: Platform.OS === "web" ? insets.top + 67 : insets.top + 16,
            backgroundColor: C.background,
          },
        ]}
      >
        <Text style={[styles.title, { color: C.text }]}>Takvim</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: C.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/add-appointment");
          }}
        >
          <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.calendarCard, { backgroundColor: C.surface }]}>
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
              <Feather name="chevron-left" size={22} color={C.text} />
            </TouchableOpacity>
            <Text style={[styles.monthText, { color: C.text }]}>
              {MONTHS[viewDate.month]} {viewDate.year}
            </Text>
            <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
              <Feather name="chevron-right" size={22} color={C.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.dayHeaders}>
            {DAYS.map((d) => (
              <View key={d} style={styles.dayHeaderCell}>
                <Text style={[styles.dayHeaderText, { color: C.textMuted }]}>{d}</Text>
              </View>
            ))}
          </View>

          <View style={styles.grid}>
            {blanks.map((_, i) => (
              <View key={`blank-${i}`} style={styles.cell} />
            ))}
            {days.map((d) => {
              const ds = dateStr(d);
              const isToday = ds === todayStr();
              const isSelected = ds === selectedDate;
              const count = apptsByDate[ds] ?? 0;

              return (
                <TouchableOpacity
                  key={ds}
                  style={[
                    styles.cell,
                    isSelected && { backgroundColor: C.primary, borderRadius: 12 },
                  ]}
                  onPress={() => {
                    setSelectedDate(ds);
                    Haptics.selectionAsync();
                  }}
                >
                  <Text
                    style={[
                      styles.cellText,
                      { color: isSelected ? "#fff" : isToday ? C.primary : C.text },
                      isToday && !isSelected && styles.todayText,
                    ]}
                  >
                    {d.getDate()}
                  </Text>
                  {count > 0 && (
                    <View
                      style={[
                        styles.dot,
                        { backgroundColor: isSelected ? "rgba(255,255,255,0.8)" : C.primary },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.selectedSection}>
          <Text style={[styles.selectedDateText, { color: C.text }]}>
            {(() => {
              const [y, m, day] = selectedDate.split("-").map(Number);
              const d = new Date(y, m - 1, day);
              return `${DAYS[d.getDay()]}, ${day} ${MONTHS[m - 1]} ${y}`;
            })()}
          </Text>
          <Text style={[styles.apptCount, { color: C.textMuted }]}>
            {selectedAppts.length} randevu
          </Text>
        </View>

        {selectedAppts.length === 0 ? (
          <View style={styles.emptyBox}>
            <Feather name="calendar" size={36} color={C.textMuted} />
            <Text style={[styles.emptyText, { color: C.textSecondary }]}>
              Bu günde randevu yok
            </Text>
          </View>
        ) : (
          <View style={[styles.apptList, { paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 100 }]}>
            {selectedAppts.map((a) => (
              <ApptRow key={a.id} appt={a} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function ApptRow({ appt }: { appt: Appointment }) {
  const C = Colors.light;
  const statusColors = {
    beklemede: C.warning,
    tamamlandı: C.success,
    iptal: C.danger,
  };

  return (
    <TouchableOpacity
      style={[styles.apptRow, { backgroundColor: C.surface }]}
      activeOpacity={0.85}
      onPress={() => router.push(`/appointment/${appt.id}`)}
    >
      <View style={[styles.timePill, { backgroundColor: C.primaryLight }]}>
        <Text style={[styles.timePillText, { color: C.primary }]}>{appt.time}</Text>
      </View>
      <View style={styles.apptInfo}>
        <Text style={[styles.apptName, { color: C.text }]}>{appt.customerName}</Text>
        <Text style={[styles.apptService, { color: C.textSecondary }]}>{appt.service || "—"}</Text>
      </View>
      <View style={[styles.statusDot, { backgroundColor: statusColors[appt.status] }]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  addBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  calendarCard: { marginHorizontal: 20, borderRadius: 16, padding: 16, marginBottom: 16 },
  monthNav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  navBtn: { padding: 6 },
  monthText: { fontSize: 17, fontFamily: "Inter_700Bold" },
  dayHeaders: { flexDirection: "row", marginBottom: 8 },
  dayHeaderCell: { flex: 1, alignItems: "center" },
  dayHeaderText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  cellText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  todayText: { fontFamily: "Inter_700Bold" },
  dot: { width: 4, height: 4, borderRadius: 2 },
  selectedSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  selectedDateText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  apptCount: { fontSize: 13, fontFamily: "Inter_400Regular" },
  emptyBox: { alignItems: "center", paddingTop: 32, gap: 8 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  apptList: { paddingHorizontal: 20, gap: 10 },
  apptRow: {
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  timePill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  timePillText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  apptInfo: { flex: 1 },
  apptName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  apptService: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
});
