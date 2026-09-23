import React, { useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import AcademyScreen from "./src/screens/AcademyScreen";
import CabinetScreen from "./src/screens/CabinetScreen";
import ZonesScreen from "./src/screens/ZonesScreen";
import { colors } from "./src/components/ui";

type Tab = "zones" | "academy" | "cabinet";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "zones", label: "Xarita" },
  { id: "academy", label: "Akademiya" },
  { id: "cabinet", label: "Kabinet" },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("zones");

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <ExpoStatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>UZDF Pro</Text>
      </View>
      <View style={styles.body}>
        {tab === "zones" && <ZonesScreen />}
        {tab === "academy" && <AcademyScreen />}
        {tab === "cabinet" && <CabinetScreen />}
      </View>
      <View style={styles.tabbar}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.tab, tab === t.id && styles.tabActive]}
            onPress={() => setTab(t.id)}
          >
            <Text style={[styles.tabLabel, tab === t.id && styles.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },
  header: { backgroundColor: colors.primary, padding: 12, alignItems: "center" },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  body: { flex: 1, backgroundColor: "#f1f5f9" },
  tabbar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  tab: { flex: 1, paddingVertical: 14, alignItems: "center" },
  tabActive: { borderTopWidth: 3, borderTopColor: colors.primary },
  tabLabel: { color: "#64748b", fontWeight: "600" },
  tabLabelActive: { color: colors.primary },
});
