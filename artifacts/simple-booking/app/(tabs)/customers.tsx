import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import type { Customer } from "@/context/DataContext";
import { useData } from "@/context/DataContext";

function CustomerItem({ customer, onDelete }: { customer: Customer; onDelete: () => void }) {
  const C = Colors.light;
  const initial = customer.name[0]?.toUpperCase() ?? "?";

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: C.surface }]}
      activeOpacity={0.85}
      onPress={() => router.push(`/customer/${customer.id}`)}
    >
      <View style={[styles.avatar, { backgroundColor: C.primaryLight }]}>
        <Text style={[styles.avatarText, { color: C.primary }]}>{initial}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: C.text }]} numberOfLines={1}>
          {customer.name}
        </Text>
        {customer.phone ? (
          <Text style={[styles.phone, { color: C.textSecondary }]}>{customer.phone}</Text>
        ) : null}
        {customer.note ? (
          <Text style={[styles.note, { color: C.textMuted }]} numberOfLines={1}>
            {customer.note}
          </Text>
        ) : null}
      </View>
      <TouchableOpacity
        style={[styles.deleteBtn, { backgroundColor: C.dangerLight }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Alert.alert("Müşteriyi Sil", `"${customer.name}" silinecek. Emin misiniz?`, [
            { text: "Vazgeç", style: "cancel" },
            {
              text: "Sil",
              style: "destructive",
              onPress: onDelete,
            },
          ]);
        }}
      >
        <Feather name="trash-2" size={16} color={C.danger} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function CustomersScreen() {
  const C = Colors.light;
  const insets = useSafeAreaInsets();
  const { customers, deleteCustomer } = useData();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q)
    );
  }, [customers, search]);

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: Platform.OS === "web" ? insets.top + 67 : insets.top + 16,
            backgroundColor: C.background,
          },
        ]}
      >
        <Text style={[styles.title, { color: C.text }]}>Müşteriler</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: C.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/add-customer");
          }}
        >
          <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchRow, { paddingHorizontal: 20, paddingBottom: 12 }]}>
        <View style={[styles.searchBox, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Feather name="search" size={16} color={C.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: C.text }]}
            placeholder="Müşteri ara..."
            placeholderTextColor={C.textMuted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={C.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          {
            paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 84 + 16,
          },
        ]}
        renderItem={({ item }) => (
          <CustomerItem
            customer={item}
            onDelete={() => deleteCustomer(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Feather name="users" size={42} color={C.textMuted} />
            <Text style={[styles.emptyTitle, { color: C.textSecondary }]}>
              {search ? "Sonuç bulunamadı" : "Henüz müşteri yok"}
            </Text>
            {!search && (
              <Text style={[styles.emptyDesc, { color: C.textMuted }]}>
                İlk müşterinizi eklemek için + butonuna basın.
              </Text>
            )}
          </View>
        }
        scrollEnabled={filtered.length > 0}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  addBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  searchRow: {},
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  list: { paddingHorizontal: 20, paddingTop: 4 },
  card: {
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18, fontFamily: "Inter_700Bold" },
  info: { flex: 1 },
  name: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  phone: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  note: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  deleteBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  emptyBox: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  emptyDesc: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", paddingHorizontal: 32 },
});
