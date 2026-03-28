import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import Colors from "@/constants/colors";
import { useData } from "@/context/DataContext";

const SERVICES = [
  "Saç Kesimi",
  "Saç Boyama",
  "Fön",
  "Tıraş",
  "Sakal Düzeltme",
  "Manikür",
  "Pedikür",
  "Masaj",
  "Cilt Bakımı",
  "Diğer",
];

const STATUS_OPTIONS: Array<"beklemede" | "tamamlandı" | "iptal"> = ["beklemede", "tamamlandı", "iptal"];

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function AddAppointmentScreen() {
  const C = Colors.light;
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ customerId?: string }>();
  const { customers, addAppointment } = useData();

  const preselected = customers.find((c) => c.id === params.customerId);

  const [selectedCustomerId, setSelectedCustomerId] = useState(preselected?.id ?? "");
  const [selectedCustomerName, setSelectedCustomerName] = useState(preselected?.name ?? "");
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState("10:00");
  const [service, setService] = useState(SERVICES[0]);
  const [showServicePicker, setShowServicePicker] = useState(false);
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("60");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"beklemede" | "tamamlandı" | "iptal">("beklemede");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const noteRef = useRef<TextInput>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!selectedCustomerId) errs.customer = "Müşteri seçiniz.";
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) errs.date = "Geçerli bir tarih giriniz (YYYY-AA-GG).";
    if (!time.match(/^\d{1,2}:\d{2}$/)) errs.time = "Geçerli bir saat giriniz (SS:DD).";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await addAppointment({
        customerId: selectedCustomerId,
        customerName: selectedCustomerName,
        date,
        time,
        service,
        duration: parseInt(duration) || 60,
        price: parseFloat(price) || 0,
        note: note.trim(),
        status,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    beklemede: { bg: C.warningLight, text: C.warning },
    tamamlandı: { bg: C.successLight, text: C.success },
    iptal: { bg: C.dangerLight, text: C.danger },
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
        <Text style={[styles.navTitle, { color: C.text }]}>Randevu Ekle</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.container,
          { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={20}
      >
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: C.textSecondary }]}>Müşteri *</Text>
          <TouchableOpacity
            style={[
              styles.pickerBtn,
              {
                backgroundColor: C.surface,
                borderColor: errors.customer ? C.danger : C.border,
              },
            ]}
            onPress={() => setShowCustomerPicker((s) => !s)}
          >
            <Feather name="user" size={18} color={C.textMuted} />
            <Text
              style={[
                styles.pickerText,
                { color: selectedCustomerName ? C.text : C.textMuted },
              ]}
            >
              {selectedCustomerName || "Müşteri seçin..."}
            </Text>
            <Feather name={showCustomerPicker ? "chevron-up" : "chevron-down"} size={18} color={C.textMuted} />
          </TouchableOpacity>
          {errors.customer ? (
            <Text style={[styles.fieldError, { color: C.danger }]}>{errors.customer}</Text>
          ) : null}
          {showCustomerPicker && (
            <View style={[styles.dropdown, { backgroundColor: C.surface, borderColor: C.border }]}>
              {customers.length === 0 ? (
                <Text style={[styles.dropdownEmpty, { color: C.textMuted }]}>Henüz müşteri yok</Text>
              ) : (
                <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                  {customers.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        styles.dropdownItem,
                        selectedCustomerId === c.id && { backgroundColor: C.primaryLight },
                      ]}
                      onPress={() => {
                        setSelectedCustomerId(c.id);
                        setSelectedCustomerName(c.name);
                        setShowCustomerPicker(false);
                        setErrors((e) => { const n = { ...e }; delete n.customer; return n; });
                      }}
                    >
                      <Text style={[styles.dropdownItemText, { color: selectedCustomerId === c.id ? C.primary : C.text }]}>
                        {c.name}
                      </Text>
                      {c.phone ? (
                        <Text style={[styles.dropdownItemSub, { color: C.textMuted }]}>{c.phone}</Text>
                      ) : null}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
        </View>

        <View style={styles.row2}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: C.textSecondary }]}>Tarih *</Text>
            <View
              style={[
                styles.inputRow,
                { backgroundColor: C.surface, borderColor: errors.date ? C.danger : C.border },
              ]}
            >
              <Feather name="calendar" size={16} color={C.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: C.text }]}
                placeholder="2024-03-28"
                placeholderTextColor={C.textMuted}
                value={date}
                onChangeText={(t) => {
                  setDate(t);
                  if (errors.date) setErrors((e) => { const n = { ...e }; delete n.date; return n; });
                }}
                returnKeyType="next"
              />
            </View>
            {errors.date ? <Text style={[styles.fieldError, { color: C.danger }]}>{errors.date}</Text> : null}
          </View>

          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: C.textSecondary }]}>Saat *</Text>
            <View
              style={[
                styles.inputRow,
                { backgroundColor: C.surface, borderColor: errors.time ? C.danger : C.border },
              ]}
            >
              <Feather name="clock" size={16} color={C.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: C.text }]}
                placeholder="10:30"
                placeholderTextColor={C.textMuted}
                value={time}
                onChangeText={(t) => {
                  setTime(t);
                  if (errors.time) setErrors((e) => { const n = { ...e }; delete n.time; return n; });
                }}
                keyboardType="numbers-and-punctuation"
                returnKeyType="next"
              />
            </View>
            {errors.time ? <Text style={[styles.fieldError, { color: C.danger }]}>{errors.time}</Text> : null}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: C.textSecondary }]}>Hizmet</Text>
          <TouchableOpacity
            style={[styles.pickerBtn, { backgroundColor: C.surface, borderColor: C.border }]}
            onPress={() => setShowServicePicker((s) => !s)}
          >
            <Feather name="scissors" size={18} color={C.textMuted} />
            <Text style={[styles.pickerText, { color: C.text }]}>{service}</Text>
            <Feather name={showServicePicker ? "chevron-up" : "chevron-down"} size={18} color={C.textMuted} />
          </TouchableOpacity>
          {showServicePicker && (
            <View style={[styles.dropdown, { backgroundColor: C.surface, borderColor: C.border }]}>
              <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                {SERVICES.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.dropdownItem,
                      service === s && { backgroundColor: C.primaryLight },
                    ]}
                    onPress={() => {
                      setService(s);
                      setShowServicePicker(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, { color: service === s ? C.primary : C.text }]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <View style={styles.row2}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: C.textSecondary }]}>Ücret (₺)</Text>
            <View style={[styles.inputRow, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Feather name="tag" size={16} color={C.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: C.text }]}
                placeholder="0"
                placeholderTextColor={C.textMuted}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                returnKeyType="next"
              />
            </View>
          </View>

          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: C.textSecondary }]}>Süre (dk)</Text>
            <View style={[styles.inputRow, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Feather name="clock" size={16} color={C.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: C.text }]}
                placeholder="60"
                placeholderTextColor={C.textMuted}
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
                returnKeyType="next"
                onSubmitEditing={() => noteRef.current?.focus()}
              />
            </View>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: C.textSecondary }]}>Durum</Text>
          <View style={styles.statusRow}>
            {STATUS_OPTIONS.map((s) => {
              const sc = statusColors[s];
              const selected = s === status;
              return (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.statusBtn,
                    { backgroundColor: selected ? sc.bg : C.surface, borderColor: selected ? sc.text : C.border },
                  ]}
                  onPress={() => setStatus(s)}
                >
                  <Text style={[styles.statusBtnText, { color: selected ? sc.text : C.textMuted }]}>{s}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: C.textSecondary }]}>Not</Text>
          <View style={[styles.textAreaRow, { backgroundColor: C.surface, borderColor: C.border }]}>
            <TextInput
              ref={noteRef}
              style={[styles.textArea, { color: C.text }]}
              placeholder="Randevu notu..."
              placeholderTextColor={C.textMuted}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              returnKeyType="done"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: C.primary }, loading && styles.btnDisabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Feather name="check" size={20} color="#fff" />
              <Text style={styles.saveBtnText}>Randevu Kaydet</Text>
            </>
          )}
        </TouchableOpacity>
      </KeyboardAwareScrollViewCompat>
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
  navTitle: { flex: 1, textAlign: "center", fontSize: 17, fontFamily: "Inter_600SemiBold" },
  container: { paddingHorizontal: 20, gap: 16, paddingTop: 8 },
  fieldGroup: { gap: 6 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium", marginLeft: 2 },
  row2: { flexDirection: "row", gap: 12 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  pickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    gap: 10,
  },
  pickerText: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  dropdown: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 4,
  },
  dropdownEmpty: { padding: 16, textAlign: "center", fontSize: 14, fontFamily: "Inter_400Regular" },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 12 },
  dropdownItemText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  dropdownItemSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  statusRow: { flexDirection: "row", gap: 8 },
  statusBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  statusBtnText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  textAreaRow: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 80,
  },
  textArea: { fontSize: 15, fontFamily: "Inter_400Regular", textAlignVertical: "top" },
  fieldError: { fontSize: 12, fontFamily: "Inter_400Regular", marginLeft: 2 },
  saveBtn: {
    height: 52,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.7 },
  saveBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
