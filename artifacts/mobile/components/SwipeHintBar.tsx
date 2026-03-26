import { Ionicons } from "@expo/vector-icons";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, Image, Pressable, StyleSheet, Text, View } from "react-native";

const logoImage = require("@/assets/images/literaku-logo.png");

import Colors from "@/constants/colors";
import type { NaturalVoiceHint } from "@/constants/data";
import { useReadingPreferences } from "@/contexts/ReadingPreferences";
import { useVoiceActivation } from "@/contexts/VoiceActivation";
import { useT } from "@/hooks/useTranslation";

interface SwipeHintBarProps {
  hints?: NaturalVoiceHint[];
  onHelpPress?: () => void;
  showHelpButton?: boolean;
}

export default function SwipeHintBar({ hints, onHelpPress, showHelpButton = false }: SwipeHintBarProps) {
  const [hintIndex, setHintIndex] = useState(0);
  const { isVoiceOnly, setInteractionMode } = useReadingPreferences();
  const { activateVoice } = useVoiceActivation();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const t = useT();

  const currentHint = hints && hints.length > 0 ? hints[hintIndex % hints.length] : null;

  useEffect(() => {
    if (isVoiceOnly) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isVoiceOnly, pulseAnim]);

  const cycleHint = useCallback(() => {
    if (hints && hints.length > 1) {
      setHintIndex((prev) => (prev + 1) % hints.length);
    }
  }, [hints]);

  const toggleMode = useCallback(() => {
    const newMode = isVoiceOnly ? "touch" : "voice";
    setInteractionMode(newMode);
    AccessibilityInfo.announceForAccessibility(
      newMode === "voice" ? t.swipeHintBar.voiceModeOn : t.swipeHintBar.touchModeOn
    );
  }, [isVoiceOnly, setInteractionMode, t]);

  const handleMicPress = useCallback(() => {
    activateVoice();
    AccessibilityInfo.announceForAccessibility(t.overlay.listening);
  }, [activateVoice, t]);

  return (
    <View style={styles.container} accessibilityRole="toolbar" accessibilityLabel={t.swipeHintBar.swipeLeftCommand}>
      <View style={styles.row}>
        <Image source={logoImage} style={styles.logoImg} accessibilityElementsHidden />

        <Pressable
          style={[styles.modeChip, isVoiceOnly && styles.modeChipActive]}
          onPress={toggleMode}
          accessibilityRole="button"
          accessibilityLabel={isVoiceOnly ? t.swipeHintBar.switchToTouch : t.swipeHintBar.switchToVoice}
          accessibilityHint={isVoiceOnly ? t.swipeHintBar.voiceHint : t.swipeHintBar.touchHint}
        >
          <Ionicons
            name={isVoiceOnly ? "mic" : "hand-left"}
            size={16}
            color={isVoiceOnly ? "#FFFFFF" : Colors.primaryLight}
          />
          <Text style={[styles.modeChipText, isVoiceOnly && styles.modeChipTextActive]}>
            {isVoiceOnly ? "Voice" : "Touch"}
          </Text>
        </Pressable>

        <Pressable
          style={styles.hintArea}
          onPress={cycleHint}
          accessibilityRole="button"
          accessibilityLabel={t.swipeHintBar.swipeA11y(currentHint?.example ?? null)}
          accessibilityHint="Double tap to see another example voice command"
        >
          {currentHint && (
            <Text style={styles.hintText} numberOfLines={1}>
              {t.swipeHintBar.tryExample(currentHint.example)}
            </Text>
          )}
        </Pressable>

        {showHelpButton && onHelpPress && (
          <Pressable
            style={styles.helpBtn}
            onPress={onHelpPress}
            accessibilityRole="button"
            accessibilityLabel="Voice guide"
            accessibilityHint="Double tap to open the voice command guide"
          >
            <Ionicons name="help-circle" size={28} color={Colors.primaryLight} />
          </Pressable>
        )}

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Pressable
            style={[styles.micButton, isVoiceOnly && styles.micButtonActive]}
            onPress={handleMicPress}
            accessibilityRole="button"
            accessibilityLabel="Activate voice command"
            accessibilityHint="Double tap to open voice commands"
          >
            <Ionicons name="mic" size={26} color="#FFFFFF" />
          </Pressable>
        </Animated.View>
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
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 8,
  },
  logoImg: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  hintArea: {
    flex: 1,
    justifyContent: "center",
    minHeight: 36,
  },
  hintText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: Colors.primaryLight,
  },
  modeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: Colors.voiceBarBg,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
  },
  modeChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primaryLight,
  },
  modeChipText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.primaryLight,
  },
  modeChipTextActive: {
    color: "#FFFFFF",
  },
  helpBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  micButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#34A853",
    alignItems: "center",
    justifyContent: "center",
  },
  micButtonActive: {
    backgroundColor: "#2E7D32",
  },
});
