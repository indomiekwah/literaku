import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { guideCommands } from "@/constants/data";

export default function GuideScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Go back">
          <Feather name="arrow-left" size={32} color={Colors.text} />
        </Pressable>
        <View style={{ width: 56 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.illustrationContainer}>
          <View style={styles.illustrationCircle}>
            <Ionicons name="desktop-outline" size={64} color={Colors.primary} />
          </View>
          <Text style={styles.illustrationText}>
            Say "Open Help" to see available commands.
          </Text>
        </View>

        <Text style={styles.helpTitle}>Help</Text>

        <Text style={styles.helpIntro}>
          Use the following commands:
        </Text>

        <View style={styles.commandList}>
          {guideCommands.map((item, index) => (
            <View key={index} style={styles.commandCard}>
              <View style={styles.commandNumberCircle}>
                <Text style={styles.commandNumber}>{index + 1}</Text>
              </View>
              <Text style={styles.commandText}>
                <Text style={styles.commandBold}>"{item.command}"</Text> {item.description}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable style={styles.micContainer} accessibilityLabel="Microphone">
          <Ionicons name="mic" size={32} color={Colors.primary} />
        </Pressable>
        <Text style={styles.listeningText}>Listening...</Text>
        <Pressable style={styles.helpButton} accessibilityLabel="Help">
          <Ionicons name="help-circle" size={44} color={Colors.historyButton} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  illustrationContainer: {
    alignItems: "center",
    gap: 18,
    paddingVertical: 16,
    marginBottom: 8,
  },
  illustrationCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.border,
  },
  illustrationText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 26,
    paddingHorizontal: 12,
  },
  helpTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 34,
    color: Colors.primary,
    textAlign: "center",
    marginBottom: 16,
  },
  helpIntro: {
    fontFamily: "Inter_700Bold",
    fontSize: 19,
    color: Colors.text,
    marginBottom: 18,
  },
  commandList: {
    gap: 14,
  },
  commandCard: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "flex-start",
    minHeight: 72,
  },
  commandNumberCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  commandNumber: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#FFFFFF",
  },
  commandText: {
    fontFamily: "Inter_400Regular",
    fontSize: 18,
    color: Colors.text,
    lineHeight: 28,
    flex: 1,
  },
  commandBold: {
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  micContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  listeningText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.textSecondary,
    flex: 1,
  },
  helpButton: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
});
