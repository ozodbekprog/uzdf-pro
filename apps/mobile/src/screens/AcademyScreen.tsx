import React, { useCallback, useEffect, useState } from "react";
import { Image, Pressable, RefreshControl, StyleSheet } from "react-native";
import {
  getApiUrl,
  getCourses,
  isLoggedIn,
  type CourseSummary,
} from "../api";
import {
  Badge,
  Body,
  Button,
  Card,
  EmptyState,
  ErrorText,
  H1,
  H2,
  H3,
  Loader,
  Muted,
  Row,
  Screen,
  colors,
} from "../components/ui";

/** API `coverUrl` ni qaytaradi, lekin `CourseSummary` tipida hozircha yo'q. */
type CourseListItem = CourseSummary & { coverUrl?: string | null };

export default function AcademyScreen({
  onOpenCourse,
}: {
  onOpenCourse: (slug: string) => void;
}) {
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [apiUrl, setApiUrl] = useState("");
  const [logged, setLogged] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [url, list, auth] = await Promise.all([
        getApiUrl(),
        getCourses(),
        isLoggedIn(),
      ]);
      setApiUrl(url);
      setCourses(list);
      setLogged(auth);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
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

  if (loading) return <Loader />;

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
      <H1>Akademiya</H1>
      <Muted>Video va matnli darslar — har bir dars uchun EXP.</Muted>

      <ErrorText message={error} />

      {!logged ? (
        <Card>
          <Row style={styles.warningHead}>
            <Badge label="Diqqat" tone="warning" />
          </Row>
          <H3>Progressni saqlash uchun tizimga kiring</H3>
          <Body>Kabinet bo'limida kiring — natijalar va EXP saqlanadi.</Body>
        </Card>
      ) : null}

      {courses.length === 0 ? (
        <EmptyState
          title="Kurslar yo'q"
          description="Hozircha mavjud kurslar topilmadi."
        />
      ) : (
        courses.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => onOpenCourse(c.slug)}
            style={({ pressed }) => (pressed ? styles.pressed : undefined)}
          >
            <Card>
              {c.coverUrl ? (
                <Image
                  source={{ uri: `${apiUrl}${c.coverUrl}` }}
                  style={styles.cover}
                  resizeMode="cover"
                />
              ) : null}
              <H2>{c.title}</H2>
              {c.description ? (
                <Muted numberOfLines={2}>{c.description}</Muted>
              ) : null}
              <Row style={styles.badgeRow}>
                <Badge label={`${c.lessonsCount} ta dars`} tone="primary" />
              </Row>
              <Button
                title="Kursni ochish"
                variant="secondary"
                onPress={() => onOpenCourse(c.slug)}
                style={styles.openButton}
              />
            </Card>
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  warningHead: { marginBottom: 8 },
  cover: { height: 140, borderRadius: 12, width: "100%", marginBottom: 12 },
  badgeRow: { marginTop: 10 },
  openButton: { marginTop: 12 },
  pressed: { opacity: 0.9 },
});
