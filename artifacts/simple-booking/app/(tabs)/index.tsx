import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
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

function todayLabel() {
  const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  const d = new Date();
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
}

function AppointmentCard({ appt }: { appt: Appointment }) {
  const C = Colors.light;
  const statusColors = {
    beklemede: { bg: C.warningLight, text: C.warning },
    tamamlandı: { bg: C.successLight, text: C.success },
    iptal: { bg: C.dangerLight, text: C.danger },
  };
  const sc = statusColors[appt.status];

  return (
    <TouchableOpacity
      style={[styles.apptCard, { backgroundColor: C.surface }]}
      activeOpacity={0.85}
      onPress={() => router.push(`/appointment/${appt.id}`)}
    >
      <View style={[styles.timeBar, { backgroundColor: C.primaryLight }]}>
        <Text style={[styles.timeText, { color: C.primary }]}>{appt.time}</Text>
      </View>
      <View style={styles.apptInfo}>
        <Text style={[styles.apptName, { color: C.text }]} numberOfLines={1}>
          {appt.customerName}
        </Text>
        <Text style={[styles.apptService, { color: C.textSecondary }]} numberOfLines={1}>
          {appt.service || "Hizmet belirtilmedi"}
        </Text>
        {appt.price > 0 && (
          <Text style={[styles.apptPrice, { color: C.textMuted }]}>
            {appt.price.toLocaleString("tr-TR")} ₺
          </Text>
        )}
      </View>
      <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
        <Text style={[styles.statusText, { color: sc.text }]}>{appt.status}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const C = Colors.light;
  const { user } = useAuth();
  const { getTodayAppointments, refresh, isLoading } = useData();
  const insets = useSafeAreaInsets();

  const todayAppts = getTodayAppointments();

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: Platform.OS === "web" ? insets.top + 67 : insets.top + 16,
            paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 84 + 16,
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={C.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <View>
            <Text style={[styles.greeting, { color: C.textSecondary }]}>
              Hoş geldiniz,
            </Text>
            <Text style={[styles.userName, { color: C.text }]}>
              {user?.displayName} 👋
            </Text>
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

        <View style={[styles.dateCard, { backgroundColor: C.primary }]}>
          <Feather name="calendar" size={20} color="rgba(255,255,255,0.8)" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.dateLabel}>Bugün</Text>
            <Text style={styles.dateValue}>{todayLabel()}</Text>
          </View>
          <View style={[styles.countBadge]}>
            <Text style={styles.countText}>{todayAppts.length}</Text>
            <Text style={styles.countSub}>randevu</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: C.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/add-appointment");
            }}
            activeOpacity={0.85}
          >
            <Feather name="plus-circle" size={22} color="#fff" />
            <Text style={styles.quickBtnText}>Randevu Ekle</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/add-customer");
            }}
            activeOpacity={0.85}
          >
            <Feather name="user-plus" size={22} color={C.primary} />
            <Text style={[styles.quickBtnText, { color: C.primary }]}>Müşteri Ekle</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: C.text }]}>
              Bugünün Randevuları
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/calendar")}>
              <Text style={[styles.seeAll, { color: C.primary }]}>Takvim →</Text>
            </TouchableOpacity>
          </View>

          {todayAppts.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: C.surface }]}>
              <Feather name="calendar" size={36} color={C.textMuted} />
              <Text style={[styles.emptyTitle, { color: C.textSecondary }]}>
                Bugün randevu yok
              </Text>
              <Text style={[styles.emptyDesc, { color: C.textMuted }]}>
                Yeni randevu eklemek için yukarıdaki butonu kullanın.
              </Text>
            </View>
          ) : (
            <View style={styles.apptList}>
              {todayAppts.map((a) => (
                <AppointmentCard key={a.id} appt={a} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { paddingHorizontal: 20 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular" },
  userName: { fontSize: 22, fontFamily: "Inter_700Bold" },
  avatarBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 18, fontFamily: "Inter_700Bold" },
  dateCard: {
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dateLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontFamily: "Inter_400Regular" },
  dateValue: { color: "#fff", fontSize: 17, fontFamily: "Inter_600SemiBold" },
  countBadge: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  countText: { color: "#fff", fontSize: 22, fontFamily: "Inter_700Bold", lineHeight: 26 },
  countSub: { color: "rgba(255,255,255,0.8)", fontSize: 11, fontFamily: "Inter_400Regular" },
  quickActions: { flexDirection: "row", gap: 12, marginBottom: 24 },
  quickBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  quickBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  section: { gap: 12 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  seeAll: { fontSize: 13, fontFamily: "Inter_500Medium" },
  emptyBox: {
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginTop: 4 },
  emptyDesc: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  apptList: { gap: 10 },
  apptCard: {
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  timeBar: { width: 64, alignItems: "center", justifyContent: "center", paddingVertical: 16 },
  timeText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  apptInfo: { flex: 1, paddingHorizontal: 14, paddingVertical: 12 },
  apptName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  apptService: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  apptPrice: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  statusBadge: { marginRight: 14, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontFamily: "Inter_500Medium" },
});
