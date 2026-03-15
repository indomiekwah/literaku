import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  AccessibilityInfo,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import SwipeHintBar from "@/components/SwipeHintBar";
import SwipeVoiceWrapper from "@/components/SwipeVoiceWrapper";
import { voiceHints } from "@/constants/data";
import { useReadingPreferences } from "@/contexts/ReadingPreferences";

interface NavButtonProps {
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint: string;
}

function NavButton({ label, subtitle, icon, color, onPress, accessibilityLabel, accessibilityHint }: NavButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.navButton,
        { backgroundColor: color, opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      <View style={styles.navIconCircle}>
        <Ionicons name={icon} size={32} color={color} />
      </View>
      <View style={styles.navInfo}>
        <Text style={styles.navTitle}>{label}</Text>
        <Text style={styles.navSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={28} color="rgba(255,255,255,0.7)" />
    </Pressable>
  );
}

export default function StudentHomeScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;
  const { isVoiceOnly } = useReadingPreferences();

  React.useEffect(() => {
    AccessibilityInfo.announceForAccessibility(
      "Beranda Literaku. Pilih menu: Penjelajah, Riwayat, Koleksi, atau Panduan. Swipe kiri untuk perintah suara."
    );
  }, []);

  return (
    <SwipeVoiceWrapper>
      <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
        <StatusBar style="dark" />

        <View style={[styles.freezeZone, isVoiceOnly && styles.frozen, { pointerEvents: isVoiceOnly ? 'none' : 'auto' }]}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.logoCircle}>
                <Ionicons name="headset" size={22} color={Colors.primaryLight} />
              </View>
              <Text style={styles.headerTitle}>Literaku</Text>
            </View>
            <Pressable
              style={styles.settingsButton}
              onPress={() => router.push("/student/settings")}
              accessibilityRole="button"
              accessibilityLabel="Settings"
              accessibilityHint="Double tap to open settings"
            >
              <Ionicons name="settings-outline" size={26} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <NavButton
              label="Penjelajah"
              subtitle="Jelajahi & beli buku"
              icon="compass"
              color="#2E7D32"
              onPress={() => router.push("/student/penjelajah")}
              accessibilityLabel="Penjelajah. Jelajahi dan beli buku baru"
              accessibilityHint="Double tap to browse and buy books"
            />

            <NavButton
              label="Riwayat"
              subtitle="Riwayat bacaan & bookmark"
              icon="time"
              color="#C62828"
              onPress={() => router.push("/student/riwayat")}
              accessibilityLabel="Riwayat. Lihat riwayat bacaan dan bookmark"
              accessibilityHint="Double tap to view reading history"
            />

            <NavButton
              label="Koleksi"
              subtitle="Buku yang dimiliki"
              icon="library"
              color="#1565C0"
              onPress={() => router.push("/student/library")}
              accessibilityLabel="Koleksi. Buku yang sudah dibeli atau dimiliki"
              accessibilityHint="Double tap to view your book collection"
            />

            <NavButton
              label="Panduan"
              subtitle="Panduan perintah suara"
              icon="help-circle"
              color="#37474F"
              onPress={() => router.push("/student/guide")}
              accessibilityLabel="Panduan. Pelajari perintah suara AI"
              accessibilityHint="Double tap to open voice command guide"
            />

            <Pressable
              style={({ pressed }) => [
                styles.redeemButton,
                { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
              ]}
              onPress={() => router.push("/student/riwayat")}
              accessibilityRole="button"
              accessibilityLabel="Redeem Token. Masukkan kode dari institusi Anda"
              accessibilityHint="Double tap to redeem an institution token for free books"
            >
              <Ionicons name="gift" size={28} color={Colors.primaryLight} />
              <View style={styles.redeemInfo}>
                <Text style={styles.redeemTitle}>Redeem Token</Text>
                <Text style={styles.redeemSubtitle}>Punya kode dari institusi?</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={Colors.primaryLight} />
            </Pressable>
          </ScrollView>
        </View>

        <SwipeHintBar
          hints={voiceHints.studentHome}
          showHelpButton
          onHelpPress={() => router.push("/student/guide")}
        />
      </View>
    </SwipeVoiceWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 18,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.voiceBarBg,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: Colors.primaryLight,
  },
  settingsButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 8,
    gap: 14,
    paddingTop: 8,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 22,
    gap: 16,
    minHeight: 90,
  },
  navIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  navInfo: {
    flex: 1,
    gap: 4,
  },
  navTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: "#FFFFFF",
  },
  navSubtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: "rgba(255,255,255,0.8)",
  },
  redeemButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.voiceBarBg,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    minHeight: 72,
  },
  redeemInfo: {
    flex: 1,
    gap: 2,
  },
  redeemTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.primaryLight,
  },
  redeemSubtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
  },
  freezeZone: {
    flex: 1,
  },
  frozen: {
    opacity: 0.5,
  },
});
