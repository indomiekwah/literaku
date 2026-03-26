import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  AccessibilityInfo,
  Image,
  Platform,
  Pressable,
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
import { getTranslations } from "@/constants/translations";
import { useReadingPreferences } from "@/contexts/ReadingPreferences";
import { useVoiceActivation } from "@/contexts/VoiceActivation";
import { useTTSAnnounce } from "@/hooks/useTTSAnnounce";
import type { VoiceIntent } from "@/services/voiceRouter";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;
  const { language } = useReadingPreferences();
  const { onTranscription, clearTranscriptionCallback } = useVoiceActivation();
  const t = getTranslations(language);

  useTTSAnnounce(t.login.mountAnnounce);

  React.useEffect(() => {
    onTranscription((text: string, intent: VoiceIntent) => {
      const lower = text.toLowerCase();
      if (intent === "nav_login" || lower.includes("sign in") || lower.includes("log in") || lower.includes("masuk") || lower.includes("google") || lower.includes("microsoft")) {
        if (lower.includes("google")) {
          handleOAuth("Google");
        } else if (lower.includes("microsoft")) {
          handleOAuth("Microsoft");
        } else {
          AccessibilityInfo.announceForAccessibility(t.login.signingIn);
          router.replace("/student/home");
        }
        return true;
      }
      return false;
    });
    return () => clearTranscriptionCallback();
  }, []);

  const handleOAuth = (provider: string) => {
    AccessibilityInfo.announceForAccessibility(`${t.login.signingWith} ${provider}...`);
    router.replace("/student/home");
  };

  return (
    <SwipeVoiceWrapper>
      <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
        <StatusBar style="dark" />

        <View style={styles.content}>
          <View style={styles.iconSection}>
            <Image source={logoImage} style={styles.logoImage} accessibilityLabel="Literaku logo" />
            <Text style={styles.title} accessibilityRole="header">{t.app.name}</Text>
            <Text style={styles.subtitle}>{t.app.tagline}</Text>
          </View>

          <View style={styles.loginSection}>
            <Pressable
              style={({ pressed }) => [
                styles.oauthButton,
                styles.googleButton,
                { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
              ]}
              onPress={() => handleOAuth("Google")}
              accessibilityRole="button"
              accessibilityLabel={t.login.googleA11yLabel}
              accessibilityHint={t.login.googleA11yHint}
            >
              <Ionicons name="logo-google" size={22} color="#DB4437" />
              <Text style={styles.oauthButtonText}>{t.login.google}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.oauthButton,
                styles.microsoftButton,
                { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
              ]}
              onPress={() => handleOAuth("Microsoft")}
              accessibilityRole="button"
              accessibilityLabel={t.login.microsoftA11yLabel}
              accessibilityHint={t.login.microsoftA11yHint}
            >
              <Ionicons name="logo-microsoft" size={22} color="#00A4EF" />
              <Text style={styles.oauthButtonText}>{t.login.microsoft}</Text>
            </Pressable>
          </View>
        </View>

        <SwipeHintBar hints={voiceHints.login} />
      </View>
    </SwipeVoiceWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    gap: 40,
  },
  iconSection: {
    alignItems: "center",
    gap: 12,
  },
  logoImage: {
    width: 88,
    height: 88,
    borderRadius: 20,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    color: Colors.primaryLight,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  loginSection: {
    gap: 14,
  },
  oauthButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 12,
    minHeight: 64,
    borderWidth: 2,
  },
  googleButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DADCE0",
  },
  microsoftButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DADCE0",
  },
  oauthButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 20,
    color: Colors.text,
  },
});
