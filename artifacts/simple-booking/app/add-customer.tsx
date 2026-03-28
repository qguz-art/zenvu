import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
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

export default function AddCustomerScreen() {
  const C = Colors.light;
  const insets = useSafeAreaInsets();
  const { addCustomer } = useData();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const phoneRef = useRef<TextInput>(null);
  const noteRef = useRef<TextInput>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Ad Soyad zorunludur.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await addCustomer({ name: name.trim(), phone: phone.trim(), note: note.trim() });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } finally {
      setLoading(false);
    }
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
        <Text style={[styles.navTitle, { color: C.text }]}>Müşteri Ekle</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.container,
          {
            paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 24,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={20}
      >
        {[
          {
            key: "name",
            label: "Ad Soyad *",
            icon: "user" as const,
            value: name,
            set: setName,
            placeholder: "Örn: Ahmet Yılmaz",
            ref: null,
            next: phoneRef,
            autoCapitalize: "words" as const,
          },
          {
            key: "phone",
            label: "Telefon",
            icon: "phone" as const,
            value: phone,
            set: setPhone,
            placeholder: "0555 123 45 67",
            ref: phoneRef,
            next: noteRef,
            autoCapitalize: "none" as const,
            keyboardType: "phone-pad" as const,
          },
        ].map((f) => (
          <View key={f.key} style={styles.fieldGroup}>
            <Text style={[styles.label, { color: C.textSecondary }]}>{f.label}</Text>
            <View
              style={[
                styles.inputRow,
                {
                  backgroundColor: C.surface,
                  borderColor: errors[f.key] ? C.danger : C.border,
                },
              ]}
            >
              <Feather name={f.icon} size={18} color={C.textMuted} style={styles.inputIcon} />
              <TextInput
                ref={f.ref as any}
                style={[styles.input, { color: C.text }]}
                placeholder={f.placeholder}
                placeholderTextColor={C.textMuted}
                value={f.value}
                onChangeText={(t) => {
                  f.set(t);
                  if (errors[f.key]) setErrors((e) => { const n = { ...e }; delete n[f.key]; return n; });
                }}
                autoCapitalize={f.autoCapitalize}
                autoCorrect={false}
                keyboardType={f.keyboardType}
                returnKeyType="next"
                onSubmitEditing={() => f.next?.current?.focus()}
              />
            </View>
            {errors[f.key] ? (
              <Text style={[styles.fieldError, { color: C.danger }]}>{errors[f.key]}</Text>
            ) : null}
          </View>
        ))}

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: C.textSecondary }]}>Not</Text>
          <View
            style={[
              styles.textAreaRow,
              { backgroundColor: C.surface, borderColor: C.border },
            ]}
          >
            <TextInput
              ref={noteRef}
              style={[styles.textArea, { color: C.text }]}
              placeholder="Müşteri hakkında not (alerjiler, tercihler vb.)"
              placeholderTextColor={C.textMuted}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={4}
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
              <Text style={styles.saveBtnText}>Kaydet</Text>
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
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  textAreaRow: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 100,
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
