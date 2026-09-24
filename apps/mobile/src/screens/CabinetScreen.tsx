import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, StyleSheet, Text, View } from "react-native";
import {
  getApiUrl,
  getDashboard,
  getMe,
  getMyCertificates,
  getRating,
  logout,
  setApiUrl,
  type CertificateItem,
  type DashboardData,
  type PublicUser,
  type RatingUser,
} from "../api";
import {
  Badge,
  Body,
  Button,
  Card,
  Divider,
  EmptyState,
  ErrorText,
  Field,
  H3,
  Input,
  Loader,
  Muted,
  ProgressBar,
  Row,
  Screen,
  colors,
  formatDate,
} from "../components/ui";

type BadgeTone = "neutral" | "primary" | "accent" | "warning" | "danger";

function roleLabel(role: string): string {
  if (role === "PILOT") return "Uchuvchi";
  if (role === "MODERATOR") return "Moderator";
  if (role === "ADMIN") return "Administrator";
  if (role === "SUPERADMIN") return "Bosh administrator";
  return role;
}

function roleTone(role: string): BadgeTone {
  if (role === "PILOT") return "primary";
  if (role === "MODERATOR") return "accent";
  if (role === "ADMIN") return "warning";
  if (role === "SUPERADMIN") return "danger";
  return "neutral";
}

function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

function ratingColor(position: number): string | null {
  if (position === 1) return "#fbbf24";
  if (position === 2) return "#cbd5e1";
  if (position === 3) return "#b45309";
  return null;
}

/** Bo'lim sarlavhasi: sarlavha + ixtiyoriy izoh. */
function Section({ title, hint }: { title: string; hint?: string }) {
  return (
    <View style={styles.sectionHead}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}
    </View>
  );
}

export default function CabinetScreen({ onLoggedOut }: { onLoggedOut: () => void }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [dash, setDash] = useState<DashboardData | null>(null);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [rating, setRating] = useState<RatingUser[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [apiUrlInput, setApiUrlInput] = useState("");
  const [savingUrl, setSavingUrl] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [me, dashboard, certs, top] = await Promise.all([
        getMe(),
        getDashboard(),
        getMyCertificates(),
        getRating(5),
      ]);
      setUser(me);
      setDash(dashboard);
      setCertificates(certs);
      setRating(top);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        setApiUrlInput(await getApiUrl());
      } catch {
        setApiUrlInput("");
      }
      await load();
      setLoading(false);
    })();
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function onSaveApiUrl() {
    const trimmed = apiUrlInput.trim();
    if (!trimmed) {
      setError("API manzilini kiriting.");
      return;
    }
    setSavingUrl(true);
    setError(null);
    try {
      await setApiUrl(trimmed);
      setApiUrlInput(await getApiUrl());
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setSavingUrl(false);
    }
  }

  async function onLogout() {
    setLoggingOut(true);
    setError(null);
    try {
      await logout();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setLoggingOut(false);
      onLoggedOut();
    }
  }

  const exp = dash?.stats.exp ?? user?.exp ?? 0;
  const level = dash?.stats.level ?? 0;
  const levelProgress = exp % 100;
  const toNextLevel = 100 - levelProgress;

  const stats: Array<{ label: string; value: string }> = [
    { label: "EXP", value: String(dash?.stats.exp ?? user?.exp ?? 0) },
    { label: "Daraja", value: String(level) },
    { label: "Tugallangan darslar", value: String(dash?.stats.completedLessons ?? 0) },
    { label: "Sertifikatlar", value: String(dash?.stats.certificates ?? certificates.length) },
    {
      label: "Reyting o'rni",
      value: dash?.stats.ratingPosition != null ? `#${dash.stats.ratingPosition}` : "—",
    },
  ];

  if (loading) {
    return <Loader label="Kabinet yuklanmoqda..." />;
  }

  return (
    <Screen
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <Text style={styles.screenTitle}>Kabinet</Text>

      {user ? (
        <Card style={styles.profileCard}>
          <View style={styles.profileGlow} />
          <Row style={styles.profileRow}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials(user.fullName)}</Text>
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.fullName}</Text>
              <Muted>{user.email}</Muted>
              <Row style={styles.badges}>
                <Badge label={roleLabel(user.role)} tone={roleTone(user.role)} />
                <Badge
                  label={user.emailVerified ? "Email tasdiqlangan" : "Email tasdiqlanmagan"}
                  tone={user.emailVerified ? "primary" : "warning"}
                />
              </Row>
            </View>
          </Row>
        </Card>
      ) : (
        <EmptyState title="Profil mavjud emas" description="Ma'lumotni yangilash uchun pastga torting." />
      )}

      <ErrorText message={error} />

      <Section title="Statistika" hint="Umumiy ko'rsatkichlaringiz" />
      <Card style={styles.panel}>
        <View style={styles.panelSheen} />
        <View style={styles.grid}>
          {stats.map((s) => (
            <View key={s.label} style={styles.gridItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel} numberOfLines={2}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <Section title="Daraja progressi" hint="Keyingi darajagacha yig'ilgan tajriba" />
      <Card style={styles.panel}>
        <View style={styles.panelSheen} />
        <Row style={styles.progressHead}>
          <H3>{level}-daraja</H3>
          <Badge label={`${levelProgress}%`} tone="primary" />
        </Row>
        <ProgressBar value={levelProgress} />
        <View style={styles.progressNote}>
          <Muted>Keyingi darajaga {toNextLevel} EXP</Muted>
        </View>
      </Card>

      <Section title="Sertifikatlar" hint="Yakunlangan kurslar bo'yicha" />
      <Card style={styles.panel}>
        <View style={styles.panelSheen} />
        {certificates.length === 0 ? (
          <EmptyState
            title="Sertifikatlar yo'q"
            description="Kurslarni yakunlab, sertifikat oling."
          />
        ) : (
          certificates.map((c, index) => (
            <View key={c.id}>
              {index > 0 ? <Divider /> : null}
              <Body style={styles.certTitle}>{c.course.title}</Body>
              <Muted>{formatDate(c.issuedAt)}</Muted>
              <View style={styles.certCodeRow}>
                <Badge label={c.code} tone="accent" />
              </View>
            </View>
          ))
        )}
      </Card>

      <Section title="Reyting" hint="Eng faol ishtirokchilar" />
      <Card style={styles.panel}>
        <View style={styles.panelSheen} />
        {rating.length === 0 ? (
          <EmptyState title="Reyting bo'sh" description="Hali natijalar qayd etilmagan." />
        ) : (
          rating.map((r, index) => {
            const color = ratingColor(r.position);
            return (
              <View key={r.id}>
                {index > 0 ? <Divider /> : null}
                <Row style={styles.ratingRow}>
                  {color ? (
                    <View style={[styles.rankBadge, { backgroundColor: color }]}>
                      <Text style={styles.rankBadgeText}>{r.position}</Text>
                    </View>
                  ) : (
                    <View style={styles.rankPlain}>
                      <Text style={styles.rankPlainText}>{r.position}</Text>
                    </View>
                  )}
                  <View style={styles.ratingInfo}>
                    <Body style={styles.ratingName}>{r.fullName}</Body>
                    <Muted>
                      {r.exp} EXP • {r.level}-daraja
                    </Muted>
                  </View>
                </Row>
              </View>
            );
          })
        )}
      </Card>

      <Section title="Sozlamalar" hint="Ulanish va hisobdan chiqish" />
      <Card style={styles.panel}>
        <View style={styles.panelSheen} />
        <Field label="API manzili" hint="Telefon va kompyuter bitta tarmoqda bo'lsin.">
          <Input
            value={apiUrlInput}
            onChangeText={setApiUrlInput}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="https://..."
          />
        </Field>
        <Button
          title={savingUrl ? "Saqlanmoqda..." : "Saqlash"}
          onPress={onSaveApiUrl}
          disabled={savingUrl}
        />
        <View style={styles.logout}>
          <Button
            title={loggingOut ? "Chiqilmoqda..." : "Chiqish"}
            variant="danger"
            onPress={onLogout}
            disabled={loggingOut}
          />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenTitle: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  /* Bo'lim sarlavhalari */
  sectionHead: { marginTop: 6, gap: 2 },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  sectionHint: { color: colors.muted, fontSize: 12 },

  /* Umumiy karta (+ ikki qatlamli fon) */
  panel: {
    borderRadius: 18,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    padding: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  panelSheen: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 72,
    backgroundColor: "rgba(255,255,255,0.03)",
  },

  /* Profil */
  profileCard: {
    borderRadius: 18,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceAlt,
    padding: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  profileGlow: {
    position: "absolute",
    top: -50,
    right: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(52,211,153,0.14)",
  },
  profileRow: { alignItems: "flex-start", gap: 14 },
  avatarRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(52,211,153,0.35)",
    backgroundColor: "rgba(52,211,153,0.08)",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#04121f", fontSize: 19, fontWeight: "800" },
  profileInfo: { flex: 1, gap: 4 },
  profileName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  badges: { flexWrap: "wrap", gap: 6, marginTop: 6 },

  /* Statistika */
  grid: { flexDirection: "row", flexWrap: "wrap" },
  gridItem: {
    width: "50%",
    paddingVertical: 12,
    paddingRight: 8,
    gap: 4,
  },
  statValue: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  statLabel: { color: colors.muted, fontSize: 12, fontWeight: "600", lineHeight: 16 },

  /* Progress */
  progressHead: { justifyContent: "space-between", marginBottom: 12 },
  progressNote: { marginTop: 10 },

  /* Sertifikatlar */
  certTitle: { fontWeight: "700" },
  certCodeRow: { marginTop: 8 },

  /* Reyting */
  ratingRow: { gap: 12 },
  rankBadge: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  rankBadgeText: { color: "#0b1020", fontSize: 14, fontWeight: "800" },
  rankPlain: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  rankPlainText: { color: colors.muted, fontSize: 14, fontWeight: "700" },
  ratingInfo: { flex: 1, gap: 2 },
  ratingName: { fontWeight: "700" },

  logout: { marginTop: 12 },
});
