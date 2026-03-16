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
  const [showEmailForm, setShowEmailForm] = useState(false);

  React.useEffect(() => {
    AccessibilityInfo.announceForAccessibility(
      "Selamat datang di Literaku. Tekan tombol besar untuk masuk dengan Google atau Microsoft. Atau buka form email di bawah."
    );
  }, []);

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      AccessibilityInfo.announceForAccessibility(
        "Harap isi email dan password"
      );
      return;
    }
    AccessibilityInfo.announceForAccessibility("Sedang masuk...");
    router.replace("/student/home");
  };

  const handleOAuth = (provider: string) => {
    AccessibilityInfo.announceForAccessibility(`Masuk dengan ${provider}...`);
    router.replace("/student/home");
  };

  const toggleEmailForm = () => {
    setShowEmailForm(!showEmailForm);
    if (!showEmailForm) {
      AccessibilityInfo.announceForAccessibility("Form email terbuka. Ketik email dan password Anda.");
    } else {
      AccessibilityInfo.announceForAccessibility("Form email ditutup.");
    }
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
            <Text style={styles.subtitle}>Baca buku dengan suara</Text>
          </View>

          <View style={styles.quickLoginSection}>
            <Text style={styles.quickLoginTitle} accessibilityRole="header">Masuk dengan satu ketukan</Text>

            <Pressable
              style={({ pressed }) => [
                styles.oauthButtonPrimary,
                styles.googleButton,
                { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
              ]}
              onPress={() => handleOAuth("Google")}
              accessibilityRole="button"
              accessibilityLabel="Masuk dengan Google. Cara tercepat untuk masuk."
              accessibilityHint="Double tap untuk masuk menggunakan akun Google Anda"
            >
              <View style={styles.oauthIconCircle}>
                <Ionicons name="logo-google" size={32} color="#DB4437" />
              </View>
              <View style={styles.oauthTextGroup}>
                <Text style={styles.oauthButtonTextPrimary}>Masuk dengan Google</Text>
                <Text style={styles.oauthButtonSubtext}>Tanpa perlu ketik password</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.oauthButtonPrimary,
                styles.microsoftButton,
                { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
              ]}
              onPress={() => handleOAuth("Microsoft")}
              accessibilityRole="button"
              accessibilityLabel="Masuk dengan Microsoft. Gunakan akun sekolah Anda."
              accessibilityHint="Double tap untuk masuk menggunakan akun Microsoft Anda"
            >
              <View style={styles.oauthIconCircle}>
                <Ionicons name="logo-microsoft" size={32} color="#00A4EF" />
              </View>
              <View style={styles.oauthTextGroup}>
                <Text style={styles.oauthButtonTextPrimary}>Masuk dengan Microsoft</Text>
                <Text style={styles.oauthButtonSubtext}>Akun sekolah atau pribadi</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
            </Pressable>
          </View>

          <Pressable
            style={styles.emailToggle}
            onPress={toggleEmailForm}
            accessibilityRole="button"
            accessibilityLabel={showEmailForm ? "Tutup form email" : "Buka form email dan password"}
            accessibilityHint={showEmailForm ? "Double tap untuk menutup form" : "Double tap untuk masuk dengan email"}
          >
            <View style={styles.dividerLine} />
            <View style={styles.emailToggleContent}>
              <Ionicons name="mail-outline" size={22} color={Colors.textSecondary} />
              <Text style={styles.emailToggleText}>
                {showEmailForm ? "Tutup form email" : "Masuk dengan email & password"}
              </Text>
              <Ionicons name={showEmailForm ? "chevron-up" : "chevron-down"} size={22} color={Colors.textSecondary} />
            </View>
            <View style={styles.dividerLine} />
          </Pressable>

          {showEmailForm && (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="email@contoh.com"
                  placeholderTextColor={Colors.borderStrong}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  accessibilityLabel="Alamat email"
                  accessibilityHint="Ketik alamat email Anda di sini"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Masukkan password"
                    placeholderTextColor={Colors.borderStrong}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    accessibilityLabel="Password"
                    accessibilityHint="Masukkan password Anda"
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? "Sembunyikan password" : "Tampilkan password"}
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
                accessibilityLabel="Masuk dengan email dan password"
                accessibilityHint="Double tap untuk masuk"
              >
                <Ionicons name="log-in-outline" size={24} color="#FFFFFF" />
                <Text style={styles.loginButtonText}>Masuk</Text>
              </Pressable>
            </View>
          )}

          <Pressable
            style={styles.registerLink}
            onPress={() => {
              AccessibilityInfo.announceForAccessibility("Pendaftaran belum tersedia");
            }}
            accessibilityRole="button"
            accessibilityLabel="Buat akun baru"
            accessibilityHint="Double tap untuk mendaftar akun Literaku baru"
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
  quickLoginSection: {
    gap: 14,
  },
  quickLoginTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.text,
    textAlign: "center",
  },
  oauthButtonPrimary: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    gap: 16,
    minHeight: 88,
  },
  googleButton: {
    backgroundColor: "#C62828",
  },
  microsoftButton: {
    backgroundColor: "#0078D4",
  },
  oauthIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
  },
  oauthTextGroup: {
    flex: 1,
    gap: 4,
  },
  oauthButtonTextPrimary: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: "#FFFFFF",
  },
  oauthButtonSubtext: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
  },
  emailToggle: {
    gap: 12,
    alignItems: "center",
  },
  emailToggleContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    minHeight: 48,
  },
  emailToggleText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.textSecondary,
  },
  dividerLine: {
    height: 1.5,
    backgroundColor: Colors.border,
    alignSelf: "stretch",
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
    flexDirection: "row",
    gap: 10,
  },
  loginButtonText: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: "#FFFFFF",
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
