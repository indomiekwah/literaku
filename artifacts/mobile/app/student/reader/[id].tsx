import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
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
  const progress = ((currentPage + 1) / totalPages) * 100;

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
        <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back to library" accessibilityHint="Double tap to return to your library">
          <Feather name="arrow-left" size={28} color={Colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1} accessibilityRole="header">
            {book.title}
          </Text>
          <Text style={styles.headerSubtitle}>
            Page {currentPage + 1} of {totalPages}
          </Text>
        </View>
        <Pressable
          style={styles.summarizeHeaderButton}
          onPress={() => {}}
          accessibilityRole="button"
          accessibilityLabel="Summarize this page with AI"
          accessibilityHint="Double tap to generate and hear an AI summary of the current page"
        >
          <Ionicons name="sparkles" size={24} color={Colors.primaryLight} />
        </Pressable>
      </View>

      <View
        style={styles.progressBarContainer}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel="Reading progress"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(progress) }}
      >
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.readerCard} accessibilityRole="text" accessibilityLabel={`Page ${currentPage + 1} of ${totalPages}. ${book.content[currentPage]}`}>
          <Text style={styles.pageContent}>{book.content[currentPage]}</Text>
        </View>
      </ScrollView>

      <View style={styles.controlsSection}>
        <View style={styles.narrationRow}>
          <Pressable
            style={styles.rewindButton}
            onPress={() => {}}
            accessibilityRole="button"
            accessibilityLabel="Rewind 10 seconds"
            accessibilityHint="Double tap to go back 10 seconds in the narration"
          >
            <MaterialIcons name="replay-10" size={32} color={Colors.text} />
          </Pressable>

          <Pressable
            style={styles.playButton}
            onPress={() => setIsPlaying(!isPlaying)}
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? "Pause narration" : "Play narration"}
            accessibilityHint={isPlaying ? "Double tap to pause the narration" : "Double tap to start reading aloud"}
          >
            <Ionicons name={isPlaying ? "pause" : "play"} size={36} color="#FFF" />
          </Pressable>

          <Pressable
            style={styles.forwardButton}
            onPress={() => {}}
            accessibilityRole="button"
            accessibilityLabel="Forward 10 seconds"
            accessibilityHint="Double tap to skip ahead 10 seconds in the narration"
          >
            <MaterialIcons name="forward-10" size={32} color={Colors.text} />
          </Pressable>
        </View>

        <View style={styles.pageNavRow}>
          <Pressable
            style={[styles.pageButton, currentPage === 0 && styles.pageButtonDisabled]}
            onPress={() => goToPage(currentPage - 1)}
            disabled={currentPage === 0}
            accessibilityRole="button"
            accessibilityLabel="Previous page"
            accessibilityHint="Double tap to go to the previous page"
          >
            <Ionicons name="chevron-back" size={24} color={currentPage === 0 ? Colors.borderStrong : Colors.text} />
            <Text style={[styles.pageButtonText, currentPage === 0 && styles.pageButtonTextDisabled]}>Previous</Text>
          </Pressable>

          <Text style={styles.pageIndicator} accessibilityLiveRegion="polite">
            {currentPage + 1} / {totalPages}
          </Text>

          <Pressable
            style={[styles.pageButton, currentPage === totalPages - 1 && styles.pageButtonDisabled]}
            onPress={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            accessibilityRole="button"
            accessibilityLabel="Next page"
            accessibilityHint="Double tap to go to the next page"
          >
            <Text style={[styles.pageButtonText, currentPage === totalPages - 1 && styles.pageButtonTextDisabled]}>Next</Text>
            <Ionicons name="chevron-forward" size={24} color={currentPage === totalPages - 1 ? Colors.borderStrong : Colors.text} />
          </Pressable>
        </View>

        <View style={styles.settingsRow}>
          <Pressable
            style={styles.speedChip}
            onPress={cycleSpeed}
            accessibilityRole="button"
            accessibilityLabel={`Reading speed ${speed}x. Tap to change`}
            accessibilityHint="Double tap to cycle through available reading speeds"
          >
            <Ionicons name="speedometer-outline" size={20} color={Colors.primary} />
            <Text style={styles.speedChipText}>{speed}x</Text>
          </Pressable>

          <Pressable
            style={styles.voiceChip}
            onPress={() => setShowVoicePicker(!showVoicePicker)}
            accessibilityRole="button"
            accessibilityLabel={`Narration voice: ${currentVoiceLabel}. Tap to change voice`}
            accessibilityHint="Double tap to open the voice selector"
          >
            <Ionicons name="mic" size={20} color={Colors.studentPrimary} />
            <Text style={styles.voiceChipText} numberOfLines={1}>{currentVoiceLabel}</Text>
            <Feather name={showVoicePicker ? "chevron-up" : "chevron-down"} size={16} color={Colors.textSecondary} />
          </Pressable>
        </View>
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
                accessibilityHint={isSelected ? "This voice is currently selected" : "Double tap to switch to this voice"}
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
    paddingVertical: 6,
    gap: 10,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.text,
  },
  headerSubtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
  },
  summarizeHeaderButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.voiceBarBg,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginVertical: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.studentPrimary,
    borderRadius: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 8,
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
  controlsSection: {
    paddingTop: 8,
    gap: 8,
  },
  narrationRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  rewindButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.studentPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  forwardButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  pageNavRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  pageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    minHeight: 48,
  },
  pageButtonDisabled: {
    opacity: 0.35,
  },
  pageButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.text,
  },
  pageButtonTextDisabled: {
    color: Colors.borderStrong,
  },
  pageIndicator: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.textSecondary,
  },
  settingsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  speedChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.voiceBarBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    minHeight: 48,
  },
  speedChipText: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.primary,
  },
  voiceChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.successLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: Colors.studentPrimary,
    minHeight: 48,
    maxWidth: 200,
  },
  voiceChipText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.text,
    flex: 1,
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
