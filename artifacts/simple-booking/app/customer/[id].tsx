import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
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
import { useData } from "@/context/DataContext";

const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

function formatDate(ds: string) {
  const [y, m, d] = ds.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export default function CustomerDetailScreen() {
  const C = Colors.light;
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { customers, appointments, deleteCustomer } = useData();

  const customer = customers.find((c) => c.id === id);
  const customerAppts = appointments
    .filter((a) => a.customerId === id)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (!customer) {
    return (
      <View style={[styles.root, { backgroundColor: C.background, alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ color: C.textSecondary, fontFamily: "Inter_400Regular" }}>Müşteri bulunamadı.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12, padding: 12 }}>
          <Text style={{ color: C.primary, fontFamily: "Inter_600SemiBold" }}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Müşteriyi Sil",
      `"${customer.name}" ve ilgili tüm randevuları silinecek. Emin misiniz?`,
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            await deleteCustomer(id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
          },
        },
      ]
    );
  };

  const statusColors = {
    beklemede: Colors.light.warning,
    tamamlandı: Colors.light.success,
    iptal: Colors.light.danger,
  };

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      <View
        style={[
          styles.navBar,
          {
            paddingTop: Platform.OS === "web" ? insets.top + 67 : insets.top + 16,
            backgroundColor: C.background,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: C.text }]}>Müşteri Detayı</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Feather name="trash-2" size={20} color={C.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, { backgroundColor: C.primary }]}>
          <View style={styles.heroAvatar}>
            <Text style={styles.heroAvatarText}>{customer.name[0]?.toUpperCase()}</Text>
          </View>
          <Text style={styles.heroName}>{customer.name}</Text>
          {customer.phone ? (
            <Text style={styles.heroPhone}>{customer.phone}</Text>
          ) : null}
          <Text style={styles.heroSince}>
            Kayıt: {new Date(customer.createdAt).toLocaleDateString("tr-TR")}
          </Text>
        </View>

        <View style={styles.statsRow}>
          {[
            { label: "Randevu", count: customerAppts.length },
            {
              label: "Tamamlandı",
              count: customerAppts.filter((a) => a.status === "tamamlandı").length,
            },
            {
              label: "Toplam Gelir",
              count: customerAppts.filter((a) => a.status === "tamamlandı").reduce((sum, a) => sum + a.price, 0),
              suffix: " ₺",
            },
          ].map((s) => (
            <View key={s.label} style={[styles.statBox, { backgroundColor: C.surface }]}>
              <Text style={[styles.statCount, { color: C.primary }]}>
                {s.count}{s.suffix ?? ""}
              </Text>
              <Text style={[styles.statLabel, { color: C.textSecondary }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {customer.note ? (
          <View style={[styles.noteBox, { backgroundColor: C.surface }]}>
            <Feather name="file-text" size={16} color={C.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.noteLabel, { color: C.textSecondary }]}>Not</Text>
              <Text style={[styles.noteText, { color: C.text }]}>{customer.note}</Text>
            </View>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.addApptBtn, { backgroundColor: C.primary }]}
          onPress={() => router.push({ pathname: "/add-appointment", params: { customerId: id } })}
          activeOpacity={0.85}
        >
          <Feather name="plus" size={18} color="#fff" />
          <Text style={styles.addApptBtnText}>Randevu Ekle</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: C.text }]}>
          Geçmiş Randevular ({customerAppts.length})
        </Text>

        {customerAppts.length === 0 ? (
          <View style={styles.emptyBox}>
            <Feather name="calendar" size={32} color={C.textMuted} />
            <Text style={[styles.emptyText, { color: C.textSecondary }]}>
              Henüz randevu yok
            </Text>
          </View>
        ) : (
          <View style={styles.apptList}>
            {customerAppts.map((a) => (
              <TouchableOpacity
                key={a.id}
                style={[styles.apptCard, { backgroundColor: C.surface }]}
                onPress={() => router.push(`/appointment/${a.id}`)}
                activeOpacity={0.85}
              >
                <View style={[styles.apptTimePill, { backgroundColor: C.primaryLight }]}>
                  <Text style={[styles.apptTime, { color: C.primary }]}>{a.time}</Text>
                  <Text style={[styles.apptDate, { color: C.primary }]}>{formatDate(a.date)}</Text>
                </View>
                <View style={styles.apptInfo}>
                  <Text style={[styles.apptService, { color: C.text }]}>{a.service || "—"}</Text>
                  {a.price > 0 && (
                    <Text style={[styles.apptPrice, { color: C.textSecondary }]}>
                      {a.price.toLocaleString("tr-TR")} ₺
                    </Text>
                  )}
                </View>
                <View style={[styles.statusDot, { backgroundColor: statusColors[a.status] }]} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  deleteBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  navTitle: { flex: 1, textAlign: "center", fontSize: 17, fontFamily: "Inter_600SemiBold" },
  container: { paddingHorizontal: 20, gap: 14, paddingTop: 8 },
  heroCard: { borderRadius: 20, padding: 24, alignItems: "center", gap: 6 },
  heroAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  heroAvatarText: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#fff" },
  heroName: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  heroPhone: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },
  heroSince: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.65)" },
  statsRow: { flexDirection: "row", gap: 10 },
  statBox: { flex: 1, borderRadius: 12, padding: 12, alignItems: "center" },
  statCount: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2, textAlign: "center" },
  noteBox: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 12,
    gap: 10,
    alignItems: "flex-start",
  },
  noteLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  noteText: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 4, lineHeight: 20 },
  addApptBtn: {
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addApptBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  emptyBox: { alignItems: "center", paddingVertical: 24, gap: 8 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  apptList: { gap: 10 },
  apptCard: {
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  apptTimePill: { padding: 12, alignItems: "center", minWidth: 80 },
  apptTime: { fontSize: 14, fontFamily: "Inter_700Bold" },
  apptDate: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  apptInfo: { flex: 1, paddingHorizontal: 12, paddingVertical: 10 },
  apptService: { fontSize: 14, fontFamily: "Inter_500Medium" },
  apptPrice: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 14 },
});
