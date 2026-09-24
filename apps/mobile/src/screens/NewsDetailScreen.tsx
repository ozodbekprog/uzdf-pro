import React, { useEffect, useState } from "react";
import { Image, StyleSheet } from "react-native";
import { getApiUrl, getNewsItem, type NewsDetail } from "../api";
import {
  Badge,
  Body,
  Button,
  ErrorText,
  H1,
  Loader,
  Muted,
  Row,
  Screen,
  colors,
  formatDate,
} from "../components/ui";

export default function NewsDetailScreen({
  slug,
  onBack,
}: {
  slug: string;
  onBack: () => void;
}) {
  const [item, setItem] = useState<NewsDetail | null>(null);
  const [baseUrl, setBaseUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const [detail, url] = await Promise.all([getNewsItem(slug), getApiUrl()]);
        setItem(detail);
        setBaseUrl(url);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Xatolik");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) return <Loader label="Yangilik yuklanmoqda..." />;

  return (
    <Screen>
      <Button title="‹ Orqaga" variant="ghost" onPress={onBack} />

      {item ? (
        <>
          <H1>{item.title}</H1>
          <Row style={styles.meta}>
            {item.category ? <Badge label={item.category} tone="accent" /> : null}
            <Muted>{formatDate(item.publishedAt)}</Muted>
          </Row>
          {item.coverUrl ? (
            <Image
              source={{ uri: `${baseUrl}${item.coverUrl}` }}
              style={styles.cover}
              resizeMode="cover"
            />
          ) : null}
          {item.body
            .split("\n\n")
            .filter((paragraph) => paragraph.trim().length > 0)
            .map((paragraph, index) => (
              <Body key={index} style={styles.paragraph}>
                {paragraph}
              </Body>
            ))}
        </>
      ) : null}

      <ErrorText message={error} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  meta: { gap: 8 },
  cover: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
  },
  paragraph: { marginBottom: 12 },
});
