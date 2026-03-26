import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback } from "react";
import {
  AccessibilityInfo,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import SwipeHintBar from "@/components/SwipeHintBar";
import SwipeVoiceWrapper from "@/components/SwipeVoiceWrapper";
import { voiceHints } from "@/constants/data";
import {
  useReadingPreferences,
  VOICE_OPTIONS,
  SPEED_OPTIONS,
} from "@/contexts/ReadingPreferences";
import { useT } from "@/hooks/useTranslation";
import { useTTSAnnounce } from "@/hooks/useTTSAnnounce";
import { useVoiceActivation } from "@/contexts/VoiceActivation";
import { speakText } from "@/services/speech";
import type { VoiceIntent } from "@/services/voiceRouter";

export default function StudentSettingsScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;
  const t = useT();
  const { onTranscription, clearTranscriptionCallback } = useVoiceActivation();

  const {
    selectedVoice,
    speed,
    language,
    interactionMode,
    isVoiceOnly,
    subscriptionPlan,
    setSelectedVoice,
    setSpeed,
    setLanguage,
    setInteractionMode,
  } = useReadingPreferences();

  useTTSAnnounce(t.settings.mountAnnounce);

  const langPrefix = language === "id" ? "id-ID" : "en-US";
  const filteredVoices = VOICE_OPTIONS.filter(v => v.lang === langPrefix);

  const findVoiceByName = React.useCallback((text: string) => {
    const lower = text.toLowerCase();
    return filteredVoices.find(v => {
      const shortName = v.label.split("(")[0].trim().toLowerCase();
      return lower.includes(shortName);
    });
  }, [filteredVoices]);

  const speak = React.useCallback((msg: string) => {
    AccessibilityInfo.announceForAccessibility(msg);
    speakText(msg, selectedVoice, 1).catch(() => {});
  }, [selectedVoice]);

  useFocusEffect(useCallback(() => {
    onTranscription((text: string, intent: VoiceIntent) => {
      const lower = text.toLowerCase();
      const hasChangeVerb = !!lower.match(/\b(change|switch|set|ubah|ganti|pilih|pakai|use)\b/);
      const hasNarratorWord = !!lower.match(/\b(voice|voices|suara|narration|narasi|narrator|narator)\b/) && !lower.match(/\b(mode|only|saja|command|perintah)\b/);
      const hasLanguageWord = !!lower.match(/\b(language|bahasa)\b/);

      if (hasChangeVerb && hasNarratorWord) {
        const match = findVoiceByName(text);
        if (match) {
          setSelectedVoice(match.id);
          const msg = language === "id"
            ? `Narator diubah ke ${match.label}.`
            : `Narrator changed to ${match.label}.`;
          speak(msg);
        } else {
          const voiceList = filteredVoices.map(v => v.label.split("(")[0].trim()).join(", ");
          const msg = language === "id"
            ? `Narator tidak ditemukan. Pilihan yang tersedia: ${voiceList}.`
            : `Narrator not found. Available options: ${voiceList}.`;
          speak(msg);
        }
        return true;
      }

      if (hasChangeVerb && hasLanguageWord) {
        if (lower.match(/\b(indonesia|indonesian|id)\b/)) {
          setLanguage("id");
          speak("Bahasa diubah ke Indonesia.");
        } else if (lower.match(/\b(english|inggris|en)\b/)) {
          setLanguage("en");
          speak("Language changed to English.");
        } else {
          const msg = language === "id"
            ? "Pilihan bahasa: Indonesia dan English. Ucapkan 'Ganti bahasa ke Indonesia' atau 'Ganti bahasa ke English'."
            : "Language options: Indonesian and English. Say 'Change language to Indonesian' or 'Change language to English'.";
          speak(msg);
        }
        return true;
      }

      if (hasNarratorWord) {
        const voiceList = filteredVoices.map(v => v.label).join(", ");
        const current = filteredVoices.find(v => v.id === selectedVoice) || filteredVoices[0];
        const msg = language === "id"
          ? `Pilihan narator: ${voiceList}. Saat ini: ${current?.label}. Ucapkan 'Ganti narator ke' diikuti nama untuk mengubah.`
          : `Narrator options: ${voiceList}. Currently: ${current?.label}. Say 'Change narrator to' followed by a name to switch.`;
        speak(msg);
        return true;
      }

      if (hasLanguageWord) {
        const langName = language === "id" ? "Indonesia" : "English";
        const msg = language === "id"
          ? `Pilihan bahasa: Indonesia dan English. Saat ini: ${langName}. Ucapkan 'Ganti bahasa ke' diikuti nama bahasa.`
          : `Language options: Indonesian and English. Currently: ${langName}. Say 'Change language to' followed by the language name.`;
        speak(msg);
        return true;
      }

      if (intent === "nav_logout") {
        speak(t.settings.signingOut);
        router.replace("/student/login");
        return true;
      }

      if (intent === "nav_subscription") {
        router.push("/student/subscription");
        return true;
      }

      if (intent === "repeat_commands") {
        speak(t.settings.pageCommands);
        return true;
      }

      return false;
    });
    return () => clearTranscriptionCallback();
  }, [selectedVoice, language, findVoiceByName, speak]));

  const cycleSpeed = () => {
    const idx = SPEED_OPTIONS.indexOf(speed);
    setSpeed(SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length]);
  };

  return (
    <SwipeVoiceWrapper>
      <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
        <StatusBar style="dark" />

        <View style={[styles.freezeZone, isVoiceOnly && styles.frozen, { pointerEvents: isVoiceOnly ? 'none' : 'auto' }]}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t.bookDetail.backA11yLabel}
            accessibilityHint={t.bookDetail.backA11yLabel}
          >
            <Feather name="arrow-left" size={32} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle} accessibilityRole="header">{t.settings.title}</Text>
          <View style={{ width: 56 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle} accessibilityRole="header">
            {t.settings.voiceNarration}
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>{t.settings.narrationVoice}</Text>
            <View style={styles.voiceList}>
              {filteredVoices.map((voice) => {
                const isSelected = voice.id === selectedVoice;
                return (
                  <Pressable
                    key={voice.id}
                    style={[styles.voiceOption, isSelected && styles.voiceOptionSelected]}
                    onPress={() => {
                      setSelectedVoice(voice.id);
                      AccessibilityInfo.announceForAccessibility(t.settings.voiceChanged(voice.label));
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`${voice.label}${isSelected ? ", currently selected" : ""}`}
                    accessibilityHint={isSelected ? "This voice is currently selected" : "Double tap to select this voice"}
                  >
                    <Ionicons
                      name={isSelected ? "radio-button-on" : "radio-button-off"}
                      size={28}
                      color={isSelected ? Colors.studentPrimary : Colors.borderStrong}
                    />
                    <View style={styles.voiceOptionInfo}>
                      <Text style={[styles.voiceOptionLabel, isSelected && styles.voiceOptionLabelSelected]}>
                        {voice.label}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>{t.settings.readingSpeed}</Text>
            <Pressable
              style={styles.speedControl}
              onPress={cycleSpeed}
              accessibilityRole="adjustable"
              accessibilityLabel={`Reading speed ${speed}x`}
              accessibilityHint="Double tap to cycle through speed options"
            >
              <Ionicons name="speedometer-outline" size={24} color={Colors.studentPrimary} />
              <Text style={styles.speedValue}>{speed}x</Text>
              <Text style={styles.speedHint}>{t.settings.tapToChange}</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle} accessibilityRole="header">
            {t.settings.language}
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>{t.settings.appLanguage}</Text>
            <View style={styles.langRow}>
              <Pressable
                style={[styles.langOption, language === "id" && styles.langOptionSelected]}
                onPress={() => {
                  setLanguage("id");
                  AccessibilityInfo.announceForAccessibility(t.settings.langSetTo("Indonesian"));
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected: language === "id" }}
                accessibilityLabel="Indonesian"
                accessibilityHint={language === "id" ? "Currently selected" : "Double tap to switch to Indonesian"}
              >
                <Text style={[styles.langText, language === "id" && styles.langTextSelected]}>
                  Indonesia
                </Text>
              </Pressable>

              <Pressable
                style={[styles.langOption, language === "en" && styles.langOptionSelected]}
                onPress={() => {
                  setLanguage("en");
                  AccessibilityInfo.announceForAccessibility(t.settings.langSetTo("English"));
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected: language === "en" }}
                accessibilityLabel="English"
                accessibilityHint={language === "en" ? "Currently selected" : "Double tap to switch to English"}
              >
                <Text style={[styles.langText, language === "en" && styles.langTextSelected]}>
                  English
                </Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.sectionTitle} accessibilityRole="header">
            {t.settings.interactionMode}
          </Text>

          <View style={styles.card}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={styles.cardLabel}>{t.settings.voiceOnlyMode}</Text>
                <Text style={styles.toggleDesc}>
                  {isVoiceOnly ? t.settings.voiceOnlyDesc : t.settings.touchModeDesc}
                </Text>
              </View>
              <Pressable
                style={styles.toggleHitArea}
                onPress={() => {
                  const newMode = isVoiceOnly ? "touch" : "voice";
                  setInteractionMode(newMode);
                  AccessibilityInfo.announceForAccessibility(
                    newMode === "voice" ? t.settings.voiceOnlyEnabled : t.settings.touchEnabled
                  );
                }}
                accessibilityRole="switch"
                accessibilityState={{ checked: isVoiceOnly }}
                accessibilityLabel={t.settings.voiceOnlyMode}
                accessibilityHint="Double tap to toggle between voice-only and touch mode"
              >
                <View style={[styles.toggleSwitch, isVoiceOnly && styles.toggleSwitchActive]}>
                  <View style={[styles.toggleKnob, isVoiceOnly && styles.toggleKnobActive]} />
                </View>
              </Pressable>
            </View>
          </View>

          <Text style={styles.sectionTitle} accessibilityRole="header">
            {t.subscription.title}
          </Text>

          <Pressable
            style={[styles.subscriptionCard, subscriptionPlan === "premium" && styles.subscriptionCardActive]}
            onPress={() => router.push("/student/subscription")}
            accessibilityRole="button"
            accessibilityLabel={`${t.subscription.currentPlan}: ${subscriptionPlan === "premium" ? t.subscription.premiumPlan : t.subscription.freePlan}`}
            accessibilityHint="Double tap to manage subscription"
          >
            <View style={styles.subscriptionRow}>
              <Ionicons
                name={subscriptionPlan === "premium" ? "checkmark-circle" : "lock-closed"}
                size={24}
                color={subscriptionPlan === "premium" ? Colors.studentPrimary : "#E65100"}
              />
              <View style={styles.subscriptionInfo}>
                <Text style={styles.subscriptionStatus}>
                  {subscriptionPlan === "premium" ? t.subscription.premiumPlan : t.subscription.freePlan}
                </Text>
                <Text style={styles.subscriptionDesc}>
                  {subscriptionPlan === "premium" ? t.subscription.premiumDesc : t.subscription.freeDesc}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={Colors.textSecondary} />
            </View>
          </Pressable>

          <Text style={styles.sectionTitle} accessibilityRole="header">
            {t.settings.account}
          </Text>

          <Pressable
            style={styles.logoutButton}
            onPress={() => {
              AccessibilityInfo.announceForAccessibility(t.settings.signingOut);
              router.replace("/student/login");
            }}
            accessibilityRole="button"
            accessibilityLabel={t.settings.logOut}
            accessibilityHint="Double tap to sign out and return to login screen"
          >
            <Feather name="log-out" size={24} color={Colors.error} />
            <Text style={styles.logoutText}>{t.settings.logOut}</Text>
          </Pressable>

          <View style={styles.azureBadge}>
            <Ionicons name="cloud" size={20} color={Colors.primaryLight} />
            <Text style={styles.azureText}>{t.settings.azureBadge}</Text>
          </View>
        </ScrollView>
        </View>

        <SwipeHintBar hints={voiceHints.studentSettings} />
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
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  backButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    color: Colors.text,
    flex: 1,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.text,
    marginTop: 8,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 14,
  },
  cardLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.text,
  },
  voiceList: {
    gap: 8,
  },
  voiceOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    minHeight: 56,
  },
  voiceOptionSelected: {
    backgroundColor: Colors.successLight,
  },
  voiceOptionInfo: {
    flex: 1,
    gap: 2,
  },
  voiceOptionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.text,
  },
  voiceOptionLabelSelected: {
    fontFamily: "Inter_700Bold",
    color: Colors.studentPrimary,
  },
  voiceOptionLang: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
  },
  speedControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.successLight,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: Colors.studentPrimary,
    minHeight: 56,
  },
  speedValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: Colors.studentPrimary,
    flex: 1,
  },
  speedHint: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
  },
  langRow: {
    flexDirection: "row",
    gap: 12,
  },
  langOption: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    backgroundColor: Colors.background,
  },
  langOptionSelected: {
    borderColor: Colors.studentPrimary,
    backgroundColor: Colors.successLight,
  },
  langText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.textSecondary,
  },
  langTextSelected: {
    fontFamily: "Inter_700Bold",
    color: Colors.studentPrimary,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  toggleInfo: {
    flex: 1,
    gap: 4,
  },
  toggleDesc: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  toggleHitArea: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleSwitch: {
    width: 56,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.border,
    padding: 3,
    justifyContent: "center",
  },
  toggleSwitchActive: {
    backgroundColor: Colors.studentPrimary,
  },
  toggleKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
  },
  toggleKnobActive: {
    alignSelf: "flex-end",
  },
  subscriptionCard: {
    backgroundColor: "#FFF3E0",
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: "#E65100",
  },
  subscriptionCardActive: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.studentPrimary,
  },
  subscriptionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  subscriptionInfo: {
    flex: 1,
    gap: 4,
  },
  subscriptionStatus: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.text,
  },
  subscriptionDesc: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: Colors.errorLight,
    borderRadius: 16,
    paddingVertical: 20,
    borderWidth: 2,
    borderColor: Colors.error,
    minHeight: 64,
  },
  logoutText: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.error,
  },
  azureBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  azureText: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
  },
  freezeZone: {
    flex: 1,
  },
  frozen: {
    opacity: 0.5,
  },
});
