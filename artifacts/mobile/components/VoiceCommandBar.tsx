import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";
import type { VoiceCommand } from "@/constants/data";

interface VoiceCommandBarProps {
  hints?: VoiceCommand[];
  showHelpButton?: boolean;
  onHelpPress?: () => void;
}

export default function VoiceCommandBar({ hints, showHelpButton = true, onHelpPress }: VoiceCommandBarProps) {
  return (
    <View style={styles.container}>
      {hints && hints.length > 0 && (
        <View style={styles.hintsRow}>
          <Text style={styles.hintsLabel} accessibilityRole="header">Try saying:</Text>
          <Text style={styles.hintText} numberOfLines={1} accessibilityLabel={`Voice command hint: ${hints[0].command}`}>
            "{hints[0].command}"
          </Text>
        </View>
      )}
      <View style={styles.barRow}>
        <Pressable
          style={styles.micButton}
          accessibilityRole="button"
          accessibilityLabel="Microphone. Tap to activate voice command"
          accessibilityHint="Double tap to start listening for voice commands"
        >
          <View style={styles.micPulse} />
          <Ionicons name="mic" size={32} color={Colors.voiceActive} />
        </Pressable>
        <Text style={styles.listeningText} accessibilityLiveRegion="polite">
          Listening...
        </Text>
        {showHelpButton && (
          <Pressable
            style={styles.helpButton}
            onPress={onHelpPress}
            accessibilityRole="button"
            accessibilityLabel="Voice command help"
            accessibilityHint="Shows all available voice commands"
          >
            <Ionicons name="help-circle" size={44} color={Colors.primaryLight} />
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
    gap: 6,
  },
  hintsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.voiceBarBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  hintsLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.textSecondary,
  },
  hintText: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.primary,
    flex: 1,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  micButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.voiceBarBg,
    borderWidth: 2.5,
    borderColor: Colors.voiceActive,
    alignItems: "center",
    justifyContent: "center",
  },
  micPulse: {
    position: "absolute",
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(21, 101, 192, 0.08)",
  },
  listeningText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.textSecondary,
    flex: 1,
  },
  helpButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
