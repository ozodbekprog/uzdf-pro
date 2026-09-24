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
  H1,
  H2,
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
      <H1>Kabinet</H1>

      {user ? (
        <Card>
          <Row style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(user.fullName)}</Text>
            </View>
            <View style={styles.profileInfo}>
              <H2>{user.fullName}</H2>
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

      <Card>
        <H2>Statistika</H2>
        <View style={styles.grid}>
          {stats.map((s) => (
            <View key={s.label} style={styles.gridItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Muted>{s.label}</Muted>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <H2>Daraja progressi</H2>
        <Row style={styles.progressHead}>
          <H3>{level}-daraja</H3>
          <Muted>{levelProgress}%</Muted>
        </Row>
        <ProgressBar value={levelProgress} />
        <View style={styles.progressNote}>
          <Muted>Keyingi darajaga {toNextLevel} EXP</Muted>
        </View>
      </Card>

      <Card>
        <H2>Sertifikatlar</H2>
        {certificates.length === 0 ? (
          <EmptyState
            title="Sertifikatlar yo'q"
            description="Kurslarni yakunlab, sertifikat oling."
          />
        ) : (
          certificates.map((c, index) => (
            <View key={c.id}>
              {index > 0 ? <Divider /> : null}
              <Body>{c.course.title}</Body>
              <Muted>{formatDate(c.issuedAt)}</Muted>
              <Text style={styles.certCode}>{c.code}</Text>
            </View>
          ))
        )}
      </Card>

      <Card>
        <H2>Reyting</H2>
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
                    <Body>{r.fullName}</Body>
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

      <Card>
        <H2>Sozlamalar</H2>
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
  profileRow: { alignItems: "flex-start", gap: 14 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#04121f", fontSize: 20, fontWeight: "800" },
  profileInfo: { flex: 1, gap: 4 },
  badges: { flexWrap: "wrap", gap: 6, marginTop: 6 },

  grid: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },
  gridItem: { width: "50%", paddingVertical: 10, paddingRight: 8 },
  statValue: { color: colors.text, fontSize: 22, fontWeight: "800" },

  progressHead: { justifyContent: "space-between", marginBottom: 8 },
  progressNote: { marginTop: 8 },

  certCode: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
    letterSpacing: 0.5,
  },

  ratingRow: { gap: 12 },
  rankBadge: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  rankBadgeText: { color: "#0b1020", fontSize: 14, fontWeight: "800" },
  rankPlain: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  rankPlainText: { color: colors.muted, fontSize: 14, fontWeight: "700" },
  ratingInfo: { flex: 1, gap: 2 },

  logout: { marginTop: 12 },
});
