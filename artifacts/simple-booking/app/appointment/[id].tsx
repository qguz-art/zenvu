import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
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

export default function AppointmentDetailScreen() {
  const C = Colors.light;
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appointments, updateAppointment, deleteAppointment } = useData();

  const appt = appointments.find((a) => a.id === id);

  if (!appt) {
    return (
      <View style={[styles.root, { backgroundColor: C.background, alignItems: "center", justifyContent: "center" }]}>
        <Text style={[styles.notFound, { color: C.textSecondary }]}>Randevu bulunamadı.</Text>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backLink, { backgroundColor: C.primaryLight }]}>
          <Text style={{ color: C.primary, fontFamily: "Inter_600SemiBold" }}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusColors = {
    beklemede: { bg: C.warningLight, text: C.warning },
    tamamlandı: { bg: C.successLight, text: C.success },
    iptal: { bg: C.dangerLight, text: C.danger },
  };
  const sc = statusColors[appt.status];

  const handleStatus = (newStatus: "beklemede" | "tamamlandı" | "iptal") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateAppointment(id, { status: newStatus });
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Randevu Sil", "Bu randevu silinecek. Emin misiniz?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          await deleteAppointment(id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.back();
        },
      },
    ]);
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
        <Text style={[styles.navTitle, { color: C.text }]}>Randevu Detayı</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteNavBtn}>
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
          <View style={styles.heroAvatarBox}>
            <Text style={styles.heroAvatarText}>{appt.customerName[0]?.toUpperCase()}</Text>
          </View>
          <Text style={styles.heroName}>{appt.customerName}</Text>
          <Text style={styles.heroDate}>{formatDate(appt.date)} — {appt.time}</Text>
          <View style={[styles.heroStatus, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Text style={styles.heroStatusText}>{appt.status}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          {[
            ...(appt.customerPhone ? [{ icon: "phone" as const, label: "Telefon", value: appt.customerPhone }] : []),
            { icon: "scissors" as const, label: "Hizmet", value: appt.service || "—" },
            { icon: "clock" as const, label: "Süre", value: `${appt.duration} dakika` },
            { icon: "tag" as const, label: "Ücret", value: appt.price > 0 ? `${appt.price.toLocaleString("tr-TR")} ₺` : "Belirtilmedi" },
            { icon: "calendar" as const, label: "Tarih", value: formatDate(appt.date) },
            { icon: "clock" as const, label: "Saat", value: appt.time },
          ].map((row) => (
            <View key={row.label} style={[styles.infoRow, { backgroundColor: C.surface }]}>
              <View style={[styles.infoIcon, { backgroundColor: C.primaryLight }]}>
                <Feather name={row.icon} size={16} color={C.primary} />
              </View>
              <Text style={[styles.infoLabel, { color: C.textSecondary }]}>{row.label}</Text>
              <Text style={[styles.infoValue, { color: C.text }]}>{row.value}</Text>
            </View>
          ))}

          {appt.note ? (
            <View style={[styles.noteBox, { backgroundColor: C.surface }]}>
              <Feather name="file-text" size={16} color={C.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoLabel, { color: C.textSecondary }]}>Not</Text>
                <Text style={[styles.noteText, { color: C.text }]}>{appt.note}</Text>
              </View>
            </View>
          ) : null}
        </View>

        <Text style={[styles.sectionTitle, { color: C.text }]}>Durum Güncelle</Text>
        <View style={styles.statusBtns}>
          {(["beklemede", "tamamlandı", "iptal"] as const).map((s) => {
            const sc2 = statusColors[s];
            const selected = s === appt.status;
            return (
              <TouchableOpacity
                key={s}
                style={[
                  styles.statusBtn,
                  {
                    backgroundColor: selected ? sc2.bg : C.surface,
                    borderColor: selected ? sc2.text : C.border,
                  },
                ]}
                onPress={() => handleStatus(s)}
              >
                <Text style={[styles.statusBtnText, { color: selected ? sc2.text : C.textMuted }]}>
                  {s}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
  deleteNavBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  navTitle: { flex: 1, textAlign: "center", fontSize: 17, fontFamily: "Inter_600SemiBold" },
  container: { paddingHorizontal: 20, gap: 12, paddingTop: 8 },
  heroCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  heroAvatarBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  heroAvatarText: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff" },
  heroName: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  heroDate: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },
  heroStatus: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginTop: 4 },
  heroStatusText: { color: "#fff", fontSize: 13, fontFamily: "Inter_500Medium" },
  infoSection: { gap: 8 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  infoIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  infoLabel: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  infoValue: { fontSize: 15, fontFamily: "Inter_500Medium" },
  noteBox: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 12,
    gap: 12,
    alignItems: "flex-start",
  },
  noteText: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 4, lineHeight: 20 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginTop: 4 },
  statusBtns: { flexDirection: "row", gap: 10 },
  statusBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center", borderWidth: 1 },
  statusBtnText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  notFound: { fontSize: 16, fontFamily: "Inter_400Regular", marginBottom: 16 },
  backLink: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
});
