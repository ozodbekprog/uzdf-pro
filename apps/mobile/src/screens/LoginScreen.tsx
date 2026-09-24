import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { login, registerUser, verifyEmail } from "../api";
import {
  Badge,
  Button,
  Card,
  ErrorText,
  Field,
  Input,
  Muted,
  colors,
} from "../components/ui";

type Mode = "login" | "register";
type Step = "form" | "otp";

export default function LoginScreen({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [mode, setMode] = useState<Mode>("login");
  const [step, setStep] = useState<Step>("form");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function switchMode(next: Mode) {
    if (next === mode) return;
    setMode(next);
    setStep("form");
    setOtp("");
    setDevOtp(null);
    setInfo(null);
    setError(null);
  }

  async function onLogin() {
    if (busy) return;
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      await login(email.trim(), password);
      onLoggedIn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setBusy(false);
    }
  }

  async function onRegister() {
    if (busy) return;
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const phoneValue = phone.trim();
      const res = await registerUser({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phone: phoneValue ? phoneValue : undefined,
      });
      setStep("otp");
      setOtp("");
      if (res.devOtp) {
        setDevOtp(res.devOtp);
        setInfo("Test rejimi: kod pastda ko'rsatilgan.");
      } else {
        setDevOtp(null);
        setInfo("Emailingizga kod yuborildi.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setBusy(false);
    }
  }

  async function onVerify() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await verifyEmail(email.trim(), otp.trim());
      await login(email.trim(), password);
      onLoggedIn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.brandBlock}>
          <View style={styles.logoGlow} />
          <View style={styles.logoRing}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>D</Text>
            </View>
          </View>
          <Text style={styles.brand}>
            DRON<Text style={styles.brandAccent}>CHI</Text>
          </Text>
          <Muted style={styles.brandSub}>Dron ekotizimi — boshqaruv paneli</Muted>
        </View>

        <View style={styles.segment}>
          <Pressable
            onPress={() => switchMode("login")}
            style={({ pressed }) => [
              styles.segmentItem,
              mode === "login" ? styles.segmentItemActive : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <Text
              style={[styles.segmentText, mode === "login" ? styles.segmentTextActive : null]}
            >
              Kirish
            </Text>
          </Pressable>
          <Pressable
            onPress={() => switchMode("register")}
            style={({ pressed }) => [
              styles.segmentItem,
              mode === "register" ? styles.segmentItemActive : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                mode === "register" ? styles.segmentTextActive : null,
              ]}
            >
              Ro'yxatdan o'tish
            </Text>
          </Pressable>
        </View>

        {mode === "login" && (
          <Card style={styles.panel}>
            <View style={styles.panelSheen} />
            <Text style={styles.cardTitle}>Hisobingizga kiring</Text>
            <Text style={styles.cardHint}>Email va parolingizni kiriting.</Text>
            <Field label="Email">
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="pilot@uzdf.pro"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
            </Field>
            <Field label="Parol">
              <Input
                value={password}
                onChangeText={setPassword}
                placeholder="Parolingiz"
                secureTextEntry
                onSubmitEditing={onLogin}
                returnKeyType="go"
              />
            </Field>
            <Button
              title="Kirish"
              onPress={onLogin}
              loading={busy}
              disabled={busy}
              style={styles.submit}
            />
          </Card>
        )}

        {mode === "register" && step === "form" && (
          <Card style={styles.panel}>
            <View style={styles.panelSheen} />
            <Text style={styles.cardTitle}>Yangi hisob yaratish</Text>
            <Text style={styles.cardHint}>Ma'lumotlaringizni to'ldiring.</Text>
            <Field label="F.I.Sh">
              <Input
                value={fullName}
                onChangeText={setFullName}
                placeholder="Ism Familiya"
                autoCapitalize="words"
              />
            </Field>
            <Field label="Email">
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="pilot@uzdf.pro"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
            </Field>
            <Field label="Telefon" hint="Ixtiyoriy">
              <Input
                value={phone}
                onChangeText={setPhone}
                placeholder="+998 90 123 45 67"
                keyboardType="phone-pad"
              />
            </Field>
            <Field label="Parol">
              <Input
                value={password}
                onChangeText={setPassword}
                placeholder="Kamida 8 belgi"
                secureTextEntry
                onSubmitEditing={onRegister}
                returnKeyType="go"
              />
            </Field>
            <Button
              title="Ro'yxatdan o'tish"
              onPress={onRegister}
              loading={busy}
              disabled={busy}
              style={styles.submit}
            />
          </Card>
        )}

        {mode === "register" && step === "otp" && (
          <Card style={styles.panel}>
            <View style={styles.panelSheen} />
            <Text style={styles.cardTitle}>Emailni tasdiqlash</Text>
            <Text style={styles.cardHint}>Emailingizga 6 xonali kod yuborildi.</Text>
            {devOtp ? (
              <View style={styles.devRow}>
                <Badge label="Test rejimi" tone="warning" />
                <Muted>Dev OTP: {devOtp}</Muted>
              </View>
            ) : null}
            <Field label="Tasdiqlash kodi">
              <Input
                value={otp}
                onChangeText={setOtp}
                placeholder="000000"
                keyboardType="number-pad"
                maxLength={6}
                style={styles.otpInput}
                onSubmitEditing={onVerify}
                returnKeyType="go"
              />
            </Field>
            <Button
              title="Tasdiqlash"
              onPress={onVerify}
              loading={busy}
              disabled={busy}
              style={styles.submit}
            />
            <View style={styles.backRow}>
              <Button title="Orqaga" variant="ghost" onPress={() => setStep("form")} />
            </View>
          </Card>
        )}

        {info ? (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>{info}</Text>
          </View>
        ) : null}

        <ErrorText message={error} />

        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>Test akkaunti</Text>
          <Muted style={styles.noteText}>pilot@uzdf.pro / Dronchi-Pilot-2026!</Muted>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 48, gap: 16 },

  /* Brend */
  brandBlock: { alignItems: "center", gap: 6, marginTop: 28, marginBottom: 6 },
  logoGlow: {
    position: "absolute",
    top: -14,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(52,211,153,0.12)",
  },
  logoRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "rgba(52,211,153,0.35)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(52,211,153,0.08)",
  },
  logo: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  logoText: { fontSize: 30, fontWeight: "800", color: colors.bg },
  brand: { fontSize: 28, fontWeight: "800", color: colors.text, letterSpacing: 2 },
  brandAccent: { color: colors.primary },
  brandSub: { textAlign: "center" },

  /* Segment */
  segment: {
    flexDirection: "row",
    gap: 6,
    padding: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  segmentItemActive: {
    backgroundColor: "rgba(52,211,153,0.14)",
    borderColor: "rgba(52,211,153,0.35)",
  },
  segmentText: { color: colors.muted, fontSize: 14, fontWeight: "700" },
  segmentTextActive: { color: colors.primary },
  pressed: { opacity: 0.85 },

  /* Forma kartasi */
  panel: {
    borderRadius: 18,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    padding: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  panelSheen: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 80,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  cardHint: { color: colors.muted, fontSize: 12, marginTop: 4, marginBottom: 14 },
  submit: { marginTop: 8 },
  devRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  otpInput: {
    letterSpacing: 8,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
  },
  backRow: { marginTop: 12, alignItems: "center" },

  /* Info va izoh */
  infoBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.32)",
    backgroundColor: "rgba(34,211,238,0.10)",
    padding: 14,
  },
  infoText: { color: colors.accent, fontSize: 13, lineHeight: 19 },
  noteBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  noteTitle: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  noteText: { textAlign: "center" },
});
