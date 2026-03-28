import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

export default function LoginScreen() {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string; general?: string }>({});

  const passwordRef = useRef<TextInput>(null);

  const validate = () => {
    const errs: typeof errors = {};
    if (!username.trim()) errs.username = "Kullanıcı adını giriniz.";
    if (!password) errs.password = "Şifrenizi giriniz.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const result = await login(username, password);
      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace("/(tabs)");
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setErrors({ general: result.error });
      }
    } finally {
      setLoading(false);
    }
  };

  const C = Colors.light;

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: Platform.OS === "web" ? insets.top + 67 : insets.top + 40,
            paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 24,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={20}
      >
        <View style={styles.header}>
          <View style={[styles.logoBox, { backgroundColor: C.primaryLight }]}>
            <Feather name="scissors" size={36} color={C.primary} />
          </View>
          <Text style={[styles.appName, { color: C.text }]}>SimpleBooking</Text>
          <Text style={[styles.subtitle, { color: C.textSecondary }]}>
            Hesabınıza giriş yapın
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
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: C.textSecondary }]}>Kullanıcı Adı</Text>
            <View
              style={[
                styles.inputRow,
                {
                  backgroundColor: C.surface,
                  borderColor: errors.username ? C.danger : C.border,
                },
              ]}
            >
              <Feather name="user" size={18} color={C.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: C.text }]}
                placeholder="kullanici_adi"
                placeholderTextColor={C.textMuted}
                value={username}
                onChangeText={(t) => {
                  setUsername(t);
                  if (errors.username) setErrors((e) => ({ ...e, username: undefined }));
                }}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>
            {errors.username ? (
              <Text style={[styles.fieldError, { color: C.danger }]}>{errors.username}</Text>
            ) : null}
          </View>

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
                placeholder="••••••"
                placeholderTextColor={C.textMuted}
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPassword((s) => !s)} style={styles.eyeBtn}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={C.textMuted} />
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text style={[styles.fieldError, { color: C.danger }]}>{errors.password}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: C.primary }, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.loginBtnText}>Giriş Yap</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: C.textSecondary }]}>
            Hesabınız yok mu?
          </Text>
          <TouchableOpacity onPress={() => router.replace("/auth/register")}>
            <Text style={[styles.footerLink, { color: C.primary }]}> Kayıt Ol</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flexGrow: 1, paddingHorizontal: 24 },
  header: { alignItems: "center", marginBottom: 32 },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  appName: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 6 },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular" },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorBannerText: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1 },
  form: { gap: 16 },
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
  eyeBtn: { padding: 4 },
  fieldError: { fontSize: 12, fontFamily: "Inter_400Regular", marginLeft: 2 },
  loginBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.7 },
  loginBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 32 },
  footerText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  footerLink: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
