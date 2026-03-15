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

interface ExampleGroupProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  examples: { phrase: string; result: string }[];
}

function ExampleGroup({ title, icon, examples }: ExampleGroupProps) {
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
            accessibilityLabel={`Example: say "${item.phrase}" to ${item.result}`}
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

  React.useEffect(() => {
    AccessibilityInfo.announceForAccessibility(
      "Voice guide. Learn how to use AI-powered voice commands. Swipe left anywhere to start speaking."
    );
  }, []);

  return (
    <SwipeVoiceWrapper>
      <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
        <StatusBar style="dark" />

        <View pointerEvents={isVoiceOnly ? 'none' : 'auto'} style={[styles.freezeZone, isVoiceOnly && styles.frozen]}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Double tap to return to previous screen"
          >
            <Feather name="arrow-left" size={32} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle} accessibilityRole="header">Voice Guide</Text>
          <View style={{ width: 56 }} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <View style={styles.heroCircle}>
              <Ionicons name="chevron-back" size={28} color={Colors.studentPrimary} />
              <Ionicons name="mic" size={48} color={Colors.studentPrimary} />
            </View>
            <Text style={styles.heroTitle}>Swipe kiri untuk{"\n"}mulai bicara</Text>
            <Text style={styles.heroSubtext}>
              Swipe ke kiri dari layar mana saja untuk mengaktifkan perintah suara
            </Text>
          </View>

          <View style={styles.aiSection}>
            <View style={styles.aiHeader}>
              <Ionicons name="sparkles" size={28} color={Colors.primaryLight} />
              <Text style={styles.aiTitle} accessibilityRole="header">Bicara saja secara alami</Text>
            </View>
            <Text style={styles.aiText}>
              Literaku menggunakan Azure AI untuk memahami maksud Anda. Tidak perlu menghafal perintah khusus — cukup bicara seperti biasa, dalam Bahasa Indonesia atau English.
            </Text>
            <View style={styles.aiExample}>
              <Text style={styles.aiExampleLabel}>Contoh:</Text>
              <Text style={styles.aiExampleText}>"Tolong bacakan halaman selanjutnya"</Text>
              <Text style={styles.aiExampleText}>"Read the next page please"</Text>
              <Text style={styles.aiExampleText}>"Ringkasin buku ini dong"</Text>
            </View>
          </View>

          <ExampleGroup
            title="Navigasi"
            icon="compass"
            examples={[
              { phrase: "Buka perpustakaan saya", result: "Opens your library" },
              { phrase: "Kembali ke beranda", result: "Goes back to home screen" },
              { phrase: "Buka pengaturan", result: "Opens settings page" },
            ]}
          />

          <ExampleGroup
            title="Membaca"
            icon="book"
            examples={[
              { phrase: "Bacakan buku The Art of Speaking", result: "Opens and starts reading the book" },
              { phrase: "Halaman selanjutnya", result: "Goes to next page" },
              { phrase: "Mundur 10 detik", result: "Rewinds narration" },
              { phrase: "Berhenti dulu", result: "Pauses narration" },
              { phrase: "Lanjutkan", result: "Resumes narration" },
            ]}
          />

          <ExampleGroup
            title="Pencarian & Lainnya"
            icon="search"
            examples={[
              { phrase: "Tolong ringkasin halaman ini", result: "AI generates a summary" },
              { phrase: "Lanjutkan membaca", result: "Continues your last book" },
            ]}
          />

          <View style={styles.langSection}>
            <View style={styles.langHeader}>
              <Ionicons name="language" size={24} color={Colors.primaryLight} />
              <Text style={styles.langTitle} accessibilityRole="header">Deteksi Bahasa Otomatis</Text>
            </View>
            <Text style={styles.langText}>
              Azure AI secara otomatis mendeteksi apakah Anda berbicara dalam Bahasa Indonesia atau English. Anda bisa beralih bahasa kapan saja — cukup bicara saja.
            </Text>
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
  freezeZone: {
    flex: 1,
  },
  frozen: {
    opacity: 0.5,
  },
});
