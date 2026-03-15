import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import {
  AccessibilityInfo,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Colors from "@/constants/colors";

export default function SplashScreen() {
  const isWeb = Platform.OS === "web";

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(
      "Welcome to Literaku. Loading..."
    );
    const timer = setTimeout(() => {
      router.replace("/student/login");
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container} accessibilityLabel="Literaku splash screen. Loading the app.">
      <StatusBar style="light" />
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Ionicons name="headset" size={64} color="#FFFFFF" />
        </View>
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
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
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
