import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  AccessibilityInfo,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import SwipeHintBar from "@/components/SwipeHintBar";
import SwipeVoiceWrapper from "@/components/SwipeVoiceWrapper";
import { voiceHints } from "@/constants/data";

export default function InstitutionLoginScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  React.useEffect(() => {
    AccessibilityInfo.announceForAccessibility(
      "Institution login. Enter your email and password to continue."
    );
  }, []);

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      AccessibilityInfo.announceForAccessibility(
        "Please fill in both email and password"
      );
      return;
    }
    AccessibilityInfo.announceForAccessibility("Signing in...");
    if (email.trim().includes("@")) {
      router.replace("/institution/dashboard");
    } else {
      AccessibilityInfo.announceForAccessibility(
        "Login failed. Invalid email address. Please check and try again."
      );
    }
  };

  return (
    <SwipeVoiceWrapper>
      <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
        <StatusBar style="dark" />

        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back to role selection"
            accessibilityHint="Double tap to return to role selection screen"
          >
            <Feather name="arrow-left" size={32} color={Colors.text} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.iconSection}>
            <View style={styles.iconCircle}>
              <Ionicons name="business" size={48} color={Colors.institutionPrimary} />
            </View>
            <Text style={styles.title} accessibilityRole="header">Institution Login</Text>
            <Text style={styles.subtitle}>Sign in as administrator</Text>
          </View>

          <View style={styles.form}>
            <View
              style={styles.inputGroup}
              accessible
              accessibilityLabel="Email address input field"
            >
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="admin@institution.edu"
                placeholderTextColor={Colors.borderStrong}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                accessibilityLabel="Email address"
                accessibilityHint="Type your institution email address here"
              />
            </View>

            <View
              style={styles.inputGroup}
              accessible
              accessibilityLabel="Password input field"
            >
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor={Colors.borderStrong}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                accessibilityLabel="Password"
                accessibilityHint="Enter your password"
              />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.loginButton,
                { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
              ]}
              onPress={handleLogin}
              accessibilityRole="button"
              accessibilityLabel="Sign in to institution dashboard"
              accessibilityHint="Double tap to sign in with your credentials"
            >
              <Text style={styles.loginButtonText}>Sign In</Text>
            </Pressable>
          </View>
        </View>

        <SwipeHintBar hints={voiceHints.institutionLogin} />
      </View>
    </SwipeVoiceWrapper>
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
    backgroundColor: Colors.voiceBarBg,
    borderWidth: 3,
    borderColor: Colors.institutionPrimary,
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
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  form: {
    gap: 18,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
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
    backgroundColor: Colors.institutionPrimary,
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
