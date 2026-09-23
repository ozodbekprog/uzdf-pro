import React, { useState } from "react";
import { Button, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import {
  clearTokens,
  getDashboard,
  getMe,
  isLoggedIn,
  login,
  logout,
  registerUser,
  verifyEmail,
  type DashboardData,
  type PublicUser,
} from "../api";
import { Card, ErrorText, H1, H2, Muted, colors } from "../components/ui";

export default function CabinetScreen() {
  const [email, setEmail] = useState("pilot@uzdf.pro");
  const [password, setPassword] = useState("Pilot123!");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [dash, setDash] = useState<DashboardData | null>(null);

  async function refreshAll(u?: PublicUser) {
    const me = u ?? (await getMe());
    setUser(me);
    try {
      setDash(await getDashboard());
    } catch {
      setDash(null);
    }
  }

  async function onLogin() {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const u = await login(email.trim(), password);
      await refreshAll(u);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setBusy(false);
    }
  }

  async function onRegister() {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const res = await registerUser({ email: email.trim(), password, fullName });
      setInfo(
        res.devOtp
          ? `Ro'yxatdan o'tdingiz! Dev OTP: ${res.devOtp} — uni pastga kiriting.`
          : "Ro'yxatdan o'tdingiz! Email'ga kelgan OTP ni kiriting."
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setBusy(false);
    }
  }

  async function onVerify() {
    setBusy(true);
    setError(null);
    try {
      await verifyEmail(email.trim(), otp.trim());
      const u = await login(email.trim(), password);
      await refreshAll(u);
      setInfo("Email tasdiqlandi, xush kelibsiz!");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setBusy(false);
    }
  }

  async function onLogout() {
    await logout().catch(() => clearTokens());
    setUser(null);
    setDash(null);
  }

  async function onRefresh() {
    setError(null);
    try {
      if (await isLoggedIn()) await refreshAll();
      else {
        setUser(null);
        setDash(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    }
  }

  // первичная проверка сессии
  React.useEffect(() => {
    onRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (user) {
    return (
      <ScrollView style={styles.wrap} contentContainerStyle={styles.content}>
        <H1>Kabinet</H1>
        <Card>
          <H2>{user.fullName}</H2>
          <Muted>
            {user.email} • {user.role} • {user.exp} EXP
          </Muted>
          <View style={styles.btn}>
            <Button title="Chiqish" onPress={onLogout} color={colors.red} />
          </View>
        </Card>
        {dash && (
          <Card>
            <H2>Statistika</H2>
            <Text style={styles.line}>Daraja: {dash.stats.level}</Text>
            <Text style={styles.line}>EXP: {dash.stats.exp}</Text>
            <Text style={styles.line}>Yakunlangan darslar: {dash.stats.completedLessons}</Text>
            <Text style={styles.line}>Sertifikatlar: {dash.stats.certificates}</Text>
            {dash.courses.map((c) => (
              <Text key={c.id} style={styles.line}>
                • {c.title}: {c.completedCount}/{c.lessonsCount} ({c.percent}%)
              </Text>
            ))}
          </Card>
        )}
        <ErrorText message={error} />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.content}>
      <H1>{mode === "login" ? "Kirish" : "Ro'yxatdan o'tish"}</H1>
      <View style={styles.row}>
        <Button title="Kirish" onPress={() => setMode("login")} color={mode === "login" ? colors.primary : "#94a3b8"} />
        <Button title="Registratsiya" onPress={() => setMode("register")} color={mode === "register" ? colors.primary : "#94a3b8"} />
      </View>
      <Card>
        {mode === "register" && (
          <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="F.I.Sh" />
        )}
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Parol"
          secureTextEntry
        />
        <Button
          title={busy ? "Kuting..." : mode === "login" ? "Kirish" : "Ro'yxatdan o'tish"}
          onPress={mode === "login" ? onLogin : onRegister}
          disabled={busy}
          color={colors.primary}
        />
      </Card>

      {mode === "register" && (
        <Card>
          <H2>Email tasdiqlash (OTP)</H2>
          <TextInput style={styles.input} value={otp} onChangeText={setOtp} placeholder="OTP kod" keyboardType="number-pad" />
          <Button title="Tasdiqlash va kirish" onPress={onVerify} disabled={busy} color={colors.primary} />
        </Card>
      )}

      {info ? (
        <Card>
          <Text style={styles.info}>{info}</Text>
        </Card>
      ) : null}
      <ErrorText message={error} />
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
    marginVertical: 6,
    backgroundColor: "#fff",
    color: colors.text,
  },
  row: { flexDirection: "row", gap: 8, marginVertical: 8 },
  btn: { marginTop: 10 },
  line: { color: colors.text, marginTop: 4 },
  info: { color: colors.green },
});
