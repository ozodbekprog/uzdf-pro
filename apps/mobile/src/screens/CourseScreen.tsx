import React, { useEffect, useRef, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import {
  completeLesson,
  getCourse,
  getLessonQuiz,
  getProgress,
  startLesson,
  submitQuiz,
  type CourseDetail,
  type Lesson,
  type LessonQuiz,
} from "../api";
import {
  Badge,
  Body,
  Button,
  Card,
  Divider,
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
} from "../components/ui";

type Props = {
  slug: string;
  onBack: () => void;
};

type AnswerMap = Record<string, number | undefined>;
type QuizResult = Awaited<ReturnType<typeof submitQuiz>>;

export default function CourseScreen({ slug, onBack }: Props) {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logged, setLogged] = useState(false);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [startBusy, setStartBusy] = useState(false);
  const [completeBusy, setCompleteBusy] = useState(false);
  const [expMessage, setExpMessage] = useState<string | null>(null);

  const [quiz, setQuiz] = useState<LessonQuiz | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [quizBusy, setQuizBusy] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const selectedRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getCourse(slug);
        if (!alive) return;
        setCourse(data);
        if (data.lessons.length > 0) selectLesson(data.lessons[0]);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : "Xatolik");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    (async () => {
      try {
        const progress = await getProgress();
        if (!alive) return;
        setLogged(true);
        setCompleted(
          new Set(progress.filter((p) => p.completedAt !== null).map((p) => p.lesson.id))
        );
      } catch {
        if (alive) setLogged(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Taymer: dars boshlangach minReadSeconds dan kamayadi, tugagach interval tozalanadi.
  useEffect(() => {
    if (!activeLessonId || remaining <= 0) return;
    const timer = setInterval(() => {
      setRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeLessonId, remaining]);

  async function loadQuiz(lessonId: string) {
    try {
      const res = await getLessonQuiz(lessonId);
      if (!mountedRef.current || selectedRef.current !== lessonId) return;
      setQuiz(res.quiz);
    } catch {
      // Test yo'q (404) yoki xatolik — test bloki ko'rsatilmaydi.
      if (!mountedRef.current || selectedRef.current !== lessonId) return;
      setQuiz(null);
    }
  }

  function selectLesson(lesson: Lesson) {
    selectedRef.current = lesson.id;
    setSelectedLessonId(lesson.id);
    setActiveLessonId(null);
    setRemaining(0);
    setExpMessage(null);
    setQuiz(null);
    setAnswers({});
    setQuizResult(null);
    void loadQuiz(lesson.id);
  }

  async function onStart(lesson: Lesson) {
    setStartBusy(true);
    setError(null);
    setExpMessage(null);
    try {
      await startLesson(lesson.id);
      setActiveLessonId(lesson.id);
      setRemaining(lesson.minReadSeconds);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setStartBusy(false);
    }
  }

  async function onComplete(lesson: Lesson) {
    setCompleteBusy(true);
    setError(null);
    try {
      const res = await completeLesson(lesson.id);
      setExpMessage(
        res.alreadyCompleted
          ? "Bu dars allaqachon yakunlangan."
          : `Tabriklaymiz! +${res.expAwarded} EXP`
      );
      try {
        const progress = await getProgress();
        setLogged(true);
        setCompleted(
          new Set(progress.filter((p) => p.completedAt !== null).map((p) => p.lesson.id))
        );
      } catch {
        // Progressni yangilab bo'lmadi — natija saqlanadi.
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setCompleteBusy(false);
    }
  }

  function selectOption(questionId: string, index: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: index }));
  }

  async function onSubmitQuiz() {
    if (!quiz) return;
    const order = quiz.questions.map((q) => answers[q.id] ?? -1);
    setQuizBusy(true);
    setError(null);
    try {
      const res = await submitQuiz(quiz.id, order);
      setQuizResult(res);
      if (res.expAwarded > 0) setExpMessage(`Test uchun +${res.expAwarded} EXP`);
      try {
        const progress = await getProgress();
        setLogged(true);
        setCompleted(
          new Set(progress.filter((p) => p.completedAt !== null).map((p) => p.lesson.id))
        );
      } catch {
        // Progressni yangilab bo'lmadi — natija saqlanadi.
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setQuizBusy(false);
    }
  }

  if (loading) {
    return (
      <Screen>
        <Loader label="Yuklanmoqda..." />
      </Screen>
    );
  }

  if (!course) {
    return (
      <Screen>
        <Row>
          <Button title="‹ Orqaga" variant="ghost" onPress={onBack} />
        </Row>
        <ErrorText message={error ?? "Kurs topilmadi"} />
      </Screen>
    );
  }

  const total = course.lessons.length;
  const doneCount = course.lessons.filter((l) => completed.has(l.id)).length;
  const percent = total > 0 ? (doneCount / total) * 100 : 0;
  const lesson = course.lessons.find((l) => l.id === selectedLessonId) ?? null;
  const videoUrl = lesson?.videoUrl ?? null;
  const timerDone = lesson !== null && activeLessonId === lesson.id && remaining === 0;
  const allAnswered = quiz ? quiz.questions.every((q) => answers[q.id] !== undefined) : false;

  return (
    <Screen>
      <Row>
        <Button title="‹ Orqaga" variant="ghost" onPress={onBack} />
      </Row>

      <H1>{course.title}</H1>
      {course.description ? <Muted>{course.description}</Muted> : null}

      {total > 0 ? (
        <View style={styles.progressWrap}>
          <ProgressBar value={percent} />
          <Muted>
            {doneCount}/{total} dars yakunlangan
          </Muted>
        </View>
      ) : null}

      <ErrorText message={error} />

      <H2>Darslar</H2>
      {total === 0 ? (
        <EmptyState title="Darslar yo'q" description="Bu kursda hozircha darslar mavjud emas." />
      ) : (
        course.lessons.map((l) => {
          const isDone = completed.has(l.id);
          return (
            <Pressable key={l.id} onPress={() => selectLesson(l)}>
              <Card style={selectedLessonId === l.id ? styles.cardActive : undefined}>
                <Row>
                  <View style={[styles.numCircle, isDone ? styles.numCircleDone : null]}>
                    <Text style={[styles.numText, isDone ? styles.numTextDone : null]}>
                      {l.position}
                    </Text>
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text style={styles.lessonTitle} numberOfLines={2}>
                      {l.title}
                    </Text>
                    <Muted>{l.minReadSeconds} soniya</Muted>
                  </View>
                  {isDone ? <Badge label="Yakunlangan" tone="primary" /> : null}
                </Row>
              </Card>
            </Pressable>
          );
        })
      )}

      {lesson ? (
        <Card>
          <H2>{lesson.title}</H2>
          <Body>{lesson.content}</Body>

          {videoUrl ? (
            <Button
              title="Videoni ochish"
              variant="secondary"
              onPress={() => {
                void Linking.openURL(videoUrl);
              }}
              style={styles.block}
            />
          ) : null}

          <Divider />

          {activeLessonId === lesson.id ? (
            <Muted>Qolgan vaqt: {remaining} soniya</Muted>
          ) : (
            <Muted>
              Darsni boshlang — taymer {lesson.minReadSeconds} soniyadan boshlanadi.
            </Muted>
          )}

          <Row style={styles.actions}>
            <Button
              title="Darsni boshlash"
              onPress={() => {
                void onStart(lesson);
              }}
              loading={startBusy}
              disabled={!logged || startBusy}
              style={styles.actionBtn}
            />
            <Button
              title={completeBusy ? "Yuborilmoqda..." : "Yakunlash"}
              onPress={() => {
                void onComplete(lesson);
              }}
              loading={completeBusy}
              disabled={!logged || !timerDone || completeBusy}
              style={styles.actionBtn}
            />
          </Row>

          {!logged ? <Muted>Yakunlash uchun avval Kabinet orqali kiring.</Muted> : null}
          {expMessage ? <Text style={styles.exp}>{expMessage}</Text> : null}

          {quiz ? (
            <View>
              <Divider />
              <H2>Test</H2>
              <Muted>
                {quiz.title} • o'tish balli: {quiz.passScore}
              </Muted>

              {quiz.questions.map((q, qi) => (
                <View key={q.id} style={styles.question}>
                  <H3>
                    {qi + 1}. {q.text}
                  </H3>
                  {q.options.map((opt, oi) => {
                    const picked = answers[q.id] === oi;
                    return (
                      <Pressable
                        key={`${q.id}-${oi}`}
                        onPress={() => selectOption(q.id, oi)}
                        style={[styles.option, picked ? styles.optionPicked : null]}
                      >
                        <Text style={[styles.optionText, picked ? styles.optionTextPicked : null]}>
                          {opt}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ))}

              {allAnswered ? null : <Muted>Barcha savollarga javob belgilang.</Muted>}

              <Button
                title={quizBusy ? "Yuborilmoqda..." : "Testni topshirish"}
                onPress={() => {
                  void onSubmitQuiz();
                }}
                loading={quizBusy}
                disabled={!allAnswered || quizBusy}
                style={styles.block}
              />

              {quizResult ? (
                <Card style={styles.resultCard}>
                  <H3>Natija</H3>
                  <Body>
                    {quizResult.attempt.score}/{quizResult.attempt.total} to'g'ri javob
                  </Body>
                  <Muted>Foiz: {quizResult.attempt.percent}%</Muted>
                  <Badge
                    label={quizResult.attempt.passed ? "O'tdingiz" : "O'tmadingiz"}
                    tone={quizResult.attempt.passed ? "primary" : "danger"}
                  />
                  {quizResult.expAwarded > 0 ? (
                    <Text style={styles.exp}>+{quizResult.expAwarded} EXP</Text>
                  ) : null}
                </Card>
              ) : null}
            </View>
          ) : null}
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressWrap: { gap: 6 },
  cardActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(52,211,153,0.06)",
  },
  numCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  numCircleDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  numText: { fontSize: 12, fontWeight: "700", color: colors.muted },
  numTextDone: { color: "#04121f" },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 15, fontWeight: "600", color: colors.text, marginBottom: 2 },
  block: { marginTop: 12 },
  actions: { gap: 10, marginTop: 12 },
  actionBtn: { flex: 1 },
  exp: { color: colors.primary, fontWeight: "700", marginTop: 10 },
  question: { marginTop: 14, gap: 8 },
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  optionPicked: { borderColor: colors.primary, backgroundColor: "rgba(52,211,153,0.14)" },
  optionText: { color: colors.text, fontSize: 14 },
  optionTextPicked: { color: colors.primary, fontWeight: "600" },
  resultCard: { marginTop: 12, gap: 6 },
});
