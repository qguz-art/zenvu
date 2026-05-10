import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  createdAt: string;
  isPremium: boolean;
}

interface StoredUser extends User {
  passwordHash: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (params: { username: string; email: string; displayName: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USERS_KEY = "sb_users_v2";
const SESSION_KEY = "sb_session_v2";

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

async function getStoredUsers(): Promise<StoredUser[]> {
  try {
    const data = await AsyncStorage.getItem(USERS_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveUsers(users: StoredUser[]): Promise<void> {
  try {
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    throw new Error("Kullanıcı bilgileri kaydedilemedi. Lütfen tekrar deneyin.");
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  async function loadSession() {
    try {
      const sessionData = await AsyncStorage.getItem(SESSION_KEY);
      if (!sessionData) return;

      const sessionUser: User = JSON.parse(sessionData);
      const users = await getStoredUsers();

      if (users.length === 0) {
        // Kullanıcı listesi okunamadıysa oturuma güven
        setUser(sessionUser);
        return;
      }

      const exists = users.find((u) => u.id === sessionUser.id);
      if (exists) {
        const { passwordHash: _, ...userWithoutPassword } = exists;
        setUser(userWithoutPassword);
      } else {
        // Kullanıcı silindi, oturumu temizle
        await AsyncStorage.removeItem(SESSION_KEY);
      }
    } catch {
      // Oturum bozuk, sessizce devam et
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    if (!email.trim() || !password.trim()) {
      return { success: false, error: "E-posta ve şifre giriniz." };
    }

    const users = await getStoredUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );

    if (!found) {
      return { success: false, error: "Bu e-posta adresine kayıtlı hesap bulunamadı." };
    }

    const hash = simpleHash(password);
    if (found.passwordHash !== hash) {
      return { success: false, error: "Şifre hatalı." };
    }

    const { passwordHash: _, ...userWithoutPassword } = found;
    try {
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutPassword));
    } catch {
      return { success: false, error: "Giriş kaydedilemedi. Lütfen tekrar deneyin." };
    }
    setUser(userWithoutPassword);
    return { success: true };
  }

  async function register(params: {
    username: string;
    email: string;
    displayName: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> {
    const { username, email, displayName, password } = params;

    if (!username.trim() || !email.trim() || !displayName.trim() || !password.trim()) {
      return { success: false, error: "Tüm alanları doldurunuz." };
    }

    if (username.trim().length < 3) {
      return { success: false, error: "Kullanıcı adı en az 3 karakter olmalıdır." };
    }

    if (password.length < 6) {
      return { success: false, error: "Şifre en az 6 karakter olmalıdır." };
    }

    if (!email.includes("@")) {
      return { success: false, error: "Geçerli bir e-posta adresi giriniz." };
    }

    let users: StoredUser[];
    try {
      users = await getStoredUsers();
    } catch {
      return { success: false, error: "Sunucuya ulaşılamadı. Lütfen tekrar deneyin." };
    }

    const usernameExists = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase().trim()
    );
    if (usernameExists) {
      return { success: false, error: "Bu kullanıcı adı zaten kullanılıyor." };
    }

    const emailExists = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );
    if (emailExists) {
      return { success: false, error: "Bu e-posta adresi zaten kayıtlı." };
    }

    const newUser: StoredUser = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      username: username.trim(),
      email: email.trim().toLowerCase(),
      displayName: displayName.trim(),
      createdAt: new Date().toISOString(),
      isPremium: false,
      passwordHash: simpleHash(password),
    };

    // Önce kullanıcıyı kaydet, başarılıysa oturum aç
    try {
      await saveUsers([...users, newUser]);
    } catch (e: any) {
      return { success: false, error: e?.message ?? "Kayıt başarısız oldu. Lütfen tekrar deneyin." };
    }

    const { passwordHash: _, ...userWithoutPassword } = newUser;
    try {
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutPassword));
    } catch {
      // Oturum kaydedilemedi ama kullanıcı oluştu — girişe yönlendir
      return { success: false, error: "Hesabınız oluşturuldu! Lütfen giriş yapın." };
    }

    setUser(userWithoutPassword);
    return { success: true };
  }

  async function logout() {
    await AsyncStorage.removeItem(SESSION_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
