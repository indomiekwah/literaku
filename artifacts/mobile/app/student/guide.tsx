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
import { useT } from "@/hooks/useTranslation";

interface ExampleGroupProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  examples: { phrase: string; result: string }[];
  exampleA11y: (phrase: string, result: string) => string;
}

function ExampleGroup({ title, icon, examples, exampleA11y }: ExampleGroupProps) {
  return (
    <View style={styles.exampleSection}>
      <View style={styles.exampleHeader}>
        <Ionicons name={icon} size={24} color={Colors.studentPrimary} />
        <Text style={styles.exampleTitle} accessibilityRole="header">{title}</Text>
      </View>
      <View style={styles.exampleList}>
        {examples.map((item, index) => (
          <View
            key={index}
            style={styles.exampleCard}
            accessible
            accessibilityRole="text"
            accessibilityLabel={exampleA11y(item.phrase, item.result)}
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
  );
}

export default function StudentGuideScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;
  const { isVoiceOnly } = useReadingPreferences();
  const t = useT();

  React.useEffect(() => {
    AccessibilityInfo.announceForAccessibility(t.guide.mountAnnounce);
  }, []);

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
                <Ionicons name="chevron-back" size={28} color={Colors.studentPrimary} />
                <Ionicons name="mic" size={48} color={Colors.studentPrimary} />
              </View>
              <Text style={styles.heroTitle}>{t.guide.heroTitle}</Text>
              <Text style={styles.heroSubtext}>{t.guide.heroSub}</Text>
            </View>

            <View style={styles.aiSection}>
              <View style={styles.aiHeader}>
                <Ionicons name="sparkles" size={28} color={Colors.primaryLight} />
                <Text style={styles.aiTitle} accessibilityRole="header">{t.guide.aiTitle}</Text>
              </View>
              <Text style={styles.aiText}>{t.guide.aiText}</Text>
              <View style={styles.aiExample}>
                <Text style={styles.aiExampleLabel}>{t.guide.exampleLabel}</Text>
                <Text style={styles.aiExampleText}>"Open the book explorer"</Text>
                <Text style={styles.aiExampleText}>"Show my collection"</Text>
                <Text style={styles.aiExampleText}>"Read the next page please"</Text>
              </View>
            </View>

            <ExampleGroup
              title={t.guide.navTitle}
              icon="compass"
              examples={t.guide.navExamples}
              exampleA11y={t.guide.exampleA11y}
            />

            <ExampleGroup
              title={t.guide.readingTitle}
              icon="book"
              examples={t.guide.readingExamples}
              exampleA11y={t.guide.exampleA11y}
            />

            <ExampleGroup
              title={t.guide.purchaseTitle}
              icon="cart"
              examples={t.guide.purchaseExamples}
              exampleA11y={t.guide.exampleA11y}
            />

            <View style={styles.talkbackSection}>
              <View style={styles.talkbackHeader}>
                <Ionicons name="accessibility" size={28} color="#FFFFFF" />
                <Text style={styles.talkbackTitle} accessibilityRole="header">{t.guide.talkbackTitle}</Text>
              </View>
              <Text style={styles.talkbackText}>{t.guide.talkbackText}</Text>
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

            <View style={styles.langSection}>
              <View style={styles.langHeader}>
                <Ionicons name="language" size={24} color={Colors.primaryLight} />
                <Text style={styles.langTitle} accessibilityRole="header">{t.guide.voiceLangTitle}</Text>
              </View>
              <Text style={styles.langText}>{t.guide.voiceLangText}</Text>
            </View>

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
    flexDirection: "row",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.successLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.studentPrimary,
    gap: -8,
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
  aiSection: {
    backgroundColor: Colors.voiceBarBg,
    borderRadius: 18,
    padding: 20,
    gap: 12,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  aiTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.text,
  },
  aiText: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
    lineHeight: 26,
  },
  aiExample: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  aiExampleLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.text,
  },
  aiExampleText: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.studentPrimary,
    fontStyle: "italic",
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
  langSection: {
    backgroundColor: Colors.successLight,
    borderRadius: 16,
    padding: 18,
    gap: 10,
    borderWidth: 2,
    borderColor: Colors.studentPrimary,
  },
  langHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  langTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.text,
  },
  langText: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
    lineHeight: 26,
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
