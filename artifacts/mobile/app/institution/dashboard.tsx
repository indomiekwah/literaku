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
import VoiceCommandBar from "@/components/VoiceCommandBar";
import { sampleBooks, sampleStudents, sampleInstitution, voiceCommands } from "@/constants/data";

export default function InstitutionDashboardScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;

  React.useEffect(() => {
    AccessibilityInfo.announceForAccessibility(
      "Institution dashboard. Manage your book catalog, DAISY conversions, and student assignments."
    );
  }, []);

  const readyCount = sampleBooks.filter(b => b.daisyStatus === "ready").length;
  const processingCount = sampleBooks.filter(b => b.daisyStatus === "processing" || b.daisyStatus === "pending").length;

  return (
    <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
      <StatusBar style="dark" />

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
        >
          <Feather name="log-out" size={24} color={Colors.error} />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: Colors.voiceBarBg }]}>
            <Ionicons name="book" size={32} color={Colors.institutionPrimary} />
            <Text style={styles.statNumber}>{sampleBooks.length}</Text>
            <Text style={styles.statLabel}>Total Books</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.successLight }]}>
            <Ionicons name="checkmark-circle" size={32} color={Colors.success} />
            <Text style={styles.statNumber}>{readyCount}</Text>
            <Text style={styles.statLabel}>DAISY Ready</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: Colors.warningLight }]}>
            <MaterialIcons name="pending" size={32} color={Colors.warning} />
            <Text style={styles.statNumber}>{processingCount}</Text>
            <Text style={styles.statLabel}>Processing</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#F3E5F5" }]}>
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
        >
          <Ionicons name="people" size={36} color="#FFFFFF" />
          <Text style={styles.actionText}>Assign to Students</Text>
          <Ionicons name="chevron-forward" size={28} color="rgba(255,255,255,0.7)" />
        </Pressable>
      </ScrollView>

      <VoiceCommandBar hints={voiceCommands.institutionDashboard} showHelpButton={false} />
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
});
