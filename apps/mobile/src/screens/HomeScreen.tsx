import React, { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import {
  getDashboard,
  getMe,
  getNews,
  type DashboardData,
  type NewsItem,
  type PublicUser,
} from "../api";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorText,
  Loader,
  Muted,
  ProgressBar,
  Row,
  Screen,
  colors,
  formatDate,
} from "../components/ui";
import type { MobileTab } from "../navigation";

export interface HomeScreenProps {
  onNavigate: (tab: MobileTab) => void;
  onOpenNews: (slug: string) => void;
  onOpenCourse: (slug: string) => void;
}

interface StatCard {
  label: string;
  value: string;
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

export default function HomeScreen({
  onNavigate,
  onOpenNews,
  onOpenCourse,
}: HomeScreenProps) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [dash, setDash] = useState<DashboardData | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNews, setShowNews] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [me, dashboard] = await Promise.all([getMe(), getDashboard()]);
      setUser(me);
      setDash(dashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik");
      setUser(null);
      setDash(null);
    }

    try {
      setNews(await getNews());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik");
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (loading) return <Loader label="Yuklanmoqda..." />;

  const stats: StatCard[] = dash
    ? [
        { label: "EXP", value: String(dash.stats.exp) },
        { label: "Daraja", value: `Lvl ${dash.stats.level}` },
        { label: "Tugallangan darslar", value: String(dash.stats.completedLessons) },
        { label: "Sertifikatlar", value: String(dash.stats.certificates) },
        {
          label: "Reyting o'rni",
          value: dash.stats.ratingPosition != null ? `#${dash.stats.ratingPosition}` : "—",
        },
      ]
    : [];

  const statRows: StatCard[][] = [];
  for (let i = 0; i < stats.length; i += 2) {
    statRows.push(stats.slice(i, i + 2));
  }

  const courses = dash?.courses ?? [];
  const continueCourse =
    courses.find((c) => c.percent > 0 && c.completedCount < c.lessonsCount) ??
    courses[0] ??
    null;

  const visibleNews = showNews ? news : news.slice(0, 3);

  return (
    <Screen
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.hero}>
        <View style={styles.heroGlow} />
        <Text style={styles.heroKicker}>DRONCHI EKOTIZIMI</Text>
        <Text style={styles.heroGreeting}>Xush kelibsiz{user ? "," : ""}</Text>
        {user ? <Text style={styles.heroName}>{user.fullName}</Text> : null}
        <Text style={styles.heroSub}>
          Statistika, davom etish va so'nggi yangiliklar bir joyda.
        </Text>
      </View>

      <ErrorText message={error} />

      <Section title="Statistika" hint="Faoliyatingiz bo'yicha umumiy ko'rsatkichlar" />
      {stats.length === 0 ? (
        <EmptyState title="Statistika yo'q" description="Ma'lumot yuklanmadi." />
      ) : (
        statRows.map((rowItems, rowIndex) => (
          <Row key={`stat-row-${rowIndex}`} style={styles.statRow}>
            {rowItems.map((s) => (
              <Card key={s.label} style={styles.statCard}>
                <View style={styles.statSheen} />
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel} numberOfLines={2}>
                  {s.label}
                </Text>
              </Card>
            ))}
            {rowItems.length === 1 ? <View style={styles.statSpacer} /> : null}
          </Row>
        ))
      )}

      <Section title="Davom etish" hint="O'qishni shu yerdan davom ettiring" />
      {continueCourse ? (
        <Card style={styles.panel}>
          <View style={styles.panelSheen} />
          <Row style={styles.continueHead}>
            <Badge label={`${continueCourse.percent}%`} tone="primary" />
            <Muted>
              {continueCourse.completedCount}/{continueCourse.lessonsCount} dars
            </Muted>
          </Row>
          <Text style={styles.continueTitle}>{continueCourse.title}</Text>
          <Text style={styles.continueNext}>
            {continueCourse.nextLessonTitle
              ? `Keyingi dars: ${continueCourse.nextLessonTitle}`
              : "Barcha darslar tugallangan."}
          </Text>
          <View style={styles.progress}>
            <ProgressBar value={continueCourse.percent} />
          </View>
          <Button
            title="Davom ettirish"
            onPress={() => onOpenCourse(continueCourse.slug)}
            style={styles.continueButton}
          />
        </Card>
      ) : (
        <EmptyState
          title="Kurslar yo'q"
          description="Hozircha o'quv kurslari mavjud emas."
        />
      )}

      <Section title="Tezkor havolalar" hint="Kerakli bo'limga tez o'ting" />
      <Row style={styles.linkRow}>
        <Button
          title="Xarita"
          variant="secondary"
          onPress={() => onNavigate("zones")}
          style={styles.linkButton}
        />
        <Button
          title="Akademiya"
          variant="secondary"
          onPress={() => onNavigate("academy")}
          style={styles.linkButton}
        />
      </Row>
      <Row style={styles.linkRow}>
        <Button
          title="Do'kon"
          variant="secondary"
          onPress={() => onNavigate("shop")}
          style={styles.linkButton}
        />
        <Button
          title={showNews ? "Yangiliklar (yopish)" : "Yangiliklar"}
          variant="secondary"
          onPress={() => setShowNews((value) => !value)}
          style={styles.linkButton}
        />
      </Row>

      <Section
        title={showNews ? "Barcha yangiliklar" : "So'nggi yangiliklar"}
        hint="E'lonlar va yangilanishlar"
      />
      {visibleNews.length === 0 ? (
        <EmptyState
          title="Yangiliklar yo'q"
          description="Hozircha e'lon qilingan yangiliklar mavjud emas."
        />
      ) : (
        visibleNews.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => onOpenNews(item.slug)}
            style={({ pressed }) => (pressed ? styles.pressed : undefined)}
          >
            <Card style={styles.panel}>
              <View style={styles.newsAccent} />
              <Row style={styles.newsMeta}>
                {item.category ? <Badge label={item.category} tone="accent" /> : null}
                <Muted>{formatDate(item.publishedAt)}</Muted>
              </Row>
              <Text style={styles.newsTitle}>{item.title}</Text>
              {item.summary ? (
                <Muted numberOfLines={2} style={styles.newsSummary}>
                  {item.summary}
                </Muted>
              ) : null}
            </Card>
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  /* Hero */
  hero: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceAlt,
    padding: 18,
    overflow: "hidden",
    gap: 2,
  },
  heroGlow: {
    position: "absolute",
    top: -60,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(52,211,153,0.16)",
  },
  heroKicker: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  heroGreeting: { color: colors.muted, fontSize: 15, fontWeight: "600" },
  heroName: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.6,
    lineHeight: 36,
  },
  heroSub: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 6 },

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

  /* Statistika */
  statRow: { gap: 12, alignItems: "stretch" },
  statCard: {
    flex: 1,
    borderRadius: 18,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    padding: 15,
    overflow: "hidden",
    minHeight: 96,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  statSheen: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 46,
    backgroundColor: "rgba(52,211,153,0.07)",
  },
  statValue: {
    color: colors.primary,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  statLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
    lineHeight: 16,
  },
  statSpacer: { flex: 1 },

  /* Davom etish */
  continueHead: { justifyContent: "space-between", gap: 8, marginBottom: 10 },
  continueTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  continueNext: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 6 },
  progress: { marginTop: 14, marginBottom: 14 },
  continueButton: { marginTop: 2 },

  /* Tezkor havolalar */
  linkRow: { gap: 12 },
  linkButton: { flex: 1, minHeight: 54, borderRadius: 16 },

  /* Yangiliklar */
  newsMeta: { justifyContent: "space-between", gap: 8, marginBottom: 8 },
  newsAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.primary,
  },
  newsTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
  },
  newsSummary: { marginTop: 6 },
  pressed: { opacity: 0.9 },
});
