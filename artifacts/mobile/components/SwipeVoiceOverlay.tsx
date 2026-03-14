import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  AccessibilityInfo,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Colors from "@/constants/colors";

interface SwipeVoiceOverlayProps {
  visible: boolean;
  onDismiss: () => void;
}

export default function SwipeVoiceOverlay({ visible, onDismiss }: SwipeVoiceOverlayProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();

      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      AccessibilityInfo.announceForAccessibility(
        "Voice command active. Speak naturally. Swipe right or tap anywhere to dismiss."
      );

      return () => pulse.stop();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, pulseAnim, fadeAnim]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.overlay, { opacity: fadeAnim }]}
      accessible
      accessibilityRole="alert"
      accessibilityLabel="Voice command listening. Speak naturally in Indonesian or English. Tap anywhere or swipe right to dismiss."
    >
      <Pressable
        style={styles.overlayTouchable}
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel="Dismiss voice command"
        accessibilityHint="Double tap or swipe right to stop listening"
      >
        <View style={styles.content}>
          <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]} />
          <View style={styles.micCircle}>
            <Ionicons name="mic" size={56} color="#FFFFFF" />
          </View>

          <Text style={styles.listeningText}>Saya mendengarkan...</Text>
          <Text style={styles.subtitleText}>Bicara saja secara alami</Text>
          <Text style={styles.langText}>Indonesian & English</Text>

          <View style={styles.dismissHint}>
            <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.6)" />
            <Text style={styles.dismissText}>Swipe kanan atau tap untuk berhenti</Text>
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
  pulseRing: {
    position: "absolute",
    top: -20,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(46, 125, 50, 0.25)",
  },
  micCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.studentPrimary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.3)",
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
