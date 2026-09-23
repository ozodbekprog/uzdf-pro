import React, { useEffect, useState } from "react";
import { Button, Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  completeLesson,
  getCourse,
  getCourses,
  isLoggedIn,
  type CourseDetail,
  type CourseSummary,
} from "../api";
import { Card, ErrorText, H1, H2, Loader, Muted, colors } from "../components/ui";

export default function AcademyScreen() {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [detail, setDetail] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLogged(await isLoggedIn());
        setCourses(await getCourses());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Xatolik");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function openCourse(slug: string) {
    setError(null);
    try {
      setDetail(await getCourse(slug));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    }
  }

  async function onComplete(lessonId: string) {
    setBusy(lessonId);
    setError(null);
    try {
      const res = await completeLesson(lessonId);
      setError(null);
      if (detail) {
        // локально помечаем урок выполненным повторным запросом курса
        setDetail(await getCourse(detail.slug));
      }
      alert(
        res.alreadyCompleted
          ? "Bu dars allaqachon yakunlangan."
          : `Tabriklaymiz! +${res.expAwarded} EXP`
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <Loader />;

  if (detail) {
    return (
      <ScrollView style={styles.wrap} contentContainerStyle={styles.content}>
        <Button title="← Kurslar" onPress={() => setDetail(null)} color={colors.primary} />
        <H1>{detail.title}</H1>
        {detail.description ? <Muted>{detail.description}</Muted> : null}
        <ErrorText message={error} />
        {detail.lessons.map((l) => (
          <Card key={l.id}>
            <H2>
              {l.position}. {l.title}
            </H2>
            <Muted numberOfLines={4}>{l.content}</Muted>
            {l.videoUrl ? (
              <View style={styles.link}>
                <Button title="Videoni ochish" onPress={() => Linking.openURL(l.videoUrl!)} color={colors.primary} />
              </View>
            ) : null}
            <View style={styles.link}>
              <Button
                title={busy === l.id ? "Yuborilmoqda..." : "Yakunlash (+EXP)"}
                onPress={() => onComplete(l.id)}
                disabled={busy !== null || !logged}
                color={colors.primary}
              />
            </View>
            {!logged && <Muted>Kirish qilinmagan — yakunlash uchun Kabinet'da kiring.</Muted>}
          </Card>
        ))}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.content}>
      <H1>Akademiya</H1>
      <Muted>Video darslar, progress va EXP.</Muted>
      <ErrorText message={error} />
      {courses.map((c) => (
        <Card key={c.id}>
          <Text style={styles.title} onPress={() => openCourse(c.slug)}>
            {c.title}
          </Text>
          {c.description ? <Muted numberOfLines={2}>{c.description}</Muted> : null}
          <Muted>Darslar: {c.lessonsCount}</Muted>
          <View style={styles.link}>
            <Button title="Ochish" onPress={() => openCourse(c.slug)} color={colors.primary} />
          </View>
        </Card>
      ))}
      {courses.length === 0 && <Muted>Hozircha kurslar yo'q.</Muted>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 17, fontWeight: "700", color: colors.primary, marginBottom: 4 },
  link: { marginTop: 8 },
});
