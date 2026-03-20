import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import {
  AccessibilityInfo,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Colors from "@/constants/colors";
import { speakText, stopTTSPlayback } from "@/services/speech";

const logoImage = require("@/assets/images/literaku-logo.png");

export default function SplashScreen() {
  const isWeb = Platform.OS === "web";

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(
      "Welcome to Literaku. Loading..."
    );
    speakText("Welcome to Literaku", "en-US-EmmaMultilingualNeural", 0.85).catch(() => {});
    const timer = setTimeout(() => {
      stopTTSPlayback();
      router.replace("/student/login");
    }, 2000);
    return () => {
      clearTimeout(timer);
      stopTTSPlayback();
    };
  }, []);

  return (
    <View style={styles.container} accessibilityLabel="Literaku splash screen. Loading the app.">
      <StatusBar style="light" />
      <View style={styles.logoContainer}>
        <Image source={logoImage} style={styles.logoImage} accessibilityLabel="Literaku logo" />
        <Text style={styles.logoText}>Literaku</Text>
        <Text style={styles.tagline}>Voice-First Accessible Reading</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    gap: 16,
  },
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 28,
  },
  logoText: {
    fontFamily: "Inter_700Bold",
    fontSize: 42,
    color: "#FFFFFF",
  },
  tagline: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: "rgba(255,255,255,0.85)",
  },
});
