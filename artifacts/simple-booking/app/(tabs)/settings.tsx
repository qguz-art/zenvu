import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Alert,
  Platform,
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

function SettingRow({
  icon,
  label,
  value,
  onPress,
  danger,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  const C = Colors.light;
  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: C.surface }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.rowIcon, { backgroundColor: danger ? C.dangerLight : C.primaryLight }]}>
        <Feather name={icon} size={18} color={danger ? C.danger : C.primary} />
      </View>
      <Text style={[styles.rowLabel, { color: danger ? C.danger : C.text }]}>{label}</Text>
      <View style={{ flex: 1 }} />
      {value ? <Text style={[styles.rowValue, { color: C.textMuted }]}>{value}</Text> : null}
      {onPress ? <Feather name="chevron-right" size={18} color={C.textMuted} /> : null}
    </TouchableOpacity>
  );
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " ₺";
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function thisMonthPrefix(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function SettingsScreen() {
  const C = Colors.light;
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { customers, appointments } = useData();

  const activeAppts = appointments.filter((a) => a.status !== "iptal" && a.price > 0);
  const dailyIncome = activeAppts
    .filter((a) => a.date === todayStr())
    .reduce((sum, a) => sum + a.price, 0);
  const monthlyIncome = activeAppts
    .filter((a) => a.date.startsWith(thisMonthPrefix()))
    .reduce((sum, a) => sum + a.price, 0);

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Çıkış Yap", "Hesabınızdan çıkış yapmak istiyor musunuz?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Çıkış Yap",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

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
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: C.text }]}>Ayarlar</Text>

        <View style={[styles.profileCard, { backgroundColor: C.primary }]}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {user?.displayName?.[0]?.toUpperCase() ?? "?"}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{user?.displayName}</Text>
            <Text style={styles.profileUsername}>@{user?.username}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          {[
            { label: "Müşteri", count: customers.length },
            {
              label: "Randevu",
              count: appointments.length,
            },
            {
              label: "Tamamlandı",
              count: appointments.filter((a) => a.status === "tamamlandı").length,
            },
          ].map((s) => (
            <View key={s.label} style={[styles.statBox, { backgroundColor: C.surface }]}>
              <Text style={[styles.statCount, { color: C.primary }]}>{s.count}</Text>
              <Text style={[styles.statLabel, { color: C.textSecondary }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: C.textMuted }]}>GELİR</Text>
        <View style={[styles.incomeRow, { marginBottom: 24 }]}>
          <View style={[styles.incomeBox, { backgroundColor: C.surface }]}>
            <View style={[styles.incomeIconWrap, { backgroundColor: C.primaryLight }]}>
              <Feather name="sun" size={16} color={C.primary} />
            </View>
            <Text style={[styles.incomeLabel, { color: C.textSecondary }]}>Günlük Gelir</Text>
            <Text style={[styles.incomeAmount, { color: C.primary }]}>{formatCurrency(dailyIncome)}</Text>
          </View>
          <View style={[styles.incomeBox, { backgroundColor: C.surface }]}>
            <View style={[styles.incomeIconWrap, { backgroundColor: C.successLight }]}>
              <Feather name="trending-up" size={16} color={C.success} />
            </View>
            <Text style={[styles.incomeLabel, { color: C.textSecondary }]}>Aylık Gelir</Text>
            <Text style={[styles.incomeAmount, { color: C.success }]}>{formatCurrency(monthlyIncome)}</Text>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: C.textMuted }]}>HESAP</Text>
        <View style={styles.section}>
          <SettingRow icon="user" label="Kullanıcı Adı" value={user?.username} />
          <SettingRow icon="mail" label="E-posta" value={user?.email} />
          <SettingRow
            icon="calendar"
            label="Üyelik Tarihi"
            value={user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString("tr-TR")
              : "—"}
          />
        </View>

        <Text style={[styles.sectionLabel, { color: C.textMuted }]}>UYGULAMA</Text>
        <View style={styles.section}>
          <SettingRow icon="info" label="Versiyon" value="1.0.0" />
          <SettingRow icon="shield" label="Gizlilik Politikası" onPress={() => {}} />
        </View>

        <View style={styles.section}>
          <SettingRow
            icon="log-out"
            label="Çıkış Yap"
            onPress={handleLogout}
            danger
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { paddingHorizontal: 20, gap: 0 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 20 },
  profileCard: {
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileAvatarText: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  profileName: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
  profileUsername: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)" },
  profileEmail: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.65)", marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  statBox: { flex: 1, borderRadius: 12, padding: 14, alignItems: "center" },
  statCount: { fontSize: 24, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  sectionLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 8, marginTop: 4 },
  section: { borderRadius: 14, overflow: "hidden", marginBottom: 20, gap: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  rowIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rowLabel: { fontSize: 15, fontFamily: "Inter_400Regular" },
  rowValue: { fontSize: 14, fontFamily: "Inter_400Regular", marginRight: 6 },
  incomeRow: { flexDirection: "row", gap: 10 },
  incomeBox: { flex: 1, borderRadius: 14, padding: 16, alignItems: "flex-start", gap: 6 },
  incomeIconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  incomeLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  incomeAmount: { fontSize: 20, fontFamily: "Inter_700Bold" },
});
