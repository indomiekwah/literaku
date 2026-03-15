import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  AccessibilityInfo,
  Platform,
  Pressable,
  ScrollView,
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

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    AccessibilityInfo.announceForAccessibility(
      "Login to Literaku. Enter your email and password, or sign in with Google or Microsoft."
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
    router.replace("/student/home");
  };

  const handleOAuth = (provider: string) => {
    AccessibilityInfo.announceForAccessibility(`Signing in with ${provider}...`);
    router.replace("/student/home");
  };

  return (
    <SwipeVoiceWrapper>
      <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
        <StatusBar style="dark" />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.iconSection}>
            <View style={styles.iconCircle}>
              <Ionicons name="headset" size={48} color={Colors.primaryLight} />
            </View>
            <Text style={styles.title} accessibilityRole="header">Literaku</Text>
            <Text style={styles.subtitle}>Sign in to start reading</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor={Colors.borderStrong}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                accessibilityLabel="Email address"
                accessibilityHint="Type your email address here"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Enter password"
                  placeholderTextColor={Colors.borderStrong}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  accessibilityLabel="Password"
                  accessibilityHint="Enter your password"
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={24}
                    color={Colors.textSecondary}
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.loginButton,
                { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
              ]}
              onPress={handleLogin}
              accessibilityRole="button"
              accessibilityLabel="Sign in with email and password"
              accessibilityHint="Double tap to sign in"
            >
              <Text style={styles.loginButtonText}>Sign In</Text>
            </Pressable>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>atau masuk dengan</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.oauthSection}>
            <Pressable
              style={({ pressed }) => [
                styles.oauthButton,
                { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
              ]}
              onPress={() => handleOAuth("Google")}
              accessibilityRole="button"
              accessibilityLabel="Sign in with Google"
              accessibilityHint="Double tap to sign in using your Google account"
            >
              <Ionicons name="logo-google" size={28} color="#DB4437" />
              <Text style={styles.oauthText}>Continue with Google</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.oauthButton,
                { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
              ]}
              onPress={() => handleOAuth("Microsoft")}
              accessibilityRole="button"
              accessibilityLabel="Sign in with Microsoft"
              accessibilityHint="Double tap to sign in using your Microsoft account"
            >
              <Ionicons name="logo-microsoft" size={28} color="#00A4EF" />
              <Text style={styles.oauthText}>Continue with Microsoft</Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.registerLink}
            onPress={() => {
              AccessibilityInfo.announceForAccessibility("Registration is not yet available");
            }}
            accessibilityRole="button"
            accessibilityLabel="Create a new account"
            accessibilityHint="Double tap to register for a new Literaku account"
          >
            <Text style={styles.registerText}>
              Belum punya akun? <Text style={styles.registerBold}>Daftar</Text>
            </Text>
          </Pressable>
        </ScrollView>

        <SwipeHintBar hints={voiceHints.login} />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
    justifyContent: "center",
    flexGrow: 1,
    gap: 24,
  },
  iconSection: {
    alignItems: "center",
    gap: 12,
    paddingTop: 20,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.voiceBarBg,
    borderWidth: 3,
    borderColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    color: Colors.primaryLight,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
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
  passwordRow: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 56,
  },
  eyeButton: {
    position: "absolute",
    right: 14,
    top: 0,
    bottom: 0,
    width: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButton: {
    backgroundColor: Colors.primaryLight,
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
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
  },
  oauthSection: {
    gap: 14,
  },
  oauthButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    paddingVertical: 18,
    borderWidth: 2,
    borderColor: Colors.border,
    minHeight: 66,
  },
  oauthText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.text,
  },
  registerLink: {
    alignItems: "center",
    paddingVertical: 12,
    minHeight: 48,
    justifyContent: "center",
  },
  registerText: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
  },
  registerBold: {
    fontFamily: "Inter_700Bold",
    color: Colors.primaryLight,
  },
});
