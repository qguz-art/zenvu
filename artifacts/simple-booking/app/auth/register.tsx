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
import { useAuth } from "@/context/AuthContext";

export default function RegisterScreen() {
  const { register } = useAuth();
  const insets = useSafeAreaInsets();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const usernameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!displayName.trim()) errs.displayName = "Ad Soyad giriniz.";
    if (!username.trim()) errs.username = "Kullanıcı adını giriniz.";
    else if (username.trim().length < 3) errs.username = "En az 3 karakter olmalıdır.";
    if (!email.trim()) errs.email = "E-posta adresini giriniz.";
    else if (!email.includes("@")) errs.email = "Geçerli bir e-posta giriniz.";
    if (!password) errs.password = "Şifre giriniz.";
    else if (password.length < 6) errs.password = "En az 6 karakter olmalıdır.";
    if (password !== confirmPassword) errs.confirmPassword = "Şifreler eşleşmiyor.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await register({ username, email, displayName, password });
      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace("/(tabs)");
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setErrors({ general: result.error || "Kayıt başarısız." });
      }
    } finally {
      setLoading(false);
    }
  };

  const C = Colors.light;

  const clearErr = (field: string) => setErrors((e) => { const n = { ...e }; delete n[field]; return n; });

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: Platform.OS === "web" ? insets.top + 67 : insets.top + 32,
            paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 24,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={20}
      >
        <View style={styles.header}>
          <View style={[styles.logoBox, { backgroundColor: C.primaryLight }]}>
            <Feather name="user-plus" size={34} color={C.primary} />
          </View>
          <Text style={[styles.title, { color: C.text }]}>Hesap Oluştur</Text>
          <Text style={[styles.subtitle, { color: C.textSecondary }]}>
            Randevu yönetimine başlamak için kayıt olun
          </Text>
        </View>

        {errors.general ? (
          <View style={[styles.errorBanner, { backgroundColor: C.dangerLight }]}>
            <Feather name="alert-circle" size={16} color={C.danger} />
            <Text style={[styles.errorBannerText, { color: C.danger }]}>
              {errors.general}
            </Text>
          </View>
        ) : null}

        <View style={styles.form}>
          {[
            {
              key: "displayName",
              label: "Ad Soyad",
              icon: "user" as const,
              value: displayName,
              set: setDisplayName,
              placeholder: "Ahmet Yılmaz",
              ref: null,
              next: usernameRef,
              autoCapitalize: "words" as const,
            },
            {
              key: "username",
              label: "Kullanıcı Adı",
              icon: "at-sign" as const,
              value: username,
              set: setUsername,
              placeholder: "ahmet_yilmaz",
              ref: usernameRef,
              next: emailRef,
              autoCapitalize: "none" as const,
            },
            {
              key: "email",
              label: "E-posta",
              icon: "mail" as const,
              value: email,
              set: setEmail,
              placeholder: "ornek@mail.com",
              ref: emailRef,
              next: passwordRef,
              autoCapitalize: "none" as const,
              keyboardType: "email-address" as const,
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
                  onChangeText={(t) => { f.set(t); clearErr(f.key); }}
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
            <Text style={[styles.label, { color: C.textSecondary }]}>Şifre</Text>
            <View
              style={[
                styles.inputRow,
                {
                  backgroundColor: C.surface,
                  borderColor: errors.password ? C.danger : C.border,
                },
              ]}
            >
              <Feather name="lock" size={18} color={C.textMuted} style={styles.inputIcon} />
              <TextInput
                ref={passwordRef}
                style={[styles.input, { color: C.text }]}
                placeholder="En az 6 karakter"
                placeholderTextColor={C.textMuted}
                value={password}
                onChangeText={(t) => { setPassword(t); clearErr("password"); }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
              />
              <TouchableOpacity onPress={() => setShowPassword((s) => !s)} style={styles.eyeBtn}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={C.textMuted} />
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text style={[styles.fieldError, { color: C.danger }]}>{errors.password}</Text>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: C.textSecondary }]}>Şifre Tekrar</Text>
            <View
              style={[
                styles.inputRow,
                {
                  backgroundColor: C.surface,
                  borderColor: errors.confirmPassword ? C.danger : C.border,
                },
              ]}
            >
              <Feather name="lock" size={18} color={C.textMuted} style={styles.inputIcon} />
              <TextInput
                ref={confirmRef}
                style={[styles.input, { color: C.text }]}
                placeholder="Şifrenizi tekrar girin"
                placeholderTextColor={C.textMuted}
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); clearErr("confirmPassword"); }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
            </View>
            {errors.confirmPassword ? (
              <Text style={[styles.fieldError, { color: C.danger }]}>{errors.confirmPassword}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: C.primary }, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btnText}>Kayıt Ol</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: C.textSecondary }]}>
            Zaten hesabınız var mı?
          </Text>
          <TouchableOpacity onPress={() => router.replace("/auth/login")}>
            <Text style={[styles.footerLink, { color: C.primary }]}> Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flexGrow: 1, paddingHorizontal: 24 },
  header: { alignItems: "center", marginBottom: 24 },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 6 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  errorBannerText: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1 },
  form: { gap: 14 },
  fieldGroup: { gap: 6 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium", marginLeft: 2 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  eyeBtn: { padding: 4 },
  fieldError: { fontSize: 12, fontFamily: "Inter_400Regular", marginLeft: 2 },
  btn: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
  },
  footerText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  footerLink: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
