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
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
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
      {isVoiceOnly && (
        <View style={styles.frozenBanner} accessibilityRole="text" accessibilityLabel={t.swipeHintBar.voiceModeActive}>
          <Ionicons name="mic" size={18} color={Colors.studentPrimary} />
          <Text style={styles.frozenText}>{t.swipeHintBar.voiceModeBanner}</Text>
        </View>
      )}
      <View style={styles.row}>
        <Pressable
          style={[styles.modeToggle, isVoiceOnly ? styles.modeToggleVoice : styles.modeToggleTouch]}
          onPress={toggleMode}
          accessibilityRole="button"
          accessibilityLabel={isVoiceOnly ? t.swipeHintBar.switchToTouch : t.swipeHintBar.switchToVoice}
          accessibilityHint={isVoiceOnly ? t.swipeHintBar.voiceHint : t.swipeHintBar.touchHint}
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
          accessibilityLabel={t.swipeHintBar.swipeA11y(currentHint?.example ?? null)}
          accessibilityHint="Double tap to see another example voice command"
        >
          <Text style={styles.swipeText}>
            {isVoiceOnly ? t.swipeHintBar.swipeLeftVoice : t.swipeHintBar.swipeLeftCommand}
          </Text>
          {currentHint && (
            <Text style={styles.exampleText} numberOfLines={1}>
              {t.swipeHintBar.tryExample(currentHint.example)}
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

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Pressable
            style={styles.micButton}
            onPress={handleMicPress}
            accessibilityRole="button"
            accessibilityLabel="Activate voice command"
            accessibilityHint="Double tap to open voice commands"
          >
            <Image source={logoImage} style={styles.micButtonLogo} />
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
  micButton: {
    width: 56,
    height: 56,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#1565C0",
  },
  micButtonLogo: {
    width: 50,
    height: 50,
  },
});
