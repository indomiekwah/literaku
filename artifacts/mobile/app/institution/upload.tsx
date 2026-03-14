import { Feather, Ionicons } from "@expo/vector-icons";
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
import VoiceCommandBar from "@/components/VoiceCommandBar";

export default function InstitutionUploadScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");

  const handleUpload = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back">
          <Feather name="arrow-left" size={32} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} accessibilityRole="header">Upload Book</Text>
        <View style={{ width: 56 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.uploadArea} onPress={() => {}} accessibilityRole="button" accessibilityLabel="Tap to select book file for upload">
          <View style={styles.uploadIconCircle}>
            <Ionicons name="cloud-upload" size={48} color={Colors.institutionPrimary} />
          </View>
          <Text style={styles.uploadTitle}>Tap to upload book file</Text>
          <Text style={styles.uploadSubtext}>Supports PDF, EPUB, DOCX</Text>
        </Pressable>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Book Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter book title"
              placeholderTextColor={Colors.borderStrong}
              value={title}
              onChangeText={setTitle}
              accessibilityLabel="Book title"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Author</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter author name"
              placeholderTextColor={Colors.borderStrong}
              value={author}
              onChangeText={setAuthor}
              accessibilityLabel="Author name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>ISBN (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="978-xxx-xxxx-xx-x"
              placeholderTextColor={Colors.borderStrong}
              value={isbn}
              onChangeText={setIsbn}
              accessibilityLabel="ISBN number"
            />
          </View>

          <View style={styles.pipelineInfo}>
            <Ionicons name="information-circle" size={24} color={Colors.primaryLight} />
            <Text style={styles.pipelineText}>
              After upload, the book will be automatically converted to DAISY format for accessible reading.
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.submitButton, { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
            onPress={handleUpload}
            accessibilityRole="button"
            accessibilityLabel="Upload book and start DAISY conversion"
          >
            <Ionicons name="cloud-upload" size={28} color="#FFFFFF" />
            <Text style={styles.submitText}>Upload & Convert</Text>
          </Pressable>
        </View>
      </ScrollView>

      <VoiceCommandBar showHelpButton={false} />
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
    fontSize: 24,
    color: Colors.text,
    flex: 1,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
    gap: 20,
  },
  uploadArea: {
    backgroundColor: Colors.voiceBarBg,
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: Colors.primaryLight,
    borderStyle: "dashed",
    padding: 30,
    alignItems: "center",
    gap: 12,
    minHeight: 160,
    justifyContent: "center",
  },
  uploadIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.institutionPrimary,
    textAlign: "center",
  },
  uploadSubtext: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: Colors.textSecondary,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.text,
  },
  input: {
    fontFamily: "Inter_500Medium",
    fontSize: 19,
    color: Colors.text,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    minHeight: 58,
  },
  pipelineInfo: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: Colors.voiceBarBg,
    borderRadius: 14,
    padding: 16,
    alignItems: "flex-start",
  },
  pipelineText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 22,
  },
  submitButton: {
    flexDirection: "row",
    backgroundColor: Colors.institutionPrimary,
    borderRadius: 18,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    minHeight: 72,
  },
  submitText: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: "#FFFFFF",
  },
});
