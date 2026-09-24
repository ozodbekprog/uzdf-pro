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

/** Keng tarqalgan tonlar (Badge, StatTile, Chip va h.k. uchun bir xil). */
export type Tone = "neutral" | "primary" | "accent" | "warning" | "danger";

const tonePalette: Record<Tone, { fg: string; bg: string; border: string }> = {
  neutral: { fg: theme.colors.muted, bg: "rgba(255,255,255,0.06)", border: theme.colors.border },
  primary: { fg: theme.colors.primary, bg: "rgba(52,211,153,0.14)", border: "rgba(52,211,153,0.35)" },
  accent: { fg: theme.colors.accent, bg: "rgba(34,211,238,0.12)", border: "rgba(34,211,238,0.32)" },
  warning: { fg: theme.colors.warning, bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.32)" },
  danger: { fg: theme.colors.danger, bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.32)" }
};

export const ui = {
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    ...theme.shadows.md
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
  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardSheen} pointerEvents="none" />
      {children}
    </View>
  );
}

/**
 * Ekran sarlavhasi: katta (800) sarlavha + izoh + o'ng tomondagi element.
 * `H1`/`Muted` juftligining boyitilgan varianti.
 */
export function ScreenHeader({
  title,
  subtitle,
  right
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.screenHeader}>
      <View style={styles.screenHeaderMain}>
        <Text style={styles.screenHeaderTitle}>{title}</Text>
        {subtitle ? <Text style={styles.screenHeaderSubtitle}>{subtitle}</Text> : null}
      </View>
      {right ? <View style={styles.screenHeaderRight}>{right}</View> : null}
    </View>
  );
}

/** Bo'lim sarlavhasi: matn + ixtiyoriy o'ng aksiYa. */
export function SectionTitle({
  children,
  action
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={styles.sectionTitleText}>{children}</Text>
      {action ? <View style={styles.sectionTitleAction}>{action}</View> : null}
    </View>
  );
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

/* ------------------------------ Statistika/karta ----------------------------- */

/** Kichik statistika kartasi (label + qiymat + ixtiyoriy belgi). */
export function StatTile({
  label,
  value,
  icon,
  tone = "primary"
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  tone?: Tone;
}) {
  const c = tonePalette[tone];
  return (
    <View style={[styles.statTile, { borderColor: c.border }]}>
      {icon ? (
        <View style={[styles.statIcon, { backgroundColor: c.bg, borderColor: c.border }]}>
          {icon}
        </View>
      ) : null}
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/* ------------------------------- Elementlar --------------------------------- */

export type BadgeTone = Tone;

export function Badge({ label, tone = "neutral" }: { label: string; tone?: BadgeTone }) {
  const c = tonePalette[tone];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg, borderColor: c.border }]}>
      <Text style={[styles.badgeText, { color: c.fg }]}>{label}</Text>
    </View>
  );
}

/** Filtr tugmasi (chiplash). `active` bo'lganda emerald fon oladi. */
export function Chip({
  label,
  active = false,
  onPress
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.chip,
        active ? styles.chipActive : null,
        pressed && onPress ? styles.pressed : null
      ]}
    >
      <Text style={[styles.chipText, active ? styles.chipTextActive : null]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Gradient o'rniga to'q emerald doira + bosh harflar. */
export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("") || "?";

  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarText, { fontSize: Math.round(size * 0.38) }]}>{initials}</Text>
    </View>
  );
}

/** Bosiladigan qator: sarlavha + izoh + o'ng element. */
export function ListRow({
  title,
  subtitle,
  right,
  onPress
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
}) {
  const content = (
    <>
      <View style={styles.listRowMain}>
        <Text style={styles.listRowTitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.listRowSubtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ? <View style={styles.listRowRight}>{right}</View> : null}
    </>
  );

  if (!onPress) {
    return <View style={styles.listRow}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.listRow, pressed ? styles.listRowPressed : null]}
    >
      {content}
    </Pressable>
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

/* --------------------------------- Uslublar --------------------------------- */

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    padding: 16,
    overflow: "hidden",
    ...theme.shadows.md
  },
  /** Ikkinchi qatlam fon: yuqoridan pastga nozik yorug'lik. */
  cardSheen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)"
  },
  statTile: {
    flex: 1,
    minWidth: 0,
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    padding: 14,
    gap: 4,
    ...theme.shadows.sm
  },
  statIcon: {
    width: 30,
    height: 30,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6
  },
  statValue: { fontSize: 20, fontWeight: "800", color: theme.colors.text, letterSpacing: -0.3 },
  statLabel: { fontSize: 12, color: theme.colors.muted, fontWeight: "600" },

  screen: { flex: 1, backgroundColor: theme.colors.bg },
  screenScroll: { flex: 1, backgroundColor: theme.colors.bg },
  screenContent: { padding: 16, paddingBottom: 40, gap: 12 },
  row: { flexDirection: "row", alignItems: "center" },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 12 },

  screenHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 2
  },
  screenHeaderMain: { flex: 1, gap: 3 },
  screenHeaderTitle: { fontSize: 26, fontWeight: "800", color: theme.colors.text, letterSpacing: -0.6 },
  screenHeaderSubtitle: { fontSize: 13, color: theme.colors.muted, lineHeight: 19 },
  screenHeaderRight: { alignItems: "flex-end" },

  sectionTitle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 4
  },
  sectionTitleText: { fontSize: 17, fontWeight: "700", color: theme.colors.text, letterSpacing: -0.2 },
  sectionTitleAction: { alignItems: "flex-end" },

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

  chip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: theme.radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 7
  },
  chipActive: {
    backgroundColor: "rgba(52,211,153,0.16)",
    borderColor: "rgba(52,211,153,0.5)"
  },
  chipText: { fontSize: 13, fontWeight: "600", color: theme.colors.muted },
  chipTextActive: { color: theme.colors.primary },

  avatar: {
    backgroundColor: "#064e3b",
    borderWidth: 1,
    borderColor: "rgba(52,211,153,0.5)",
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: { color: theme.colors.primary, fontWeight: "800" },

  listRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.card,
    paddingHorizontal: 14,
    paddingVertical: 13
  },
  listRowPressed: { opacity: 0.85, borderColor: theme.colors.borderStrong },
  listRowMain: { flex: 1, gap: 2 },
  listRowTitle: { fontSize: 14, fontWeight: "700", color: theme.colors.text },
  listRowSubtitle: { fontSize: 12, color: theme.colors.muted, lineHeight: 17 },
  listRowRight: { alignItems: "flex-end", justifyContent: "center" },

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
