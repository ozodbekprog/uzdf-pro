import React, { useEffect, useState } from "react";
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  DEFAULT_API_URL,
  checkZone,
  getApiUrl,
  getZones,
  setApiUrl,
  type Zone,
  type ZoneCheckResult,
} from "../api";
import { Card, ErrorText, H1, H2, Loader, Muted, colors, zoneColor } from "../components/ui";

export default function ZonesScreen() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [apiUrl, setApiUrlInput] = useState(DEFAULT_API_URL);
  const [lat, setLat] = useState("41.2579");
  const [lng, setLng] = useState("69.2812");
  const [check, setCheck] = useState<ZoneCheckResult | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setApiUrlInput(await getApiUrl());
        setZones(await getZones());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Xatolik");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function saveUrl() {
    try {
      await setApiUrl(apiUrl.trim());
      setLoading(true);
      setError(null);
      setZones(await getZones());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setLoading(false);
    }
  }

  async function onCheck() {
    setChecking(true);
    setError(null);
    try {
      const res = await checkZone(parseFloat(lat), parseFloat(lng));
      setCheck(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setChecking(false);
    }
  }

  if (loading) return <Loader />;

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.content}>
      <H1>UZDF Pro</H1>
      <Muted>BPLA uchuvchilari platformasi — geozonalar, akademiya, kabinet.</Muted>

      <Card>
        <H2>API manzili</H2>
        <Muted>Telefon va kompyuter bitta Wi-Fi da bo'lsin.</Muted>
        <TextInput style={styles.input} value={apiUrl} onChangeText={setApiUrlInput} autoCapitalize="none" />
        <Button title="Saqlash va qayta ulash" onPress={saveUrl} color={colors.primary} />
      </Card>

      <Card>
        <H2>Nuqtani tekshirish</H2>
        <View style={styles.row}>
          <TextInput style={[styles.input, styles.half]} value={lat} onChangeText={setLat} keyboardType="decimal-pad" placeholder="lat" />
          <TextInput style={[styles.input, styles.half]} value={lng} onChangeText={setLng} keyboardType="decimal-pad" placeholder="lng" />
        </View>
        <Button title={checking ? "Tekshirilmoqda..." : "Tekshirish"} onPress={onCheck} disabled={checking} color={colors.primary} />
        {check && (
          <View style={styles.result}>
            <Text style={[styles.status, { color: zoneColor(check.status) }]}>{check.status}</Text>
            {check.zones.map((z) => (
              <Text key={z.id} style={styles.zoneLine}>
                • {z.name} ({z.type})
              </Text>
            ))}
            {check.zones.length === 0 && <Muted>Ochiq hudud — taqiq yo'q.</Muted>}
          </View>
        )}
      </Card>

      <ErrorText message={error} />

      <H2>Geozonalar ({zones.length})</H2>
      {zones.map((z) => (
        <Card key={z.id}>
          <View style={styles.titleRow}>
            <View style={[styles.dot, { backgroundColor: zoneColor(z.type) }]} />
            <Text style={styles.zoneName}>{z.name}</Text>
          </View>
          {z.description ? <Muted>{z.description}</Muted> : null}
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    backgroundColor: "#fff",
    color: colors.text,
  },
  row: { flexDirection: "row", gap: 8 },
  half: { flex: 1 },
  result: { marginTop: 12 },
  status: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  zoneName: { fontSize: 16, fontWeight: "600", color: colors.text, flex: 1 },
  zoneLine: { color: colors.text, marginTop: 2 },
});
