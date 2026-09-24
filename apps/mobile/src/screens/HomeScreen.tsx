import React, { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, StyleSheet, View } from "react-native";
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
  H1,
  H2,
  H3,
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
      <H1>Xush kelibsiz{user ? `, ${user.fullName}` : ""}</H1>
      <Muted>Statistika, davom etish va so'nggi yangiliklar bir joyda.</Muted>
      <ErrorText message={error} />

      <H2>Statistika</H2>
      {stats.length === 0 ? (
        <EmptyState title="Statistika yo'q" description="Ma'lumot yuklanmadi." />
      ) : (
        statRows.map((rowItems, rowIndex) => (
          <Row key={`stat-row-${rowIndex}`} style={styles.statRow}>
            {rowItems.map((s) => (
              <Card key={s.label} style={styles.statCard}>
                <Muted style={styles.statLabel}>{s.label}</Muted>
                <H2>{s.value}</H2>
              </Card>
            ))}
            {rowItems.length === 1 ? <View style={styles.statSpacer} /> : null}
          </Row>
        ))
      )}

      <H2>Davom etish</H2>
      {continueCourse ? (
        <Card>
          <H3>{continueCourse.title}</H3>
          <Muted style={styles.nextLesson}>
            {continueCourse.nextLessonTitle
              ? `Keyingi dars: ${continueCourse.nextLessonTitle}`
              : "Barcha darslar tugallangan."}
          </Muted>
          <Muted style={styles.progressLabel}>
            {continueCourse.completedCount}/{continueCourse.lessonsCount} dars •{" "}
            {continueCourse.percent}%
          </Muted>
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

      <H2>Tezkor havolalar</H2>
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

      <H2>{showNews ? "Barcha yangiliklar" : "So'nggi yangiliklar"}</H2>
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
            <Card>
              <Row style={styles.newsMeta}>
                {item.category ? <Badge label={item.category} tone="accent" /> : null}
                <Muted>{formatDate(item.publishedAt)}</Muted>
              </Row>
              <H3>{item.title}</H3>
              {item.summary ? <Muted numberOfLines={2}>{item.summary}</Muted> : null}
            </Card>
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  statRow: { gap: 12, alignItems: "stretch" },
  statCard: { flex: 1, padding: 14 },
  statLabel: { marginBottom: 4 },
  statSpacer: { flex: 1 },
  nextLesson: { marginTop: 6 },
  progressLabel: { marginTop: 4, marginBottom: 8 },
  progress: { marginBottom: 12 },
  continueButton: { marginTop: 4 },
  linkRow: { gap: 12 },
  linkButton: { flex: 1 },
  newsMeta: { justifyContent: "space-between", gap: 8, marginBottom: 6 },
  pressed: { opacity: 0.9 },
});
