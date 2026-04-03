import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import type { Appointment } from "@/context/DataContext";

const DAYS = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function formatDayLabel(d: Date) {
  const today = toDateStr(new Date());
  const ds = toDateStr(d);
  if (ds === today) return "Bugün";
  const tomorrow = toDateStr(addDays(new Date(), 1));
  if (ds === tomorrow) return "Yarın";
  const yesterday = toDateStr(addDays(new Date(), -1));
  if (ds === yesterday) return "Dün";
  return DAYS[d.getDay()];
}

function StatusBadge({ status }: { status: Appointment["status"] }) {
  const C = Colors.light;
  const map = {
    beklemede: { bg: C.warningLight, text: C.warning, icon: "clock" as const },
    tamamlandı: { bg: C.successLight, text: C.success, icon: "check-circle" as const },
    iptal: { bg: C.dangerLight, text: C.danger, icon: "x-circle" as const },
  };
  const s = map[status];
  return (
    <View style={[badge.wrap, { backgroundColor: s.bg }]}>
      <Feather name={s.icon} size={11} color={s.text} />
      <Text style={[badge.label, { color: s.text }]}>{status}</Text>
    </View>
  );
}

const badge = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  label: { fontSize: 11, fontFamily: "Inter_500Medium" },
});

function AppointmentRow({ appt, index }: { appt: Appointment; index: number }) {
  const C = Colors.light;
  const isFirst = index === 0;

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/appointment/${appt.id}`);
      }}
      style={styles.rowOuter}
    >
      <View style={styles.timelineCol}>
        <View style={[styles.timeDot, { backgroundColor: C.primary, ...(appt.status === "iptal" ? { backgroundColor: C.danger } : appt.status === "tamamlandı" ? { backgroundColor: C.success } : {}) }]} />
        <View style={[styles.timelineLine, { backgroundColor: C.border }]} />
      </View>

      <View style={[styles.card, { backgroundColor: C.surface }]}>
        <View style={styles.cardTop}>
          <View style={[styles.timeBox, { backgroundColor: C.primaryLight }]}>
            <Text style={[styles.timeHour, { color: C.primary }]}>{appt.time.split(":")[0]}</Text>
            <Text style={[styles.timeMin, { color: C.primary }]}>:{appt.time.split(":")[1] ?? "00"}</Text>
          </View>

          <View style={styles.cardMiddle}>
            <Text style={[styles.customerName, { color: C.text }]} numberOfLines={1}>
              {appt.customerName}
            </Text>
            <Text style={[styles.serviceName, { color: C.textSecondary }]} numberOfLines={1}>
              {appt.service || "Hizmet belirtilmedi"}
            </Text>
            {appt.customerPhone ? (
              <View style={styles.phoneRow}>
                <Feather name="phone" size={11} color={C.textMuted} />
                <Text style={[styles.phoneText, { color: C.textMuted }]}>{appt.customerPhone}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.cardRight}>
            <StatusBadge status={appt.status} />
            {appt.price > 0 && (
              <Text style={[styles.priceText, { color: C.primary }]}>
                {appt.price.toLocaleString("tr-TR")} ₺
              </Text>
            )}
          </View>
        </View>

        {appt.duration > 0 && (
          <View style={[styles.cardFooter, { borderTopColor: C.border }]}>
            <Feather name="clock" size={11} color={C.textMuted} />
            <Text style={[styles.footerText, { color: C.textMuted }]}>{appt.duration} dakika</Text>
            {appt.note ? (
              <>
                <Text style={[styles.footerDot, { color: C.textMuted }]}>·</Text>
                <Feather name="file-text" size={11} color={C.textMuted} />
                <Text style={[styles.footerText, { color: C.textMuted }]} numberOfLines={1}>{appt.note}</Text>
              </>
            ) : null}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function DailyScreen() {
  const C = Colors.light;
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getAppointmentsByDate, refresh, isLoading } = useData();

  const [selectedDate, setSelectedDate] = useState(new Date());

  const ds = toDateStr(selectedDate);
  const appts = getAppointmentsByDate(ds);

  const totalRevenue = appts.filter((a) => a.status !== "iptal" && a.price > 0).reduce((s, a) => s + a.price, 0);
  const completed = appts.filter((a) => a.status === "tamamlandı").length;
  const pending = appts.filter((a) => a.status === "beklemede").length;

  const goDay = (n: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDate((d) => addDays(d, n));
  };

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: Platform.OS === "web" ? insets.top + 67 : insets.top + 16,
            paddingBottom: Platform.OS === "web" ? 34 + 100 : insets.bottom + 100,
          },
        ]}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={C.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.topRow}>
          <View>
            <Text style={[styles.greeting, { color: C.textSecondary }]}>Merhaba,</Text>
            <Text style={[styles.userName, { color: C.text }]}>{user?.displayName}</Text>
          </View>
          <TouchableOpacity
            style={[styles.avatarBtn, { backgroundColor: C.primaryLight }]}
            onPress={() => router.push("/(tabs)/settings")}
          >
            <Text style={[styles.avatarText, { color: C.primary }]}>
              {user?.displayName?.[0]?.toUpperCase() ?? "?"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date navigator */}
        <View style={[styles.dateNav, { backgroundColor: C.primary }]}>
          <TouchableOpacity style={styles.navArrow} onPress={() => goDay(-1)}>
            <Feather name="chevron-left" size={24} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>

          <View style={styles.dateCenter}>
            <Text style={styles.dateDayLabel}>{formatDayLabel(selectedDate)}</Text>
            <Text style={styles.dateFullLabel}>
              {selectedDate.getDate()} {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </Text>
            <Text style={styles.dateDayName}>{DAYS[selectedDate.getDay()]}</Text>
          </View>

          <TouchableOpacity style={styles.navArrow} onPress={() => goDay(1)}>
            <Feather name="chevron-right" size={24} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: C.surface }]}>
            <Text style={[styles.statNum, { color: C.primary }]}>{appts.length}</Text>
            <Text style={[styles.statLbl, { color: C.textSecondary }]}>Randevu</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: C.surface }]}>
            <Text style={[styles.statNum, { color: C.success }]}>{completed}</Text>
            <Text style={[styles.statLbl, { color: C.textSecondary }]}>Tamamlandı</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: C.surface }]}>
            <Text style={[styles.statNum, { color: C.warning }]}>{pending}</Text>
            <Text style={[styles.statLbl, { color: C.textSecondary }]}>Bekliyor</Text>
          </View>
          {totalRevenue > 0 && (
            <View style={[styles.statBox, { backgroundColor: C.surface }]}>
              <Text style={[styles.statNum, { color: C.primary, fontSize: 15 }]}>{totalRevenue.toLocaleString("tr-TR")} ₺</Text>
              <Text style={[styles.statLbl, { color: C.textSecondary }]}>Gelir</Text>
            </View>
          )}
        </View>

        {/* Appointment list */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>
            {appts.length > 0 ? `${appts.length} Randevu` : "Randevular"}
          </Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/calendar")}>
            <Text style={[styles.calLink, { color: C.primary }]}>Takvim →</Text>
          </TouchableOpacity>
        </View>

        {appts.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: C.surface }]}>
            <Feather name="calendar" size={42} color={C.textMuted} />
            <Text style={[styles.emptyTitle, { color: C.textSecondary }]}>Bu gün randevu yok</Text>
            <Text style={[styles.emptyDesc, { color: C.textMuted }]}>
              Aşağıdaki butona basarak yeni randevu ekleyebilirsiniz.
            </Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {appts.map((a, i) => (
              <AppointmentRow key={a.id} appt={a} index={i} />
            ))}
            <View style={styles.timelineEnd}>
              <View style={[styles.timeDotEnd, { backgroundColor: C.border }]} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: C.primary, bottom: Platform.OS === "web" ? 100 : insets.bottom + 84 + 16 }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push(`/add-appointment?date=${ds}`);
        }}
        activeOpacity={0.85}
      >
        <Feather name="plus" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { paddingHorizontal: 20 },

  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular" },
  userName: { fontSize: 22, fontFamily: "Inter_700Bold" },
  avatarBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 18, fontFamily: "Inter_700Bold" },

  dateNav: {
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    overflow: "hidden",
  },
  navArrow: { width: 52, height: 90, alignItems: "center", justifyContent: "center" },
  dateCenter: { flex: 1, alignItems: "center", paddingVertical: 16, gap: 2 },
  dateDayLabel: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Inter_500Medium", letterSpacing: 0.5 },
  dateFullLabel: { color: "#fff", fontSize: 22, fontFamily: "Inter_700Bold" },
  dateDayName: { color: "rgba(255,255,255,0.75)", fontSize: 13, fontFamily: "Inter_400Regular" },

  statsRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  statBox: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: "center", gap: 2 },
  statNum: { fontSize: 18, fontFamily: "Inter_700Bold" },
  statLbl: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },

  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  calLink: { fontSize: 13, fontFamily: "Inter_500Medium" },

  emptyBox: { borderRadius: 20, padding: 40, alignItems: "center", gap: 10 },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginTop: 4 },
  emptyDesc: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },

  timeline: { gap: 0 },
  rowOuter: { flexDirection: "row", gap: 12, marginBottom: 12 },
  timelineCol: { width: 20, alignItems: "center", paddingTop: 18 },
  timeDot: { width: 12, height: 12, borderRadius: 6 },
  timelineLine: { flex: 1, width: 2, marginTop: 4 },
  timelineEnd: { paddingLeft: 4 },
  timeDotEnd: { width: 12, height: 12, borderRadius: 6 },

  card: { flex: 1, borderRadius: 16, overflow: "hidden" },
  cardTop: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  timeBox: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", flexDirection: "row" },
  timeHour: { fontSize: 17, fontFamily: "Inter_700Bold" },
  timeMin: { fontSize: 12, fontFamily: "Inter_500Medium", marginTop: 2 },
  cardMiddle: { flex: 1, gap: 3 },
  customerName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  serviceName: { fontSize: 12, fontFamily: "Inter_400Regular" },
  phoneRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  phoneText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  cardRight: { alignItems: "flex-end", gap: 6 },
  priceText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  cardFooter: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderTopWidth: 1 },
  footerText: { fontSize: 11, fontFamily: "Inter_400Regular", flex: 1 },
  footerDot: { fontSize: 14 },

  fab: {
    position: "absolute",
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});
