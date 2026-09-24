import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { login, registerUser, verifyEmail } from "../api";
import {
  Badge,
  Body,
  Button,
  Card,
  ErrorText,
  Field,
  H2,
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
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>D</Text>
          </View>
          <Text style={styles.brand}>DRONCHI</Text>
          <Muted>Dron ekotizimi — boshqaruv paneli</Muted>
        </View>

        <View style={styles.segment}>
          <Button
            title="Kirish"
            variant={mode === "login" ? "primary" : "secondary"}
            onPress={() => switchMode("login")}
            style={styles.segmentBtn}
          />
          <Button
            title="Ro'yxatdan o'tish"
            variant={mode === "register" ? "primary" : "secondary"}
            onPress={() => switchMode("register")}
            style={styles.segmentBtn}
          />
        </View>

        {mode === "login" && (
          <Card>
            <H2>Hisobingizga kiring</H2>
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
          <Card>
            <H2>Yangi hisob yaratish</H2>
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
          <Card>
            <H2>Emailni tasdiqlash</H2>
            <Body>Emailingizga 6 xonali kod yuborildi.</Body>
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
          <Card>
            <Muted>{info}</Muted>
          </Card>
        ) : null}

        <ErrorText message={error} />

        <Muted style={styles.note}>
          Test akkauntlari: pilot@uzdf.pro / Dronchi-Pilot-2026!
        </Muted>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 48, gap: 16 },
  header: { alignItems: "center", gap: 8, marginTop: 24, marginBottom: 4 },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { fontSize: 30, fontWeight: "800", color: colors.bg },
  brand: { fontSize: 28, fontWeight: "800", color: colors.primary, letterSpacing: 2 },
  segment: { flexDirection: "row", gap: 8 },
  segmentBtn: { flex: 1 },
  submit: { marginTop: 8 },
  devRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  otpInput: { letterSpacing: 8, textAlign: "center", fontSize: 20, fontWeight: "700" },
  backRow: { marginTop: 12, alignItems: "center" },
  note: { textAlign: "center", marginTop: 8 },
});
