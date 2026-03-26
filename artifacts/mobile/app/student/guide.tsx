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
import { useReadingPreferences } from "@/contexts/ReadingPreferences";
import { useVoiceActivation } from "@/contexts/VoiceActivation";
import { useT } from "@/hooks/useTranslation";
import { useTTSAnnounce } from "@/hooks/useTTSAnnounce";
import { speakText } from "@/services/speech";
import type { VoiceIntent } from "@/services/voiceRouter";

interface InfoSectionProps {
  title: string;
  text: string;
  icon: keyof typeof Ionicons.glyphMap;
  bgColor: string;
  borderColor: string;
  iconColor?: string;
  onPress?: () => void;
}

function InfoSection({ title, text, icon, bgColor, borderColor, iconColor, onPress }: InfoSectionProps) {
  return (
    <Pressable
      style={[styles.infoSection, { backgroundColor: bgColor, borderColor }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${text}. Double tap to hear full explanation.`}
      accessibilityHint="Double tap to hear this section explained by voice"
    >
      <View style={styles.infoHeader}>
        <Ionicons name={icon} size={28} color={iconColor || Colors.primaryLight} />
        <Text style={styles.infoTitle} accessibilityRole="header">{title}</Text>
        <Ionicons name="volume-high-outline" size={22} color={iconColor || Colors.primaryLight} />
      </View>
      <Text style={styles.infoText}>{text}</Text>
    </Pressable>
  );
}

export default function StudentGuideScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;
  const { isVoiceOnly, selectedVoice, language } = useReadingPreferences();
  const { onTranscription, clearTranscriptionCallback } = useVoiceActivation();
  const t = useT();

  useTTSAnnounce(t.guide.mountAnnounce);

  const speakSection = React.useCallback((text: string) => {
    AccessibilityInfo.announceForAccessibility(text);
    speakText(text, selectedVoice, 1).catch(() => {});
  }, [selectedVoice]);

  const matchSection = React.useCallback((text: string): boolean => {
    const lower = text.toLowerCase();

    if (lower.match(/\b(about|tentang)\b.*\b(literaku|app|aplikasi)\b/) || lower.match(/\bliteraku\b/) && lower.length < 30) {
      speakSection(t.guide.aboutSpeech);
      return true;
    }
    if (lower.match(/\b(voice\s*command|perintah\s*suara|how\s*voice|cara\s*kerja|command|perintah)\b/)) {
      speakSection(t.guide.voiceCommandSpeech);
      return true;
    }
    if (lower.match(/\b(voice\s*mode|touch\s*mode|mode\s*suara|mode\s*sentuh|modes|interaction\s*mode)\b/)) {
      speakSection(t.guide.modesSpeech);
      return true;
    }
    if (lower.match(/\b(context|konteks|kontekstual|context.aware|aware)\b/)) {
      speakSection(t.guide.contextSpeech);
      return true;
    }
    if (lower.match(/\b(talkback|voiceover|screen\s*reader|talk\s*back|voice\s*over)\b/)) {
      speakSection(t.guide.talkbackSpeech);
      return true;
    }
    if (lower.match(/\b(language|bahasa|voice\s*lang|bahasa\s*suara)\b/)) {
      speakSection(t.guide.voiceLangSpeech);
      return true;
    }

    return false;
  }, [t, speakSection]);

  React.useEffect(() => {
    onTranscription((text: string, intent: VoiceIntent) => {
      if (matchSection(text)) {
        return true;
      }
      const navIntents = ["nav_home", "nav_explorer", "nav_collection", "nav_history", "nav_settings", "nav_guide", "nav_subscription", "nav_logout", "nav_back", "nav_login"];
      if (navIntents.includes(intent)) {
        return false;
      }
      speakSection(t.guide.sectionNotFound);
      return true;
    });
    return () => clearTranscriptionCallback();
  }, [matchSection, t, speakSection]);

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
              accessibilityLabel={t.reader.backA11yLabel}
              accessibilityHint="Double tap to go back"
            >
              <Feather name="arrow-left" size={32} color={Colors.text} />
            </Pressable>
            <Text style={styles.headerTitle} accessibilityRole="header">{t.guide.title}</Text>
            <View style={{ width: 56 }} />
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.heroSection}>
              <View style={styles.heroCircle}>
                <Ionicons name="book" size={48} color={Colors.studentPrimary} />
              </View>
              <Text style={styles.heroTitle}>{t.guide.heroTitle}</Text>
              <Text style={styles.heroSubtext}>{t.guide.heroSub}</Text>
            </View>

            <InfoSection
              title={t.guide.aboutTitle}
              text={t.guide.aboutText}
              icon="information-circle"
              bgColor={Colors.successLight}
              borderColor={Colors.studentPrimary}
              iconColor={Colors.studentPrimary}
              onPress={() => speakSection(t.guide.aboutSpeech)}
            />

            <InfoSection
              title={t.guide.voiceCommandTitle}
              text={t.guide.voiceCommandText}
              icon="mic"
              bgColor={Colors.voiceBarBg}
              borderColor={Colors.primaryLight}
              onPress={() => speakSection(t.guide.voiceCommandSpeech)}
            />

            <InfoSection
              title={t.guide.modesTitle}
              text={t.guide.modesText}
              icon="swap-horizontal"
              bgColor="#F3E5F5"
              borderColor="#9C27B0"
              iconColor="#9C27B0"
              onPress={() => speakSection(t.guide.modesSpeech)}
            />

            <InfoSection
              title={t.guide.contextTitle}
              text={t.guide.contextText}
              icon="bulb"
              bgColor="#FFF8E1"
              borderColor="#F9A825"
              iconColor="#F9A825"
              onPress={() => speakSection(t.guide.contextSpeech)}
            />

            <View style={styles.exampleSection}>
              <View style={styles.exampleHeader}>
                <Ionicons name="book" size={24} color={Colors.studentPrimary} />
                <Text style={styles.exampleTitle} accessibilityRole="header">{t.guide.readingTitle}</Text>
              </View>
              <View style={styles.exampleList}>
                {t.guide.readingExamples.map((item, index) => (
                  <View
                    key={index}
                    style={styles.exampleCard}
                    accessible
                    accessibilityRole="text"
                    accessibilityLabel={t.guide.exampleA11y(item.phrase, item.result)}
                  >
                    <View style={styles.speechBubble}>
                      <Ionicons name="chatbubble-ellipses" size={18} color={Colors.studentPrimary} />
                      <Text style={styles.phraseText}>"{item.phrase}"</Text>
                    </View>
                    <View style={styles.resultRow}>
                      <Ionicons name="arrow-forward" size={16} color={Colors.textSecondary} />
                      <Text style={styles.resultText}>{item.result}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.talkbackSection}>
              <Pressable
                onPress={() => speakSection(t.guide.talkbackSpeech)}
                accessibilityRole="button"
                accessibilityLabel={`${t.guide.talkbackTitle}. ${t.guide.talkbackText}. Double tap to hear full explanation.`}
              >
                <View style={styles.talkbackHeader}>
                  <Ionicons name="accessibility" size={28} color="#FFFFFF" />
                  <Text style={styles.talkbackTitle} accessibilityRole="header">{t.guide.talkbackTitle}</Text>
                  <Ionicons name="volume-high-outline" size={22} color="rgba(255,255,255,0.7)" />
                </View>
                <Text style={styles.talkbackText}>{t.guide.talkbackText}</Text>
              </Pressable>
              <View style={styles.talkbackSteps}>
                <View style={styles.talkbackStep} accessible accessibilityRole="text" accessibilityLabel={`${t.guide.step} 1: ${t.guide.talkbackStep1}`}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <Text style={styles.stepText}>{t.guide.talkbackStep1}</Text>
                </View>
                <View style={styles.talkbackStep} accessible accessibilityRole="text" accessibilityLabel={`${t.guide.step} 2: ${t.guide.talkbackStep2}`}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <Text style={styles.stepText}>{t.guide.talkbackStep2}</Text>
                </View>
                <View style={styles.talkbackStep} accessible accessibilityRole="text" accessibilityLabel={`${t.guide.step} 3: ${t.guide.talkbackStep3}`}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <Text style={styles.stepText}>{t.guide.talkbackStep3}</Text>
                </View>
              </View>
              <View style={styles.talkbackMicDemo}>
                <View style={styles.talkbackMicCircle}>
                  <Ionicons name="mic" size={28} color="#FFFFFF" />
                </View>
                <Text style={styles.talkbackMicLabel}>{t.guide.talkbackMicLabel}</Text>
              </View>
            </View>

            <InfoSection
              title={t.guide.voiceLangTitle}
              text={t.guide.voiceLangText}
              icon="language"
              bgColor={Colors.successLight}
              borderColor={Colors.studentPrimary}
              iconColor={Colors.studentPrimary}
              onPress={() => speakSection(t.guide.voiceLangSpeech)}
            />

            <View style={styles.azureBadge}>
              <Ionicons name="cloud" size={24} color={Colors.primaryLight} />
              <View>
                <Text style={styles.azureBadgeTitle}>Powered by Azure AI</Text>
                <Text style={styles.azureBadgeText}>Speech-to-Text & Natural Language Understanding</Text>
              </View>
            </View>
          </ScrollView>
        </View>

        <SwipeHintBar hints={voiceHints.studentGuide} />
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
    gap: 20,
  },
  heroSection: {
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
  },
  heroCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.successLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.studentPrimary,
  },
  heroTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    color: Colors.studentPrimary,
    textAlign: "center",
    lineHeight: 34,
  },
  heroSubtext: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  infoSection: {
    borderRadius: 18,
    padding: 20,
    gap: 12,
    borderWidth: 2,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.text,
    flex: 1,
  },
  infoText: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
    lineHeight: 26,
  },
  exampleSection: {
    gap: 10,
  },
  exampleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  exampleTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.text,
  },
  exampleList: {
    gap: 8,
  },
  exampleCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  speechBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  phraseText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.studentPrimary,
    flex: 1,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 26,
  },
  resultText: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
  },
  azureBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.voiceBarBg,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
  },
  azureBadgeTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.primaryLight,
  },
  azureBadgeText: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
  },
  talkbackSection: {
    backgroundColor: "#263238",
    borderRadius: 18,
    padding: 20,
    gap: 14,
    borderWidth: 2,
    borderColor: "#37474F",
  },
  talkbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  talkbackTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: "#FFFFFF",
    flex: 1,
  },
  talkbackText: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 26,
    marginTop: 8,
  },
  talkbackSteps: {
    gap: 10,
  },
  talkbackStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 14,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.studentPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#FFFFFF",
  },
  stepText: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: "#FFFFFF",
    flex: 1,
    lineHeight: 24,
  },
  talkbackMicDemo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 4,
  },
  talkbackMicCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.studentPrimary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#43A047",
  },
  talkbackMicLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: "rgba(255,255,255,0.7)",
    flex: 1,
  },
  freezeZone: {
    flex: 1,
  },
  frozen: {
    opacity: 0.5,
  },
});
