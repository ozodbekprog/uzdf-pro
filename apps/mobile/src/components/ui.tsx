import React from "react";
import { ActivityIndicator, StyleSheet, Text, TextStyle, View } from "react-native";

export const colors = {
  bg: "#f1f5f9",
  card: "#ffffff",
  text: "#0f172a",
  muted: "#64748b",
  primary: "#0f766e",
  red: "#dc2626",
  yellow: "#b45309",
  green: "#15803d",
};

export function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function H1({ children }: { children: React.ReactNode }) {
  return <Text style={styles.h1}>{children}</Text>;
}

export function H2({ children }: { children: React.ReactNode }) {
  return <Text style={styles.h2}>{children}</Text>;
}

export function Muted({
  children,
  style,
  ...rest
}: {
  children: React.ReactNode;
  style?: TextStyle;
  numberOfLines?: number;
}) {
  return (
    <Text style={[styles.muted, style]} {...rest}>
      {children}
    </Text>
  );
}

export function ErrorText({ message }: { message: string | null }) {
  if (!message) return null;
  return <Text style={styles.error}>{message}</Text>;
}

export function Loader() {
  return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export function zoneColor(type: string): string {
  if (type === "RED") return colors.red;
  if (type === "YELLOW") return colors.yellow;
  return colors.green;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  h1: { fontSize: 24, fontWeight: "700", color: colors.text, marginBottom: 8 },
  h2: { fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 4 },
  muted: { fontSize: 14, color: colors.muted },
  error: {
    color: colors.red,
    backgroundColor: "#fee2e2",
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
  },
  loader: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
});
