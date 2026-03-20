import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  AccessibilityInfo,
  Alert,
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
import { getTranslations } from "@/constants/translations";
import { useReadingPreferences } from "@/contexts/ReadingPreferences";

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { language } = useReadingPreferences();
  const t = getTranslations(language);

  React.useEffect(() => {
    AccessibilityInfo.announceForAccessibility(t.signup.mountAnnounce);
  }, []);

  const handleSignUp = () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      AccessibilityInfo.announceForAccessibility(t.signup.fillAllFields);
      Alert.alert("", t.signup.fillAllFields);
      return;
    }
    if (password !== confirmPassword) {
      AccessibilityInfo.announceForAccessibility(t.signup.passwordMismatch);
      Alert.alert("", t.signup.passwordMismatch);
      return;
    }
    AccessibilityInfo.announceForAccessibility(t.signup.accountCreated);
    Alert.alert("", t.signup.accountCreated, [
      {
        text: "OK",
        onPress: () => router.replace("/student/login"),
      },
    ]);
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
            accessibilityLabel={t.signup.backA11yLabel}
            accessibilityHint="Double tap to go back"
          >
            <Feather name="arrow-left" size={28} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle} accessibilityRole="header">{t.signup.title}</Text>
          <View style={{ width: 48 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.subtitle}>{t.signup.subtitle}</Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.signup.name}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.signup.namePlaceholder}
                placeholderTextColor={Colors.borderStrong}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
                accessibilityLabel={t.signup.nameA11yLabel}
                accessibilityHint={t.signup.nameA11yHint}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.signup.email}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.signup.emailPlaceholder}
                placeholderTextColor={Colors.borderStrong}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                accessibilityLabel={t.signup.emailA11yLabel}
                accessibilityHint={t.signup.emailA11yHint}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.signup.password}</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder={t.signup.passwordPlaceholder}
                  placeholderTextColor={Colors.borderStrong}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                  accessibilityLabel={t.signup.password}
                  accessibilityHint={t.signup.passwordA11yHint}
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

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.signup.confirmPassword}</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder={t.signup.confirmPlaceholder}
                  placeholderTextColor={Colors.borderStrong}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirm}
                  autoComplete="new-password"
                  accessibilityLabel={t.signup.confirmPassword}
                  accessibilityHint={t.signup.confirmA11yHint}
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowConfirm(!showConfirm)}
                  accessibilityRole="button"
                  accessibilityLabel={showConfirm ? "Hide password" : "Show password"}
                >
                  <Ionicons
                    name={showConfirm ? "eye-off" : "eye"}
                    size={24}
                    color={Colors.textSecondary}
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.signUpButton,
                { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
              ]}
              onPress={handleSignUp}
              accessibilityRole="button"
              accessibilityLabel={t.signup.signUpA11yLabel}
              accessibilityHint={t.signup.signUpA11yHint}
            >
              <Ionicons name="person-add-outline" size={22} color="#FFFFFF" />
              <Text style={styles.signUpButtonText}>{t.signup.signUpButton}</Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.signInLink}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t.signup.signInA11yLabel}
            accessibilityHint={t.signup.signInA11yHint}
          >
            <Text style={styles.signInText}>
              {t.signup.alreadyHaveAccount}{" "}
              <Text style={styles.signInBold}>{t.signup.signIn}</Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  headerTitle: {
    flex: 1,
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: Colors.text,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
    gap: 24,
    paddingTop: 8,
  },
  subtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  form: {
    gap: 16,
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
    fontSize: 18,
    color: Colors.text,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    minHeight: 56,
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
  signUpButton: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    minHeight: 60,
    flexDirection: "row",
    gap: 10,
  },
  signUpButtonText: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: "#FFFFFF",
  },
  signInLink: {
    alignItems: "center",
    paddingVertical: 12,
    minHeight: 48,
    justifyContent: "center",
  },
  signInText: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
  },
  signInBold: {
    fontFamily: "Inter_700Bold",
    color: Colors.primaryLight,
  },
});
