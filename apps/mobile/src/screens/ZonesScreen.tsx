import React, { useEffect, useState } from "react";
import { RefreshControl, StyleSheet, View } from "react-native";
import {
  checkZone,
  getZones,
  type Zone,
  type ZoneCheckResult,
  type ZoneType,
} from "../api";
import {
  Badge,
  Body,
  Button,
  Card,
  EmptyState,
  ErrorText,
  Field,
  H1,
  H2,
  H3,
  Input,
  Loader,
  Muted,
  Row,
  Screen,
  colors,
  zoneColor,
} from "../components/ui";

/** Natija holatiga mos matn. */
const STATUS_LABEL: Record<ZoneCheckResult["status"], string> = {
  CLEAR: "Erkin zona — uchish mumkin",
  RED: "Taqiqlangan zona — uchish mumkin emas",
  YELLOW: "Cheklangan zona — ehtiyot bo'ling",
  GREEN: "Erkin zona",
};

/** Natija bannerining fon rangi. */
const STATUS_BG: Record<ZoneCheckResult["status"], string> = {
  CLEAR: "rgba(52,211,153,0.14)",
  RED: "rgba(248,113,113,0.14)",
  YELLOW: "rgba(251,191,36,0.14)",
  GREEN: "rgba(52,211,153,0.14)",
};

/** Zona turini Badge ohangiga moslashtiradi (rang zoneColor bilan bir xil). */
function zoneTone(type: ZoneType): "danger" | "warning" | "primary" {
  if (type === "RED") return "danger";
  if (type === "YELLOW") return "warning";
  return "primary";
}

export default function ZonesScreen() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [check, setCheck] = useState<ZoneCheckResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);

  async function load(isRefresh = false) {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      setListError(null);
      setZones(await getZones());
    } catch (e) {
      setListError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCheck() {
    const latNum = Number(lat.trim().replace(",", "."));
    const lngNum = Number(lng.trim().replace(",", "."));

    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
      setCheck(null);
      setCheckError("Iltimos, to'g'ri kenglik va uzunlik kiriting.");
      return;
    }

    setChecking(true);
    setCheckError(null);
    try {
      setCheck(await checkZone(latNum, lngNum));
    } catch (e) {
      setCheck(null);
      setCheckError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setChecking(false);
    }
  }

  if (loading) {
    return <Loader label="Zonalar yuklanmoqda..." />;
  }

  return (
    <Screen
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => load(true)}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <H1>Uchish zonalari</H1>
      <Muted>RED — taqiqlangan, YELLOW — cheklangan, GREEN — erkin.</Muted>

      <Card>
        <H2>Koordinata tekshiruvi</H2>
        <Muted>Kenglik va uzunlikni kiriting — nuqta qaysi zonaga tushishini aniqlaymiz.</Muted>

        <Row style={styles.inputs}>
          <View style={styles.half}>
            <Field label="Kenglik (lat)">
              <Input
                value={lat}
                onChangeText={setLat}
                keyboardType="numbers-and-punctuation"
                placeholder="41.2579"
                autoCapitalize="none"
              />
            </Field>
          </View>
          <View style={styles.half}>
            <Field label="Uzunlik (lng)">
              <Input
                value={lng}
                onChangeText={setLng}
                keyboardType="numbers-and-punctuation"
                placeholder="69.2812"
                autoCapitalize="none"
              />
            </Field>
          </View>
        </Row>

        <Button title="Tekshirish" onPress={onCheck} loading={checking} />

        <ErrorText message={checkError} />

        {check ? (
          <View
            style={[
              styles.banner,
              {
                borderColor: zoneColor(check.status),
                backgroundColor: STATUS_BG[check.status],
              },
            ]}
          >
            <Body style={[styles.bannerTitle, { color: zoneColor(check.status) }]}>
              {check.status}
            </Body>
            <Muted>{STATUS_LABEL[check.status]}</Muted>

            {check.zones.length > 0 ? (
              <View style={styles.resultZones}>
                {check.zones.map((z) => (
                  <Row key={z.id} style={styles.resultZoneRow}>
                    <View style={[styles.dot, { backgroundColor: zoneColor(z.type) }]} />
                    <Body style={styles.grow}>{z.name}</Body>
                    <Badge label={z.type} tone={zoneTone(z.type)} />
                  </Row>
                ))}
              </View>
            ) : (
              <Muted>Nuqta hech qaysi zonaga tushmaydi.</Muted>
            )}
          </View>
        ) : null}
      </Card>

      <H2>Zonalar ro'yxati ({zones.length})</H2>

      <ErrorText message={listError} />

      {zones.length === 0 ? (
        listError ? null : (
          <EmptyState
            title="Zonalar topilmadi"
            description="Hozircha hech qanday uchish zonasi kiritilmagan."
          />
        )
      ) : (
        zones.map((z) => (
          <Card
            key={z.id}
            style={[styles.zoneCard, { borderLeftColor: zoneColor(z.type) }]}
          >
            <Row style={styles.zoneHeader}>
              <View style={styles.grow}>
                <H3>{z.name}</H3>
              </View>
              <Badge label={z.type} tone={zoneTone(z.type)} />
            </Row>

            {z.description ? <Muted>{z.description}</Muted> : null}

            <Row style={styles.meta}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: z.active ? colors.primary : colors.dim },
                ]}
              />
              <Muted>{z.active ? "Faol" : "Nofaol"}</Muted>
            </Row>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  inputs: { gap: 12, alignItems: "flex-start", marginTop: 8 },
  half: { flex: 1 },

  banner: {
    marginTop: 14,
    borderWidth: 2,
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  bannerTitle: { fontSize: 20, fontWeight: "800", letterSpacing: 0.5 },

  resultZones: { marginTop: 6, gap: 8 },
  resultZoneRow: { gap: 8 },

  grow: { flex: 1 },

  dot: { width: 10, height: 10, borderRadius: 5 },

  zoneCard: { borderLeftWidth: 4, paddingLeft: 14 },
  zoneHeader: { justifyContent: "space-between", gap: 8, marginBottom: 6 },
  meta: { gap: 6, marginTop: 8 },
});
