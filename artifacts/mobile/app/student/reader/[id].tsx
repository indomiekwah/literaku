import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
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
import VoiceCommandBar from "@/components/VoiceCommandBar";
import { sampleBooks, voiceCommands } from "@/constants/data";

const VOICE_OPTIONS = [
  { id: "v1", label: "Sari (Female)", lang: "id-ID" },
  { id: "v2", label: "Budi (Male)", lang: "id-ID" },
  { id: "v3", label: "Emma (Female)", lang: "en-US" },
  { id: "v4", label: "James (Male)", lang: "en-US" },
];

export default function StudentReaderScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;

  const book = sampleBooks.find((b) => b.id === id);
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [selectedVoice, setSelectedVoice] = useState("v1");
  const [showVoicePicker, setShowVoicePicker] = useState(false);

  React.useEffect(() => {
    if (book) {
      AccessibilityInfo.announceForAccessibility(
        `Now reading ${book.title}. Say Play to start, or use Next page and Previous page to navigate.`
      );
    }
  }, [book?.title]);

  if (!book) {
    return (
      <View style={[styles.container, { paddingTop: topPadding }]}>
        <Text style={styles.errorText}>Book not found</Text>
      </View>
    );
  }

  const totalPages = book.content.length;
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const currentVoiceLabel = VOICE_OPTIONS.find(v => v.id === selectedVoice)?.label || "Sari (Female)";

  const goToPage = (page: number) => {
    if (page >= 0 && page < totalPages) setCurrentPage(page);
  };

  const cycleSpeed = () => {
    const idx = speeds.indexOf(speed);
    setSpeed(speeds[(idx + 1) % speeds.length]);
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back to library">
          <Feather name="arrow-left" size={32} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1} accessibilityRole="header">
          {book.title}
        </Text>
        <View style={{ width: 56 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.readerCard} accessibilityRole="text" accessibilityLabel={`Page ${currentPage + 1} of ${totalPages}. ${book.content[currentPage]}`}>
          <Text style={styles.pageContent}>{book.content[currentPage]}</Text>
        </View>
      </ScrollView>

      <View style={styles.pageInfo}>
        <Text style={styles.pageText} accessibilityLiveRegion="polite">
          Page {currentPage + 1} of {totalPages}
        </Text>
      </View>

      <View style={styles.controlsRow}>
        <Pressable
          style={[styles.controlButton, currentPage === 0 && styles.controlDisabled]}
          onPress={() => goToPage(currentPage - 1)}
          disabled={currentPage === 0}
          accessibilityRole="button"
          accessibilityLabel="Previous page"
        >
          <Ionicons name="play-back" size={26} color={currentPage === 0 ? Colors.borderStrong : Colors.primary} />
        </Pressable>

        <Pressable
          style={styles.playButton}
          onPress={() => setIsPlaying(!isPlaying)}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? "Pause narration" : "Play narration"}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={36} color="#FFF" />
        </Pressable>

        <Pressable
          style={[styles.controlButton, currentPage === totalPages - 1 && styles.controlDisabled]}
          onPress={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          accessibilityRole="button"
          accessibilityLabel="Next page"
        >
          <Ionicons name="play-forward" size={26} color={currentPage === totalPages - 1 ? Colors.borderStrong : Colors.primary} />
        </Pressable>
      </View>

      <View style={styles.extraControls}>
        <Pressable
          style={styles.speedButton}
          onPress={cycleSpeed}
          accessibilityRole="button"
          accessibilityLabel={`Reading speed ${speed}x. Tap to change`}
        >
          <Text style={styles.speedText}>{speed}x</Text>
        </Pressable>

        <Pressable
          style={styles.voiceSelector}
          onPress={() => setShowVoicePicker(!showVoicePicker)}
          accessibilityRole="button"
          accessibilityLabel={`Narration voice: ${currentVoiceLabel}. Tap to change voice`}
        >
          <Ionicons name="mic" size={20} color={Colors.studentPrimary} />
          <Text style={styles.voiceSelectorText} numberOfLines={1}>{currentVoiceLabel}</Text>
          <Feather name={showVoicePicker ? "chevron-up" : "chevron-down"} size={18} color={Colors.textSecondary} />
        </Pressable>

        <Pressable
          style={styles.summarizeButton}
          onPress={() => {}}
          accessibilityRole="button"
          accessibilityLabel="Summarize this page with AI"
          accessibilityHint="Double tap to hear an AI-generated summary of the current page"
        >
          <Ionicons name="sparkles" size={20} color="#FFFFFF" />
          <Text style={styles.summarizeText}>Summarize</Text>
        </Pressable>
      </View>

      {showVoicePicker && (
        <View style={styles.voicePickerDropdown}>
          {VOICE_OPTIONS.map((voice) => {
            const isSelected = voice.id === selectedVoice;
            return (
              <Pressable
                key={voice.id}
                style={[styles.voiceOption, isSelected && styles.voiceOptionSelected]}
                onPress={() => { setSelectedVoice(voice.id); setShowVoicePicker(false); }}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${voice.label}. ${voice.lang}. ${isSelected ? "Currently selected" : "Tap to select"}`}
              >
                <Ionicons
                  name={isSelected ? "radio-button-on" : "radio-button-off"}
                  size={24}
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
      )}

      <VoiceCommandBar hints={voiceCommands.reader} showHelpButton={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 10,
  },
  backButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.text,
    flex: 1,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 4,
  },
  readerCard: {
    backgroundColor: Colors.background,
    borderRadius: 18,
    padding: 22,
    borderWidth: 2,
    borderColor: Colors.border,
    minHeight: 200,
  },
  pageContent: {
    fontFamily: "Inter_400Regular",
    fontSize: 19,
    color: Colors.text,
    lineHeight: 32,
  },
  pageInfo: {
    alignItems: "center",
    paddingVertical: 6,
  },
  pageText: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.textSecondary,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingVertical: 4,
  },
  controlButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  controlDisabled: {
    opacity: 0.35,
  },
  playButton: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: Colors.studentPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  extraControls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 6,
  },
  speedButton: {
    backgroundColor: Colors.voiceBarBg,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    minWidth: 64,
    alignItems: "center",
    minHeight: 56,
    justifyContent: "center",
  },
  speedText: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.primary,
  },
  voiceSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.successLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: Colors.studentPrimary,
    gap: 6,
    minHeight: 56,
    maxWidth: 170,
  },
  voiceSelectorText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.text,
    flex: 1,
  },
  summarizeButton: {
    flexDirection: "row",
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    alignItems: "center",
    minHeight: 56,
    justifyContent: "center",
  },
  summarizeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#FFFFFF",
  },
  voicePickerDropdown: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    padding: 8,
    gap: 4,
  },
  voiceOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    minHeight: 52,
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
  errorText: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 100,
  },
});
