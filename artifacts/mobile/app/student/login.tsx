import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import VoiceCommandBar from "@/components/VoiceCommandBar";
import { voiceCommands } from "@/constants/data";

export default function StudentLoginScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;
  const [instCode, setInstCode] = useState("");
  const [studentId, setStudentId] = useState("");

  const handleLogin = () => {
    router.replace("/student/home");
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back to role selection">
          <Feather name="arrow-left" size={32} color={Colors.text} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.iconSection}>
          <View style={styles.iconCircle}>
            <Ionicons name="person" size={48} color={Colors.studentPrimary} />
          </View>
          <Text style={styles.title} accessibilityRole="header">Student Login</Text>
          <Text style={styles.subtitle}>Enter your institution code and student ID</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Institution Code</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. UI2024"
              placeholderTextColor={Colors.borderStrong}
              value={instCode}
              onChangeText={setInstCode}
              autoCapitalize="characters"
              accessibilityLabel="Institution code"
              accessibilityHint="Enter the code provided by your institution"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Student ID</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. STU001"
              placeholderTextColor={Colors.borderStrong}
              value={studentId}
              onChangeText={setStudentId}
              autoCapitalize="characters"
              accessibilityLabel="Student ID"
              accessibilityHint="Enter your student ID number"
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
            onPress={handleLogin}
            accessibilityRole="button"
            accessibilityLabel="Sign in to start reading"
          >
            <Text style={styles.loginButtonText}>Start Reading</Text>
          </Pressable>
        </View>
      </View>

      <VoiceCommandBar hints={voiceCommands.studentLogin} showHelpButton={false} />
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
    flexDirection: "row",
    paddingVertical: 10,
  },
  backButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    gap: 32,
  },
  iconSection: {
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.successLight,
    borderWidth: 3,
    borderColor: Colors.studentPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: Colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 17,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  form: {
    gap: 18,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.text,
  },
  input: {
    fontFamily: "Inter_500Medium",
    fontSize: 20,
    color: Colors.text,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 2,
    borderColor: Colors.border,
    minHeight: 62,
  },
  loginButton: {
    backgroundColor: Colors.studentPrimary,
    borderRadius: 18,
    paddingVertical: 22,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    minHeight: 72,
  },
  loginButtonText: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: "#FFFFFF",
  },
});
