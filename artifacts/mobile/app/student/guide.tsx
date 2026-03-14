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
import VoiceCommandBar from "@/components/VoiceCommandBar";
import { voiceCommands } from "@/constants/data";

interface CommandSectionProps {
  title: string;
  commands: { command: string; description: string }[];
}

function CommandSection({ title, commands }: CommandSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header">{title}</Text>
      <View style={styles.commandList}>
        {commands.map((item, index) => (
          <View
            key={index}
            style={styles.commandCard}
            accessibilityRole="text"
            accessibilityLabel={`Command: ${item.command}. ${item.description}`}
          >
            <View style={styles.commandNumberCircle}>
              <Text style={styles.commandNumber}>{index + 1}</Text>
            </View>
            <Text style={styles.commandText}>
              <Text style={styles.commandBold}>"{item.command}"</Text>{" "}
              {item.description}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function StudentGuideScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back">
          <Feather name="arrow-left" size={32} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} accessibilityRole="header">Voice Guide</Text>
        <View style={{ width: 56 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.illustrationContainer}>
          <View style={styles.illustrationCircle}>
            <Ionicons name="mic" size={56} color={Colors.studentPrimary} />
          </View>
          <Text style={styles.illustrationTitle}>Voice Commands</Text>
          <Text style={styles.illustrationText}>
            Literaku is designed for voice control. Use these commands to navigate and read.
          </Text>
        </View>

        <CommandSection title="Home Screen" commands={voiceCommands.studentHome} />
        <CommandSection title="Library" commands={voiceCommands.studentLibrary} />
        <CommandSection title="While Reading" commands={voiceCommands.reader} />
      </ScrollView>

      <VoiceCommandBar hints={voiceCommands.studentGuide} showHelpButton={false} />
    </View>
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
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
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
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    color: Colors.text,
    flex: 1,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
    gap: 24,
  },
  illustrationContainer: {
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
  },
  illustrationCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.successLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.studentPrimary,
  },
  illustrationTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: Colors.studentPrimary,
    textAlign: "center",
  },
  illustrationText: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.text,
  },
  commandList: {
    gap: 10,
  },
  commandCard: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "flex-start",
    minHeight: 64,
  },
  commandNumberCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.studentPrimary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  commandNumber: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  commandText: {
    fontFamily: "Inter_400Regular",
    fontSize: 17,
    color: Colors.text,
    lineHeight: 26,
    flex: 1,
  },
  commandBold: {
    fontFamily: "Inter_700Bold",
    color: Colors.studentPrimary,
  },
});
