import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

export interface Customer {
  id: string;
  userId: string;
  name: string;
  phone: string;
  note: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  userId: string;
  customerId: string;
  customerName: string;
  date: string;
  time: string;
  service: string;
  duration: number;
  price: number;
  note: string;
  status: "beklemede" | "tamamlandı" | "iptal";
  createdAt: string;
}

interface DataContextType {
  customers: Customer[];
  appointments: Appointment[];
  isLoading: boolean;
  addCustomer: (data: Omit<Customer, "id" | "userId" | "createdAt">) => Promise<Customer>;
  updateCustomer: (id: string, data: Partial<Omit<Customer, "id" | "userId" | "createdAt">>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addAppointment: (data: Omit<Appointment, "id" | "userId" | "createdAt">) => Promise<Appointment>;
  updateAppointment: (id: string, data: Partial<Omit<Appointment, "id" | "userId" | "createdAt">>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  getTodayAppointments: () => Appointment[];
  getAppointmentsByDate: (date: string) => Appointment[];
  refresh: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

function getCustomersKey(userId: string) {
  return `sb_customers_${userId}`;
}

function getAppointmentsKey(userId: string) {
  return `sb_appointments_${userId}`;
}

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setCustomers([]);
      setAppointments([]);
      return;
    }
    setIsLoading(true);
    try {
      const [cData, aData] = await Promise.all([
        AsyncStorage.getItem(getCustomersKey(user.id)),
        AsyncStorage.getItem(getAppointmentsKey(user.id)),
      ]);
      try { setCustomers(cData ? JSON.parse(cData) : []); } catch { setCustomers([]); }
      try { setAppointments(aData ? JSON.parse(aData) : []); } catch { setAppointments([]); }
    } catch (e) {
      console.warn("Veriler yüklenemedi:", e);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveCustomers(newList: Customer[]) {
    if (!user) return;
    try {
      await AsyncStorage.setItem(getCustomersKey(user.id), JSON.stringify(newList));
      setCustomers(newList);
    } catch (e) {
      console.warn("Müşteri kaydedilemedi:", e);
      throw e;
    }
  }

  async function saveAppointments(newList: Appointment[]) {
    if (!user) return;
    try {
      await AsyncStorage.setItem(getAppointmentsKey(user.id), JSON.stringify(newList));
      setAppointments(newList);
    } catch (e) {
      console.warn("Randevu kaydedilemedi:", e);
      throw e;
    }
  }

  async function addCustomer(data: Omit<Customer, "id" | "userId" | "createdAt">): Promise<Customer> {
    const c: Customer = {
      ...data,
      id: generateId(),
      userId: user!.id,
      createdAt: new Date().toISOString(),
    };
    await saveCustomers([...customers, c]);
    return c;
  }

  async function updateCustomer(id: string, data: Partial<Omit<Customer, "id" | "userId" | "createdAt">>) {
    const updated = customers.map((c) => (c.id === id ? { ...c, ...data } : c));
    await saveCustomers(updated);
  }

  async function deleteCustomer(id: string) {
    await saveCustomers(customers.filter((c) => c.id !== id));
    await saveAppointments(appointments.filter((a) => a.customerId !== id));
  }

  async function addAppointment(data: Omit<Appointment, "id" | "userId" | "createdAt">): Promise<Appointment> {
    const a: Appointment = {
      ...data,
      id: generateId(),
      userId: user!.id,
      createdAt: new Date().toISOString(),
    };
    await saveAppointments([...appointments, a]);
    return a;
  }

  async function updateAppointment(id: string, data: Partial<Omit<Appointment, "id" | "userId" | "createdAt">>) {
    const updated = appointments.map((a) => (a.id === id ? { ...a, ...data } : a));
    await saveAppointments(updated);
  }

  async function deleteAppointment(id: string) {
    await saveAppointments(appointments.filter((a) => a.id !== id));
  }

  function getTodayAppointments(): Appointment[] {
    const today = todayStr();
    return appointments.filter((a) => a.date === today).sort((a, b) => a.time.localeCompare(b.time));
  }

  function getAppointmentsByDate(date: string): Appointment[] {
    return appointments.filter((a) => a.date === date).sort((a, b) => a.time.localeCompare(b.time));
  }

  return (
    <DataContext.Provider
      value={{
        customers,
        appointments,
        isLoading,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        getTodayAppointments,
        getAppointmentsByDate,
        refresh: load,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
