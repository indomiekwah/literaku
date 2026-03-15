import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
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
import { sampleBooks, sampleStudents, sampleInstitution, voiceHints } from "@/constants/data";
import { useReadingPreferences } from "@/contexts/ReadingPreferences";

export default function InstitutionDashboardScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;
  const { isVoiceOnly } = useReadingPreferences();

  React.useEffect(() => {
    AccessibilityInfo.announceForAccessibility(
      "Institution dashboard. Manage your book catalog, conversions, and student assignments."
    );
  }, []);

  const readyCount = sampleBooks.filter(b => b.conversionStatus === "ready").length;
  const processingCount = sampleBooks.filter(b => b.conversionStatus === "processing" || b.conversionStatus === "pending").length;

  return (
    <SwipeVoiceWrapper>
      <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
        <StatusBar style="dark" />

        <View pointerEvents={isVoiceOnly ? 'none' : 'auto'} style={[styles.freezeZone, isVoiceOnly && styles.frozen]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoCircle}>
              <Ionicons name="business" size={22} color={Colors.institutionPrimary} />
            </View>
            <View>
              <Text style={styles.headerTitle} accessibilityRole="header">Dashboard</Text>
              <Text style={styles.headerSubtitle}>{sampleInstitution.name}</Text>
            </View>
          </View>
          <Pressable
            style={styles.logoutButton}
            onPress={() => router.replace("/")}
            accessibilityRole="button"
            accessibilityLabel="Log out"
            accessibilityHint="Double tap to sign out and return to role selection"
          >
            <Feather name="log-out" size={24} color={Colors.error} />
          </Pressable>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.statsRow}>
            <View
              style={[styles.statCard, { backgroundColor: Colors.voiceBarBg }]}
              accessible
              accessibilityRole="text"
              accessibilityLabel={`Total Books: ${sampleBooks.length}`}
            >
              <Ionicons name="book" size={32} color={Colors.institutionPrimary} />
              <Text style={styles.statNumber}>{sampleBooks.length}</Text>
              <Text style={styles.statLabel}>Total Books</Text>
            </View>
            <View
              style={[styles.statCard, { backgroundColor: Colors.successLight }]}
              accessible
              accessibilityRole="text"
              accessibilityLabel={`Converted: ${readyCount}`}
            >
              <Ionicons name="checkmark-circle" size={32} color={Colors.success} />
              <Text style={styles.statNumber}>{readyCount}</Text>
              <Text style={styles.statLabel}>Converted</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View
              style={[styles.statCard, { backgroundColor: Colors.warningLight }]}
              accessible
              accessibilityRole="text"
              accessibilityLabel={`Processing: ${processingCount}`}
            >
              <MaterialIcons name="pending" size={32} color={Colors.warning} />
              <Text style={styles.statNumber}>{processingCount}</Text>
              <Text style={styles.statLabel}>Processing</Text>
            </View>
            <View
              style={[styles.statCard, { backgroundColor: "#F3E5F5" }]}
              accessible
              accessibilityRole="text"
              accessibilityLabel={`Students: ${sampleStudents.length}`}
            >
              <Ionicons name="people" size={32} color="#7B1FA2" />
              <Text style={styles.statNumber}>{sampleStudents.length}</Text>
              <Text style={styles.statLabel}>Students</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle} accessibilityRole="header">Quick Actions</Text>

          <Pressable
            style={({ pressed }) => [styles.actionButton, styles.actionUpload, { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
            onPress={() => router.push("/institution/upload")}
            accessibilityRole="button"
            accessibilityLabel="Upload new book to catalog"
            accessibilityHint="Double tap to open the book upload form"
          >
            <Ionicons name="cloud-upload" size={36} color="#FFFFFF" />
            <Text style={styles.actionText}>Upload New Book</Text>
            <Ionicons name="chevron-forward" size={28} color="rgba(255,255,255,0.7)" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.actionButton, styles.actionBooks, { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
            onPress={() => router.push("/institution/books")}
            accessibilityRole="button"
            accessibilityLabel="View and manage book catalog"
            accessibilityHint="Double tap to browse all books and their conversion status"
          >
            <Ionicons name="library" size={36} color="#FFFFFF" />
            <Text style={styles.actionText}>Book Catalog</Text>
            <Ionicons name="chevron-forward" size={28} color="rgba(255,255,255,0.7)" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.actionButton, styles.actionAssign, { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
            onPress={() => router.push("/institution/assign")}
            accessibilityRole="button"
            accessibilityLabel="Assign books to students"
            accessibilityHint="Double tap to manage which books are assigned to which students"
          >
            <Ionicons name="people" size={36} color="#FFFFFF" />
            <Text style={styles.actionText}>Assign to Students</Text>
            <Ionicons name="chevron-forward" size={28} color="rgba(255,255,255,0.7)" />
          </Pressable>
        </ScrollView>
        </View>

        <SwipeHintBar hints={voiceHints.institutionDashboard} />
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
    borderColor: Colors.institutionPrimary,
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
  logoutButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.errorLight,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 8,
    gap: 14,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    gap: 8,
    minHeight: 110,
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  statNumber: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: Colors.text,
  },
  statLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: Colors.text,
    marginTop: 8,
    marginBottom: 2,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 22,
    gap: 16,
    minHeight: 80,
  },
  actionUpload: {
    backgroundColor: Colors.institutionPrimary,
  },
  actionBooks: {
    backgroundColor: Colors.primaryLight,
  },
  actionAssign: {
    backgroundColor: "#5C6BC0",
  },
  actionText: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: "#FFFFFF",
    flex: 1,
  },
  freezeZone: {
    flex: 1,
  },
  frozen: {
    opacity: 0.5,
  },
});
