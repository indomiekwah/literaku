import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
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

export default function StudentSettingsScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;
  const t = useT();

  const {
    selectedVoice,
    speed,
    textSize,
    language,
    interactionMode,
    isVoiceOnly,
    isSubscribed,
    setSelectedVoice,
    setSpeed,
    setTextSize,
    setLanguage,
    setInteractionMode,
  } = useReadingPreferences();

  useTTSAnnounce(t.settings.mountAnnounce);

  const cycleSpeed = () => {
    const idx = SPEED_OPTIONS.indexOf(speed);
    setSpeed(SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length]);
  };

  const decreaseTextSize = () => {
    if (textSize > 16) setTextSize(textSize - 1);
  };

  const increaseTextSize = () => {
    if (textSize < 28) setTextSize(textSize + 1);
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
              {VOICE_OPTIONS.map((voice) => {
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
                    accessibilityLabel={`${voice.label}, ${voice.lang}${isSelected ? ", currently selected" : ""}`}
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
                      <Text style={styles.voiceOptionLang}>{voice.lang}</Text>
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
            {t.settings.display}
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>{t.settings.textSize}</Text>
            <View style={styles.textSizeRow}>
              <Pressable
                style={[styles.sizeButton, textSize <= 16 && styles.sizeButtonDisabled]}
                onPress={decreaseTextSize}
                disabled={textSize <= 16}
                accessibilityRole="button"
                accessibilityLabel={t.settings.decreaseSize}
                accessibilityHint="Double tap to make reader text smaller"
              >
                <Ionicons name="remove" size={28} color={textSize <= 16 ? Colors.borderStrong : Colors.text} />
              </Pressable>

              <View
                style={styles.sizePreview}
                accessibilityRole="text"
                accessibilityLabel={t.settings.currentSize(textSize)}
              >
                <Text style={[styles.sizePreviewText, { fontSize: textSize }]}>Aa</Text>
                <Text style={styles.sizeValue}>{textSize}pt</Text>
              </View>

              <Pressable
                style={[styles.sizeButton, textSize >= 28 && styles.sizeButtonDisabled]}
                onPress={increaseTextSize}
                disabled={textSize >= 28}
                accessibilityRole="button"
                accessibilityLabel={t.settings.increaseSize}
                accessibilityHint="Double tap to make reader text larger"
              >
                <Ionicons name="add" size={28} color={textSize >= 28 ? Colors.borderStrong : Colors.text} />
              </Pressable>
            </View>
          </View>

          <Text style={styles.sectionTitle} accessibilityRole="header">
            {t.subscription.title}
          </Text>

          <View style={[styles.subscriptionCard, isSubscribed && styles.subscriptionCardActive]}>
            <View style={styles.subscriptionRow}>
              <Ionicons
                name={isSubscribed ? "checkmark-circle" : "lock-closed"}
                size={24}
                color={isSubscribed ? Colors.studentPrimary : "#E65100"}
              />
              <View style={styles.subscriptionInfo}>
                <Text style={styles.subscriptionStatus}>
                  {isSubscribed ? t.subscription.currentPlan : t.bookDetail.subscriptionBadge}
                </Text>
                <Text style={styles.subscriptionDesc}>
                  {isSubscribed ? t.subscription.institutionActive : t.subscription.description}
                </Text>
              </View>
            </View>
          </View>

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
  textSizeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  sizeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  sizeButtonDisabled: {
    opacity: 0.35,
  },
  sizePreview: {
    alignItems: "center",
    gap: 4,
    minWidth: 80,
  },
  sizePreviewText: {
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  sizeValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.textSecondary,
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
