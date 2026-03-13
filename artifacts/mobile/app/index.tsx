import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
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

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [npm, setNpm] = useState("");

  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;

  const handleStart = () => {
    if (!name.trim() || !npm.trim()) return;
    router.push({
      pathname: "/quiz",
      params: { name: name.trim(), npm: npm.trim() },
    });
  };

  const isValid = name.trim().length > 0 && npm.trim().length > 0;

  return (
    <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.appTitle}>QuizLab4</Text>
        <Pressable style={styles.settingsButton}>
          <Feather name="settings" size={20} color={Colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.welcomeTitle}>Selamat datang di QuizLab4</Text>
        <Text style={styles.welcomeSubtitle}>
          Masukkan nama dan NPM sebelum menjawab
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nama</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan nama..."
              placeholderTextColor={Colors.textSecondary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>NPM</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan NPM..."
              placeholderTextColor={Colors.textSecondary}
              value={npm}
              onChangeText={setNpm}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Feather name="check-circle" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.logoText}>QuizLab4</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoName}>{name || "Nama Anda"}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>NPM</Text>
            <Text style={styles.infoValue}>{npm || "-"}</Text>
          </View>
        </View>
      </ScrollView>

      <Pressable
        style={[styles.startButton, !isValid && styles.startButtonDisabled]}
        onPress={handleStart}
        disabled={!isValid}
      >
        <Text style={styles.startButtonText}>Masuk ke Quiz</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  appTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.text,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  welcomeTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: Colors.text,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 28,
  },
  form: {
    gap: 16,
    marginBottom: 32,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.text,
  },
  logoContainer: {
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.cardBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.text,
  },
  infoCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  infoName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.text,
  },
  infoRow: {
    flexDirection: "row",
    gap: 8,
  },
  infoLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.text,
  },
  startButton: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.text,
  },
});
