import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import VoiceCommandBar from "@/components/VoiceCommandBar";
import { voiceCommands } from "@/constants/data";

export default function RoleSelectScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;

  return (
    <View
      style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}
      accessibilityRole="summary"
      accessibilityLabel="Literaku. Voice-first accessible reading platform. Choose your role to continue."
    >
      <StatusBar style="dark" />

      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoCircle}>
            <Ionicons name="book" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.logoText}>Literaku</Text>
        </View>
        <Text style={styles.tagline}>Accessible Reading for Everyone</Text>
      </View>

      <View style={styles.promptSection}>
        <Text style={styles.promptText} accessibilityRole="header">
          Who are you?
        </Text>
        <Text style={styles.promptSubtext}>
          Say "I am a student" or "I am an administrator", or tap below.
        </Text>
      </View>

      <View style={styles.buttonSection}>
        <Pressable
          style={({ pressed }) => [
            styles.roleButton,
            styles.institutionButton,
            { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
          ]}
          onPress={() => router.push("/institution/login")}
          accessibilityRole="button"
          accessibilityLabel="I am an Institution Administrator"
          accessibilityHint="Opens institution administrator login"
        >
          <View style={styles.roleIconCircle}>
            <Ionicons name="business" size={40} color={Colors.institutionPrimary} />
          </View>
          <View style={styles.roleInfo}>
            <Text style={styles.roleTitle}>Institution</Text>
            <Text style={styles.roleSubtitle}>Administrator</Text>
          </View>
          <Ionicons name="chevron-forward" size={32} color="#FFFFFF" />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.roleButton,
            styles.studentButton,
            { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
          ]}
          onPress={() => router.push("/student/login")}
          accessibilityRole="button"
          accessibilityLabel="I am a Student"
          accessibilityHint="Opens student login"
        >
          <View style={styles.roleIconCircle}>
            <Ionicons name="person" size={40} color={Colors.studentPrimary} />
          </View>
          <View style={styles.roleInfo}>
            <Text style={styles.roleTitle}>Student</Text>
            <Text style={styles.roleSubtitle}>Start Reading</Text>
          </View>
          <Ionicons name="chevron-forward" size={32} color="#FFFFFF" />
        </Pressable>
      </View>

      <VoiceCommandBar hints={voiceCommands.roleSelect} showHelpButton={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    paddingTop: 24,
    gap: 8,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.voiceBarBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  logoText: {
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    color: Colors.primary,
  },
  tagline: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  promptSection: {
    alignItems: "center",
    paddingVertical: 28,
    gap: 12,
  },
  promptText: {
    fontFamily: "Inter_700Bold",
    fontSize: 30,
    color: Colors.text,
    textAlign: "center",
  },
  promptSubtext: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 26,
    paddingHorizontal: 8,
  },
  buttonSection: {
    flex: 1,
    justifyContent: "center",
    gap: 18,
    paddingBottom: 12,
  },
  roleButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 22,
    gap: 16,
    minHeight: 110,
  },
  institutionButton: {
    backgroundColor: Colors.institutionPrimary,
  },
  studentButton: {
    backgroundColor: Colors.studentPrimary,
  },
  roleIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  roleInfo: {
    flex: 1,
    gap: 4,
  },
  roleTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    color: "#FFFFFF",
  },
  roleSubtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: "rgba(255,255,255,0.85)",
  },
});
