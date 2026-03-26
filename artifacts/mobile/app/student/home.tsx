import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const logoImage = require("@/assets/images/literaku-logo.png");
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import SwipeHintBar from "@/components/SwipeHintBar";
import SwipeVoiceWrapper from "@/components/SwipeVoiceWrapper";
import { voiceHints } from "@/constants/data";
import { useReadingPreferences } from "@/contexts/ReadingPreferences";
import { useVoiceActivation } from "@/contexts/VoiceActivation";
import { useT } from "@/hooks/useTranslation";
import { useTTSAnnounce } from "@/hooks/useTTSAnnounce";
import type { VoiceIntent } from "@/services/voiceRouter";
import { findBookByTitle } from "@/services/voiceRouter";

interface NavButtonProps {
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint: string;
}

function NavButton({ label, subtitle, icon, color, onPress, accessibilityLabel, accessibilityHint }: NavButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.navButton,
        { backgroundColor: color, opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      <View style={styles.navIconCircle}>
        <Ionicons name={icon} size={32} color={color} />
      </View>
      <View style={styles.navInfo}>
        <Text style={styles.navTitle}>{label}</Text>
        <Text style={styles.navSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={28} color="rgba(255,255,255,0.7)" />
    </Pressable>
  );
}

export default function StudentHomeScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;
  const { isVoiceOnly, interactionMode, language } = useReadingPreferences();
  const { onTranscription, clearTranscriptionCallback } = useVoiceActivation();
  const t = useT();

  const modeLabel = language === "id"
    ? (interactionMode === "voice" ? "suara" : "sentuh")
    : (interactionMode === "voice" ? "voice" : "touch");
  useTTSAnnounce(t.home.mountAnnounce(modeLabel));

  React.useEffect(() => {
    onTranscription((_text: string, intent: VoiceIntent, param?: string) => {
      if (intent === "open_book" && param) {
        const book = findBookByTitle(param);
        if (book) {
          router.push({ pathname: "/student/book/[id]", params: { id: book.id } });
          return true;
        }
      }
      return false;
    });
    return () => clearTranscriptionCallback();
  }, []);

  return (
    <SwipeVoiceWrapper>
      <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
        <StatusBar style="dark" />

        <View style={[styles.freezeZone, isVoiceOnly && styles.frozen, { pointerEvents: isVoiceOnly ? 'none' : 'auto' }]}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Image source={logoImage} style={styles.logoImage} accessibilityLabel="Literaku logo" />
              <Text style={styles.headerTitle}>Literaku</Text>
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <NavButton
              label={t.home.joinInstitution}
              subtitle={t.home.joinInstitutionSub}
              icon="school"
              color="#E65100"
              onPress={() => router.push("/student/riwayat")}
              accessibilityLabel={t.home.joinInstitutionA11yLabel}
              accessibilityHint={t.home.joinInstitutionA11yHint}
            />

            <NavButton
              label={t.home.explorer}
              subtitle={t.home.explorerSub}
              icon="compass"
              color="#2E7D32"
              onPress={() => router.push("/student/penjelajah")}
              accessibilityLabel={t.home.explorerA11yLabel}
              accessibilityHint={t.home.explorerA11yHint}
            />

            <NavButton
              label={t.home.collection}
              subtitle={t.home.collectionSub}
              icon="library"
              color="#1565C0"
              onPress={() => router.push("/student/library")}
              accessibilityLabel={t.home.collectionA11yLabel}
              accessibilityHint={t.home.collectionA11yHint}
            />

            <NavButton
              label={t.home.history}
              subtitle={t.home.historySub}
              icon="time"
              color="#C62828"
              onPress={() => router.push("/student/riwayat")}
              accessibilityLabel={t.home.historyA11yLabel}
              accessibilityHint={t.home.historyA11yHint}
            />

            <NavButton
              label={t.home.settings}
              subtitle={t.home.settingsSub}
              icon="settings"
              color="#546E7A"
              onPress={() => router.push("/student/settings")}
              accessibilityLabel={t.home.settingsA11yLabel}
              accessibilityHint={t.home.settingsA11yHint}
            />

            <NavButton
              label={t.home.guide}
              subtitle={t.home.guideSub}
              icon="help-circle"
              color="#37474F"
              onPress={() => router.push("/student/guide")}
              accessibilityLabel={t.home.guideA11yLabel}
              accessibilityHint={t.home.guideA11yHint}
            />
          </ScrollView>
        </View>

        <SwipeHintBar
          hints={voiceHints.studentHome}
          showHelpButton
          onHelpPress={() => router.push("/student/guide")}
        />
      </View>
    </SwipeVoiceWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 18,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  logoImage: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: Colors.primaryLight,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 8,
    gap: 14,
    paddingTop: 8,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 22,
    gap: 16,
    minHeight: 90,
  },
  navIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  navInfo: {
    flex: 1,
    gap: 4,
  },
  navTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: "#FFFFFF",
  },
  navSubtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: "rgba(255,255,255,0.8)",
  },
  freezeZone: {
    flex: 1,
  },
  frozen: {
    opacity: 0.5,
  },
});
