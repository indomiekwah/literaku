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

export default function InstitutionLoginScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    router.replace("/institution/dashboard");
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
            <Ionicons name="business" size={48} color={Colors.institutionPrimary} />
          </View>
          <Text style={styles.title} accessibilityRole="header">Institution Login</Text>
          <Text style={styles.subtitle}>Sign in as administrator</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel} accessibilityRole="text">Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="admin@institution.edu"
              placeholderTextColor={Colors.borderStrong}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              accessibilityLabel="Email address input"
              accessibilityHint="Enter your institution email address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel} accessibilityRole="text">Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor={Colors.borderStrong}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              accessibilityLabel="Password input"
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
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </Pressable>
        </View>
      </View>

      <VoiceCommandBar showHelpButton={false} />
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
    fontSize: 17,
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
