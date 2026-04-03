import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";

const SECTIONS = [
  {
    title: "1. Toplanan Bilgiler",
    body: "Uygulama aşağıdaki bilgileri toplayabilir:\n• Müşteri adı, telefon numarası ve notlar (kullanıcı tarafından girilir)\n• Randevu tarih ve saat bilgileri\n• Cihaz bilgileri (reklam ve analiz için)",
  },
  {
    title: "2. Bilgilerin Kullanımı",
    body: "Toplanan bilgiler:\n• Randevu ve müşteri yönetimini sağlamak\n• Uygulamayı geliştirmek\n• Kullanıcı deneyimini iyileştirmek\namacıyla kullanılır.",
  },
  {
    title: "3. Reklamlar",
    body: "Uygulama, üçüncü taraf reklam hizmetleri kullanabilir (örneğin Google AdMob). Bu hizmetler, kullanıcıya daha uygun reklamlar göstermek için bazı anonim verileri toplayabilir.",
  },
  {
    title: "4. Veri Güvenliği",
    body: "Kullanıcı verileri güvenli şekilde saklanır ve üçüncü kişilerle izinsiz paylaşılmaz.",
  },
  {
    title: "5. Üçüncü Taraf Hizmetler",
    body: "Uygulama aşağıdaki hizmetleri kullanabilir:\n• Google AdMob (reklam)\n• Firebase (veri saklama ve analiz)\n\nBu hizmetlerin kendi gizlilik politikaları geçerlidir.",
  },
  {
    title: "6. Kullanıcı Hakları",
    body: "Kullanıcılar istedikleri zaman:\n• Verilerini silebilir\n• Uygulamayı kullanmayı bırakabilir",
  },
  {
    title: "7. Değişiklikler",
    body: "Bu gizlilik politikası zaman zaman güncellenebilir.",
  },
  {
    title: "8. İletişim",
    body: "Herhangi bir soru için:\ngrinderron7@gmail.com",
  },
];

export default function PrivacyPolicyScreen() {
  const C = Colors.light;
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      <View
        style={[
          styles.navBar,
          {
            paddingTop: Platform.OS === "web" ? insets.top + 67 : insets.top + 16,
            backgroundColor: C.background,
            borderBottomColor: C.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: C.text }]}>Gizlilik Politikası</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: Platform.OS === "web" ? 40 : insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.headerBox, { backgroundColor: C.primaryLight }]}>
          <Feather name="shield" size={28} color={C.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: C.primary }]}>Gizlilik Politikası</Text>
            <Text style={[styles.headerDate, { color: C.textSecondary }]}>Son güncelleme: 2026</Text>
          </View>
        </View>

        <Text style={[styles.intro, { color: C.textSecondary }]}>
          Bu uygulama, kullanıcıların randevu ve müşteri yönetimini kolaylaştırmak amacıyla geliştirilmiştir. Gizliliğiniz bizim için önemlidir.
        </Text>

        {SECTIONS.map((s) => (
          <View key={s.title} style={[styles.section, { backgroundColor: C.surface }]}>
            <Text style={[styles.sectionTitle, { color: C.text }]}>{s.title}</Text>
            <Text style={[styles.sectionBody, { color: C.textSecondary }]}>{s.body}</Text>
          </View>
        ))}
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
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  navTitle: { flex: 1, textAlign: "center", fontSize: 17, fontFamily: "Inter_600SemiBold" },
  container: { padding: 20, gap: 12 },
  headerBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
    borderRadius: 16,
  },
  headerTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  headerDate: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  intro: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  section: {
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  sectionTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  sectionBody: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 21 },
});
