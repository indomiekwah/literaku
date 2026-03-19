import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  AccessibilityInfo,
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Colors from "@/constants/colors";
import { useReadingPreferences } from "@/contexts/ReadingPreferences";
import { getTranslations } from "@/constants/translations";

const logoImage = require("@/assets/images/literaku-logo.png");

interface SwipeVoiceOverlayProps {
  visible: boolean;
  onDismiss: () => void;
}

export default function SwipeVoiceOverlay({ visible, onDismiss }: SwipeVoiceOverlayProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const wave3 = useRef(new Animated.Value(0)).current;
  const wave4 = useRef(new Animated.Value(0)).current;
  const { language } = useReadingPreferences();
  const t = getTranslations(language);

  const langLabel = language === "en" ? "English" : "Indonesian";

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();

      const createWave = (anim: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: 1,
              duration: 900,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        );

      const w1 = createWave(wave1, 0);
      const w2 = createWave(wave2, 220);
      const w3 = createWave(wave3, 440);
      const w4 = createWave(wave4, 660);

      w1.start();
      w2.start();
      w3.start();
      w4.start();

      AccessibilityInfo.announceForAccessibility(
        "Voice command active. Speak naturally. Swipe right or tap anywhere to dismiss."
      );

      return () => {
        w1.stop();
        w2.stop();
        w3.stop();
        w4.stop();
      };
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim, wave1, wave2, wave3, wave4]);

  if (!visible) return null;

  const renderWave = (anim: Animated.Value, size: number) => {
    const scale = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1.2],
    });
    const opacity = anim.interpolate({
      inputRange: [0, 0.15, 0.6, 1],
      outputRange: [0.7, 0.5, 0.2, 0],
    });
    return (
      <Animated.View
        style={[
          styles.waveRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [{ scale }],
            opacity,
          },
        ]}
      />
    );
  };

  return (
    <Animated.View
      style={[styles.overlay, { opacity: fadeAnim }]}
      accessible
      accessibilityRole="alert"
      accessibilityLabel={t.overlay.a11yLabel(langLabel)}
    >
      <Pressable
        style={styles.overlayTouchable}
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel={t.overlay.dismissHint}
        accessibilityHint={t.overlay.dismissHint}
      >
        <View style={styles.content}>
          <View style={styles.wavesContainer}>
            {renderWave(wave4, 420)}
            {renderWave(wave3, 340)}
            {renderWave(wave2, 260)}
            {renderWave(wave1, 180)}
            <View style={styles.logoContainer}>
              <Image source={logoImage} style={styles.logoImage} />
            </View>
          </View>

          <Text style={styles.listeningText}>{t.overlay.listening}</Text>
          <Text style={styles.subtitleText}>{t.overlay.speakNaturally}</Text>
          <Text style={styles.langText}>{langLabel}</Text>

          <View style={styles.dismissHint}>
            <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.6)" />
            <Text style={styles.dismissText}>{t.overlay.dismissHint}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.88)",
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
  },
  overlayTouchable: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    gap: 16,
  },
  wavesContainer: {
    width: 420,
    height: 420,
    alignItems: "center",
    justifyContent: "center",
  },
  waveRing: {
    position: "absolute",
    backgroundColor: "#1976D2",
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    overflow: "hidden",
    zIndex: 10,
    elevation: 10,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  listeningText: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: "#FFFFFF",
    marginTop: 12,
  },
  subtitleText: {
    fontFamily: "Inter_500Medium",
    fontSize: 20,
    color: "rgba(255,255,255,0.8)",
  },
  langText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: "rgba(255,255,255,0.5)",
    marginTop: 4,
  },
  dismissHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  dismissText: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: "rgba(255,255,255,0.6)",
  },
});
