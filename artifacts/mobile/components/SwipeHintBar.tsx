import { Ionicons } from "@expo/vector-icons";
import React, { useState, useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";
import type { NaturalVoiceHint } from "@/constants/data";

interface SwipeHintBarProps {
  hints?: NaturalVoiceHint[];
  onHelpPress?: () => void;
  showHelpButton?: boolean;
}

export default function SwipeHintBar({ hints, onHelpPress, showHelpButton = false }: SwipeHintBarProps) {
  const [hintIndex, setHintIndex] = useState(0);

  const currentHint = hints && hints.length > 0 ? hints[hintIndex % hints.length] : null;

  const cycleHint = useCallback(() => {
    if (hints && hints.length > 1) {
      setHintIndex((prev) => (prev + 1) % hints.length);
    }
  }, [hints]);

  return (
    <View style={styles.container} accessibilityRole="toolbar" accessibilityLabel="Voice command hint bar">
      <View style={styles.row}>
        <View style={styles.swipeIndicator}>
          <Ionicons name="chevron-back" size={18} color={Colors.studentPrimary} />
          <Ionicons name="mic" size={20} color={Colors.studentPrimary} />
        </View>

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
          <Text style={styles.swipeText}>Swipe kiri untuk perintah suara</Text>
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
  swipeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.successLight,
    borderWidth: 2,
    borderColor: Colors.studentPrimary,
    justifyContent: "center",
    gap: -4,
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
