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
import { sampleHistory, voiceHints } from "@/constants/data";

export default function StudentHomeScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;

  React.useEffect(() => {
    AccessibilityInfo.announceForAccessibility(
      "Student home. Swipe left for voice commands, or tap a button below."
    );
  }, []);

  const lastRead = sampleHistory.length > 0 ? sampleHistory[0] : null;

  return (
    <SwipeVoiceWrapper>
      <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
        <StatusBar style="dark" />

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoCircle}>
              <Ionicons name="book" size={22} color={Colors.studentPrimary} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Literaku</Text>
              <Text style={styles.headerSubtitle}>Hi, Andi</Text>
            </View>
          </View>
          <Pressable
            style={styles.settingsButton}
            onPress={() => router.push("/student/settings")}
            accessibilityRole="button"
            accessibilityLabel="Settings"
            accessibilityHint="Double tap to open settings for voice, language, and display preferences"
          >
            <Ionicons name="settings-outline" size={26} color={Colors.textSecondary} />
          </Pressable>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.voicePromptSection}>
            <View style={styles.voicePromptIcon}>
              <Ionicons name="chevron-back" size={24} color={Colors.studentPrimary} />
              <Ionicons name="mic" size={36} color={Colors.studentPrimary} />
            </View>
            <Text style={styles.voicePromptTitle}>What would you like to read?</Text>
            <Text style={styles.voicePromptSubtext}>
              Swipe left and speak naturally, or tap below
            </Text>
          </View>

          {lastRead && (
            <View>
              <Text style={styles.sectionTitle} accessibilityRole="header">Continue Reading</Text>
              <Pressable
                style={({ pressed }) => [styles.continueCard, { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
                onPress={() => router.push({ pathname: "/student/reader/[id]", params: { id: lastRead.bookId } })}
                accessibilityRole="button"
                accessibilityLabel={`Continue reading ${lastRead.title}. Page ${lastRead.lastPage} of ${lastRead.totalPages}. Last read ${lastRead.timestamp}`}
                accessibilityHint="Double tap to resume reading this book"
              >
                <View style={styles.continueIcon}>
                  <Ionicons name="book" size={32} color={Colors.studentPrimary} />
                </View>
                <View style={styles.continueInfo}>
                  <Text style={styles.continueTitle} numberOfLines={1}>{lastRead.title}</Text>
                  <Text style={styles.continueProgress}>Page {lastRead.lastPage} of {lastRead.totalPages}</Text>
                  <Text style={styles.continueTime}>{lastRead.timestamp}</Text>
                </View>
                <View style={styles.playCircle}>
                  <Ionicons name="play" size={28} color="#FFFFFF" />
                </View>
              </Pressable>
            </View>
          )}

          <Text style={styles.sectionTitle} accessibilityRole="header">Quick Actions</Text>

          <Pressable
            style={({ pressed }) => [styles.actionButton, styles.libraryAction, { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
            onPress={() => router.push("/student/library")}
            accessibilityRole="button"
            accessibilityLabel="Open my library. View all your assigned books"
            accessibilityHint="Double tap to browse all your assigned books"
          >
            <Ionicons name="library" size={36} color="#FFFFFF" />
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>My Library</Text>
              <Text style={styles.actionSubtitle}>View all your books</Text>
            </View>
            <Ionicons name="chevron-forward" size={28} color="rgba(255,255,255,0.7)" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.actionButton, styles.guideAction, { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
            onPress={() => router.push("/student/guide")}
            accessibilityRole="button"
            accessibilityLabel="Voice guide. Learn how to use voice commands with AI"
            accessibilityHint="Double tap to see how to use voice commands"
          >
            <Ionicons name="mic" size={36} color="#FFFFFF" />
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Voice Guide</Text>
              <Text style={styles.actionSubtitle}>AI-powered voice help</Text>
            </View>
            <Ionicons name="chevron-forward" size={28} color="rgba(255,255,255,0.7)" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.actionButton, styles.settingsAction, { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
            onPress={() => router.push("/student/settings")}
            accessibilityRole="button"
            accessibilityLabel="Settings. Adjust voice, speed, language, and display preferences"
            accessibilityHint="Double tap to open settings"
          >
            <Ionicons name="settings" size={36} color="#FFFFFF" />
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Settings</Text>
              <Text style={styles.actionSubtitle}>Voice, speed & display</Text>
            </View>
            <Ionicons name="chevron-forward" size={28} color="rgba(255,255,255,0.7)" />
          </Pressable>
        </ScrollView>

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
    backgroundColor: Colors.successLight,
    borderWidth: 2,
    borderColor: Colors.studentPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: Colors.text,
  },
  headerSubtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
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
    gap: 16,
  },
  voicePromptSection: {
    alignItems: "center",
    backgroundColor: Colors.successLight,
    borderRadius: 20,
    padding: 28,
    gap: 12,
    borderWidth: 2,
    borderColor: Colors.studentPrimary,
  },
  voicePromptIcon: {
    flexDirection: "row",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.studentPrimary,
    gap: -6,
  },
  voicePromptTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: Colors.text,
    textAlign: "center",
    lineHeight: 32,
  },
  voicePromptSubtext: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.text,
    marginTop: 4,
  },
  continueCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    gap: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    minHeight: 100,
  },
  continueIcon: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: Colors.successLight,
    alignItems: "center",
    justifyContent: "center",
  },
  continueInfo: {
    flex: 1,
    gap: 4,
  },
  continueTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.text,
  },
  continueProgress: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.studentPrimary,
  },
  continueTime: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
  },
  playCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.studentPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 22,
    gap: 16,
    minHeight: 84,
  },
  libraryAction: {
    backgroundColor: Colors.studentPrimary,
  },
  guideAction: {
    backgroundColor: Colors.primaryLight,
  },
  settingsAction: {
    backgroundColor: "#5C6BC0",
  },
  actionInfo: {
    flex: 1,
    gap: 2,
  },
  actionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: "#FFFFFF",
  },
  actionSubtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: "rgba(255,255,255,0.8)",
  },
});
