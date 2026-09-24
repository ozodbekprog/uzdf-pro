import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type RefreshControlProps,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
  View
} from "react-native";
import { theme } from "../theme";

/** Eski nom bilan moslik uchun (mavjud ekranlar `colors` ishlatadi). */
export const colors = theme.colors;

export const ui = {
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16
  } as ViewStyle
};

/* --------------------------------- Tuzilma --------------------------------- */

export function Card({
  children,
  style
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Screen({
  children,
  scroll = true,
  refreshControl
}: {
  children: React.ReactNode;
  scroll?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}) {
  if (!scroll) {
    return <View style={styles.screen}>{children}</View>;
  }
  return (
    <ScrollView
      style={styles.screenScroll}
      contentContainerStyle={styles.screenContent}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  );
}

export function Row({
  children,
  style
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.row, style]}>{children}</View>;
}

export function Divider() {
  return <View style={styles.divider} />;
}

/* --------------------------------- Matnlar --------------------------------- */

export function H1({ children }: { children: React.ReactNode }) {
  return <Text style={styles.h1}>{children}</Text>;
}

export function H2({ children }: { children: React.ReactNode }) {
  return <Text style={styles.h2}>{children}</Text>;
}

export function H3({ children }: { children: React.ReactNode }) {
  return <Text style={styles.h3}>{children}</Text>;
}

export function Body({
  children,
  style,
  numberOfLines
}: {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}) {
  return (
    <Text style={[styles.body, style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

export function Muted({
  children,
  style,
  numberOfLines
}: {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}) {
  return (
    <Text style={[styles.muted, style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

export function ErrorText({ message }: { message: string | null }) {
  if (!message) return null;
  return <Text style={styles.error}>{message}</Text>;
}

/* -------------------------------- Elementlar -------------------------------- */

export type BadgeTone = "neutral" | "primary" | "accent" | "warning" | "danger";

export function Badge({ label, tone = "neutral" }: { label: string; tone?: BadgeTone }) {
  const palette: Record<BadgeTone, { bg: string; fg: string; border: string }> = {
    neutral: { bg: "rgba(255,255,255,0.06)", fg: theme.colors.muted, border: theme.colors.border },
    primary: { bg: "rgba(52,211,153,0.14)", fg: theme.colors.primary, border: "rgba(52,211,153,0.35)" },
    accent: { bg: "rgba(34,211,238,0.12)", fg: theme.colors.accent, border: "rgba(34,211,238,0.32)" },
    warning: { bg: "rgba(251,191,36,0.12)", fg: theme.colors.warning, border: "rgba(251,191,36,0.32)" },
    danger: { bg: "rgba(248,113,113,0.12)", fg: theme.colors.danger, border: "rgba(248,113,113,0.32)" }
  };
  const c = palette[tone];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg, borderColor: c.border }]}>
      <Text style={[styles.badgeText, { color: c.fg }]}>{label}</Text>
    </View>
  );
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled,
  loading,
  style
}: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const variants: Record<string, { bg: string; fg: string; border: string }> = {
    primary: { bg: theme.colors.primary, fg: "#04121f", border: theme.colors.primary },
    secondary: { bg: "rgba(255,255,255,0.05)", fg: theme.colors.text, border: theme.colors.border },
    ghost: { bg: "transparent", fg: theme.colors.muted, border: "transparent" },
    danger: { bg: "rgba(248,113,113,0.12)", fg: theme.colors.danger, border: "rgba(248,113,113,0.35)" }
  };
  const c = variants[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: c.bg, borderColor: c.border },
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={c.fg} />
      ) : (
        <Text style={[styles.buttonText, { color: c.fg }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Input({ style, ...props }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={theme.colors.dim}
      style={[styles.input, style]}
      {...props}
    />
  );
}

export function Field({
  label,
  children,
  hint
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    </View>
  );
}

export function ProgressBar({ value, tone = "primary" }: { value: number; tone?: "primary" | "accent" | "warning" }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const bg =
    tone === "accent" ? theme.colors.accent : tone === "warning" ? theme.colors.warning : theme.colors.primary;
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${clamped}%`, backgroundColor: bg }]} />
    </View>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {description ? <Text style={styles.emptyText}>{description}</Text> : null}
    </View>
  );
}

export function Loader({ label }: { label?: string }) {
  return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {label ? <Text style={styles.loaderText}>{label}</Text> : null}
    </View>
  );
}

export function Skeleton({ height = 16, style }: { height?: number; style?: ViewStyle }) {
  return <View style={[styles.skeleton, { height }, style]} />;
}

export function zoneColor(type: string): string {
  if (type === "RED") return theme.colors.red;
  if (type === "YELLOW") return theme.colors.yellow;
  return theme.colors.green;
}

export function formatSom(value: number): string {
  return `${new Intl.NumberFormat("uz-UZ").format(value)} so'm`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("uz-UZ", { year: "numeric", month: "long", day: "numeric" });
}

/* --------------------------------- Uslublar --------------------------------- */

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16
  },
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  screenScroll: { flex: 1, backgroundColor: theme.colors.bg },
  screenContent: { padding: 16, paddingBottom: 40, gap: 12 },
  row: { flexDirection: "row", alignItems: "center" },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 12 },

  h1: { fontSize: 26, fontWeight: "800", color: theme.colors.text, letterSpacing: -0.4 },
  h2: { fontSize: 18, fontWeight: "700", color: theme.colors.text },
  h3: { fontSize: 15, fontWeight: "600", color: theme.colors.text },
  body: { fontSize: 14, color: theme.colors.text, lineHeight: 21 },
  muted: { fontSize: 13, color: theme.colors.muted, lineHeight: 19 },
  error: {
    color: theme.colors.danger,
    backgroundColor: "rgba(248,113,113,0.12)",
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.3)",
    padding: 12,
    borderRadius: theme.radius.sm,
    fontSize: 13
  },

  badge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3
  },
  badgeText: { fontSize: 11, fontWeight: "600" },

  button: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 46
  },
  buttonText: { fontSize: 14, fontWeight: "700" },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },

  input: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.colors.text,
    fontSize: 14
  },
  field: { gap: 6, marginBottom: 12 },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: theme.colors.muted },
  fieldHint: { fontSize: 11, color: theme.colors.dim },

  progressTrack: {
    height: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(255,255,255,0.06)",
    overflow: "hidden"
  },
  progressFill: { height: "100%", borderRadius: theme.radius.pill },

  empty: { alignItems: "center", paddingVertical: 32, gap: 6 },
  emptyTitle: { fontSize: 15, fontWeight: "700", color: theme.colors.text },
  emptyText: { fontSize: 13, color: theme.colors.muted, textAlign: "center" },

  loader: { paddingVertical: 48, alignItems: "center", gap: 10 },
  loaderText: { fontSize: 13, color: theme.colors.muted },

  skeleton: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: theme.radius.sm
  }
});
