import { Ionicons } from "@expo/vector-icons";
import React, { useState, useCallback } from "react";
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";
import type { NaturalVoiceHint } from "@/constants/data";
import { useReadingPreferences } from "@/contexts/ReadingPreferences";

interface SwipeHintBarProps {
  hints?: NaturalVoiceHint[];
  onHelpPress?: () => void;
  showHelpButton?: boolean;
}

export default function SwipeHintBar({ hints, onHelpPress, showHelpButton = false }: SwipeHintBarProps) {
  const [hintIndex, setHintIndex] = useState(0);
  const { isVoiceOnly, setInteractionMode } = useReadingPreferences();

  const currentHint = hints && hints.length > 0 ? hints[hintIndex % hints.length] : null;

  const cycleHint = useCallback(() => {
    if (hints && hints.length > 1) {
      setHintIndex((prev) => (prev + 1) % hints.length);
    }
  }, [hints]);

  const toggleMode = useCallback(() => {
    const newMode = isVoiceOnly ? "touch" : "voice";
    setInteractionMode(newMode);
    AccessibilityInfo.announceForAccessibility(
      newMode === "voice"
        ? "Mode suara aktif. Navigasi dengan perintah suara. UI dibekukan."
        : "Mode sentuh aktif. Semua tombol bisa ditekan."
    );
  }, [isVoiceOnly, setInteractionMode]);

  return (
    <View style={styles.container} accessibilityRole="toolbar" accessibilityLabel="Voice command hint bar">
      {isVoiceOnly && (
        <View style={styles.frozenBanner} accessibilityRole="text" accessibilityLabel="Voice mode active. All buttons are frozen. Use voice commands to navigate.">
          <Ionicons name="mic" size={18} color={Colors.studentPrimary} />
          <Text style={styles.frozenText}>Mode suara — navigasi dengan perintah suara</Text>
        </View>
      )}
      <View style={styles.row}>
        <Pressable
          style={[styles.modeToggle, isVoiceOnly ? styles.modeToggleVoice : styles.modeToggleTouch]}
          onPress={toggleMode}
          accessibilityRole="button"
          accessibilityLabel={isVoiceOnly ? "Switch to touch mode. Currently voice-only mode, buttons are frozen" : "Switch to voice-only mode. Currently touch mode, buttons are active"}
          accessibilityHint={isVoiceOnly ? "Double tap to enable touch buttons" : "Double tap to freeze buttons and use voice only"}
        >
          {isVoiceOnly ? (
            <Ionicons name="lock-closed" size={22} color="#FFFFFF" />
          ) : (
            <Ionicons name="lock-open" size={22} color={Colors.studentPrimary} />
          )}
        </Pressable>

        <Pressable
          style={styles.hintArea}
          onPress={cycleHint}
          accessibilityRole="button"
          accessibilityLabel={
            currentHint
              ? `Swipe kiri untuk perintah suara. Contoh: ${currentHint.example}. Tap untuk contoh lain.`
              : "Swipe kiri untuk perintah suara"
          }
          accessibilityHint="Double tap to see another example voice command"
        >
          <Text style={styles.swipeText}>
            {isVoiceOnly ? "Swipe kiri untuk navigasi suara" : "Swipe kiri untuk perintah suara"}
          </Text>
          {currentHint && (
            <Text style={styles.exampleText} numberOfLines={1}>
              Coba: "{currentHint.example}"
            </Text>
          )}
        </Pressable>

        {showHelpButton && onHelpPress && (
          <Pressable
            style={styles.helpButton}
            onPress={onHelpPress}
            accessibilityRole="button"
            accessibilityLabel="Voice guide"
            accessibilityHint="Double tap to open the voice command guide"
          >
            <Ionicons name="help-circle" size={36} color={Colors.primaryLight} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 6,
    paddingBottom: 4,
    gap: 4,
  },
  frozenBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.successLight,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: Colors.studentPrimary,
  },
  frozenText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.studentPrimary,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.voiceBarBg,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  modeToggle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  modeToggleVoice: {
    backgroundColor: Colors.studentPrimary,
    borderColor: Colors.studentPrimary,
  },
  modeToggleTouch: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.studentPrimary,
  },
  hintArea: {
    flex: 1,
    gap: 2,
    minHeight: 44,
    justifyContent: "center",
  },
  swipeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.text,
  },
  exampleText: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.studentPrimary,
  },
  helpButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
