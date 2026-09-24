import React, { useCallback, useEffect, useState } from "react";
import { Image, Pressable, RefreshControl, StyleSheet } from "react-native";
import { getApiUrl, getNews, type NewsItem } from "../api";
import {
  Badge,
  Card,
  EmptyState,
  ErrorText,
  H1,
  H3,
  Loader,
  Muted,
  Row,
  Screen,
  colors,
  formatDate,
} from "../components/ui";

export default function NewsScreen({ onOpenNews }: { onOpenNews: (slug: string) => void }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [baseUrl, setBaseUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [items, url] = await Promise.all([getNews(), getApiUrl()]);
      setNews(items);
      setBaseUrl(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    }
  }, []);

  useEffect(() => {
    (async () => {
      await load();
      setLoading(false);
    })();
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (loading) return <Loader label="Yangiliklar yuklanmoqda..." />;

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
      <H1>Yangiliklar</H1>
      <Muted>So'nggi yangiliklar va e'lonlar.</Muted>
      <ErrorText message={error} />

      {news.length === 0 ? (
        <EmptyState
          title="Yangiliklar yo'q"
          description="Hozircha e'lon qilingan yangiliklar mavjud emas."
        />
      ) : (
        news.map((item) => (
          <Pressable key={item.id} onPress={() => onOpenNews(item.slug)}>
            <Card>
              {item.coverUrl ? (
                <Image
                  source={{ uri: `${baseUrl}${item.coverUrl}` }}
                  style={styles.cover}
                  resizeMode="cover"
                />
              ) : null}
              <Row style={styles.meta}>
                {item.category ? <Badge label={item.category} tone="accent" /> : null}
                <Muted>{formatDate(item.publishedAt)}</Muted>
              </Row>
              <H3>{item.title}</H3>
              {item.summary ? (
                <Muted numberOfLines={2} style={styles.summary}>
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
  cover: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: colors.surfaceAlt,
  },
  meta: { gap: 8, marginBottom: 6 },
  summary: { marginTop: 4 },
});
