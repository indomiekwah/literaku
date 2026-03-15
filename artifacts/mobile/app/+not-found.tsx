import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  AccessibilityInfo,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import SwipeHintBar from "@/components/SwipeHintBar";
import SwipeVoiceWrapper from "@/components/SwipeVoiceWrapper";
import { voiceHints } from "@/constants/data";

export default function NotFoundScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;

  React.useEffect(() => {
    AccessibilityInfo.announceForAccessibility(
      "Halaman tidak ditemukan. Ketuk tombol untuk kembali ke beranda."
    );
  }, []);

  return (
    <SwipeVoiceWrapper>
      <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
        <View style={styles.content}>
          <Ionicons name="alert-circle-outline" size={80} color={Colors.textSecondary} />
          <Text
            style={styles.title}
            accessibilityRole="header"
          >
            Halaman tidak ditemukan
          </Text>
          <Text style={styles.subtitle}>
            Maaf, halaman yang Anda cari tidak ada.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.homeButton,
              { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
            onPress={() => router.replace("/student/home")}
            accessibilityRole="button"
            accessibilityLabel="Kembali ke beranda"
            accessibilityHint="Double tap to go back to home screen"
          >
            <Ionicons name="home" size={24} color="#FFFFFF" />
            <Text style={styles.homeButtonText}>Kembali ke Beranda</Text>
          </Pressable>
        </View>

        <SwipeHintBar hints={voiceHints.studentHome} />
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
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: Colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 26,
  },
  homeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.primaryLight,
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 28,
    marginTop: 12,
    minHeight: 64,
  },
  homeButtonText: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: "#FFFFFF",
  },
});
