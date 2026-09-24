import React, { useCallback, useEffect, useState } from "react";
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";

import AcademyScreen from "./src/screens/AcademyScreen";
import CabinetScreen from "./src/screens/CabinetScreen";
import CourseScreen from "./src/screens/CourseScreen";
import HomeScreen from "./src/screens/HomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import NewsDetailScreen from "./src/screens/NewsDetailScreen";
import NewsScreen from "./src/screens/NewsScreen";
import ShopScreen from "./src/screens/ShopScreen";
import ZonesScreen from "./src/screens/ZonesScreen";
import { isLoggedIn } from "./src/api";
import { TAB_LABELS, type MobileTab } from "./src/navigation";
import { colors, Loader } from "./src/components/ui";

/** Tab bo'lmagan ekranlar (stack). */
type Stack =
  | { name: "tabs" }
  | { name: "course"; slug: string }
  | { name: "news" }
  | { name: "newsDetail"; slug: string };

const TABS: MobileTab[] = ["home", "academy", "zones", "shop", "cabinet"];

export default function App() {
  const [booted, setBooted] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<MobileTab>("home");
  const [stack, setStack] = useState<Stack>({ name: "tabs" });

  useEffect(() => {
    let active = true;
    isLoggedIn()
      .then((value) => {
        if (active) setAuthed(value);
      })
      .finally(() => {
        if (active) setBooted(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const openCourse = useCallback((slug: string) => {
    setStack({ name: "course", slug });
  }, []);

  const openNewsList = useCallback(() => {
    setStack({ name: "news" });
  }, []);

  const openNewsDetail = useCallback((slug: string) => {
    setStack({ name: "newsDetail", slug });
  }, []);

  const goBack = useCallback(() => {
    setStack((current) => (current.name === "newsDetail" ? { name: "news" } : { name: "tabs" }));
  }, []);

  const handleLoggedIn = useCallback(() => {
    setAuthed(true);
    setTab("home");
    setStack({ name: "tabs" });
  }, []);

  const handleLoggedOut = useCallback(() => {
    setAuthed(false);
    setTab("home");
    setStack({ name: "tabs" });
  }, []);

  if (!booted) {
    return (
      <SafeAreaView style={styles.safe}>
        <ExpoStatusBar style="light" />
        <Loader label="Yuklanmoqda..." />
      </SafeAreaView>
    );
  }

  if (!authed) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
        <ExpoStatusBar style="light" />
        <LoginScreen onLoggedIn={handleLoggedIn} />
      </SafeAreaView>
    );
  }

  const renderTab = () => {
    switch (tab) {
      case "home":
        return (
          <HomeScreen
            onNavigate={setTab}
            onOpenCourse={openCourse}
            onOpenNews={openNewsDetail}
          />
        );
      case "academy":
        return <AcademyScreen onOpenCourse={openCourse} />;
      case "zones":
        return <ZonesScreen />;
      case "shop":
        return <ShopScreen onGoToLogin={handleLoggedOut} />;
      case "cabinet":
        return <CabinetScreen onLoggedOut={handleLoggedOut} />;
      default:
        return null;
    }
  };

  const headerTitle =
    stack.name === "tabs"
      ? TAB_LABELS[tab]
      : stack.name === "course"
        ? "Kurs"
        : stack.name === "news"
          ? "Yangiliklar"
          : "Yangilik";

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <ExpoStatusBar style="light" />

      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>D</Text>
          </View>
          <Text style={styles.brandText}>
            DRON<Text style={styles.brandAccent}>CHI</Text>
          </Text>
        </View>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
      </View>

      <View style={styles.body}>
        {stack.name === "tabs" ? renderTab() : null}
        {stack.name === "course" ? (
          <CourseScreen slug={stack.slug} onBack={goBack} />
        ) : null}
        {stack.name === "news" ? <NewsScreen onOpenNews={openNewsDetail} /> : null}
        {stack.name === "newsDetail" ? (
          <NewsDetailScreen slug={stack.slug} onBack={goBack} />
        ) : null}
      </View>

      {stack.name === "tabs" ? (
        <View style={styles.tabbar}>
          {TABS.map((id) => {
            const active = tab === id;
            return (
              <TouchableOpacity
                key={id}
                style={styles.tab}
                activeOpacity={0.7}
                onPress={() => setTab(id)}
              >
                <View style={[styles.tabDot, active ? styles.tabDotActive : null]} />
                <Text style={[styles.tabLabel, active ? styles.tabLabelActive : null]}>
                  {TAB_LABELS[id]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 12 : 4,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 6
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  logo: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  logoText: { color: "#04121f", fontWeight: "800", fontSize: 15 },
  brandText: { color: colors.text, fontWeight: "800", fontSize: 16, letterSpacing: -0.3 },
  brandAccent: { color: colors.primary },
  headerTitle: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  body: { flex: 1, backgroundColor: colors.bg },
  tabbar: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", gap: 4 },
  tabDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "transparent" },
  tabDotActive: { backgroundColor: colors.primary },
  tabLabel: { color: colors.dim, fontSize: 11, fontWeight: "600" },
  tabLabelActive: { color: colors.primary }
});
