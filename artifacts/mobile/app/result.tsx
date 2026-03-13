import { router, useLocalSearchParams } from "expo-router";
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

export default function ResultScreen() {
  const insets = useSafeAreaInsets();
  const { name, npm, score } = useLocalSearchParams<{
    name: string;
    npm: string;
    score: string;
  }>();

  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;

  const scoreNum = parseInt(score || "0", 10);

  const handleFinish = () => {
    router.replace("/");
  };

  const handleRetry = () => {
    router.replace({
      pathname: "/quiz",
      params: { name: name || "", npm: npm || "" },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
      <StatusBar style="light" />

      <View style={styles.content}>
        <Text style={styles.congratsText}>
          Anda telah menyelesaikan QuizLab4, {name}!
        </Text>
        <Text style={styles.scoreLabel}>Hasil skor anda adalah</Text>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreValue}>{scoreNum}</Text>
        </View>

        <Text style={styles.footerText}>
          Terimakasih telah menggunakan aplikasi
        </Text>
      </View>

      <View style={styles.bottomSection}>
        <Pressable style={styles.finishButton} onPress={handleFinish}>
          <Text style={styles.finishButtonText}>Selesaikan Quiz</Text>
        </Pressable>

        <Pressable style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Ulang</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  congratsText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.text,
    textAlign: "center",
    lineHeight: 26,
  },
  scoreLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  scoreContainer: {
    marginVertical: 16,
  },
  scoreValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 64,
    color: Colors.text,
    textAlign: "center",
  },
  footerText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  bottomSection: {
    gap: 12,
    paddingBottom: 16,
  },
  finishButton: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: "center",
  },
  finishButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.text,
  },
  retryButton: {
    backgroundColor: "transparent",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 16,
    alignItems: "center",
  },
  retryButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.primary,
  },
});
