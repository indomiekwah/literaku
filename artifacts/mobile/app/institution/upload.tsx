import { Feather, Ionicons } from "@expo/vector-icons";
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

export default function InstitutionUploadScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");

  React.useEffect(() => {
    AccessibilityInfo.announceForAccessibility(
      "Upload book. Fill in the book details and upload a file."
    );
  }, []);

  const handleUpload = () => {
    if (!title.trim() || !author.trim()) {
      AccessibilityInfo.announceForAccessibility(
        "Please fill in both book title and author name"
      );
      return;
    }
    AccessibilityInfo.announceForAccessibility("Uploading book. Please wait...");
    setTimeout(() => {
      AccessibilityInfo.announceForAccessibility("Upload complete. Book added to catalog.");
      router.back();
    }, 500);
  };

  return (
    <SwipeVoiceWrapper>
      <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
        <StatusBar style="dark" />

        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Double tap to return to previous screen"
          >
            <Feather name="arrow-left" size={32} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle} accessibilityRole="header">Upload Book</Text>
          <View style={{ width: 56 }} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Pressable
            style={styles.uploadArea}
            onPress={() => {}}
            accessibilityRole="button"
            accessibilityLabel="Tap to select book file for upload"
            accessibilityHint="Double tap to open file picker and choose a book file"
          >
            <View style={styles.uploadIconCircle}>
              <Ionicons name="cloud-upload" size={48} color={Colors.institutionPrimary} />
            </View>
            <Text style={styles.uploadTitle}>Tap to upload book file</Text>
            <Text style={styles.uploadSubtext}>Supports PDF, EPUB, DOCX</Text>
          </Pressable>

          <View style={styles.form}>
            <View
              style={styles.inputGroup}
              accessible
              accessibilityLabel="Book title input field"
            >
              <Text style={styles.inputLabel}>Book Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter book title"
                placeholderTextColor={Colors.borderStrong}
                value={title}
                onChangeText={setTitle}
                accessibilityLabel="Book title"
                accessibilityHint="Type the title of the book here"
              />
            </View>

            <View
              style={styles.inputGroup}
              accessible
              accessibilityLabel="Author name input field"
            >
              <Text style={styles.inputLabel}>Author</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter author name"
                placeholderTextColor={Colors.borderStrong}
                value={author}
                onChangeText={setAuthor}
                accessibilityLabel="Author name"
                accessibilityHint="Type the author's name here"
              />
            </View>

            <View
              style={styles.inputGroup}
              accessible
              accessibilityLabel="ISBN input field, optional"
            >
              <Text style={styles.inputLabel}>ISBN (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="978-xxx-xxxx-xx-x"
                placeholderTextColor={Colors.borderStrong}
                value={isbn}
                onChangeText={setIsbn}
                accessibilityLabel="ISBN number"
                accessibilityHint="Type the ISBN number if available"
              />
            </View>

            <View style={styles.pipelineInfo}>
              <Ionicons name="information-circle" size={24} color={Colors.primaryLight} />
              <Text style={styles.pipelineText}>
                After upload, the book will be automatically converted to accessible format for voice-first reading.
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [styles.submitButton, { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
              onPress={handleUpload}
              accessibilityRole="button"
              accessibilityLabel="Upload book and start conversion"
              accessibilityHint="Double tap to upload the book and begin accessible format conversion"
            >
              <Ionicons name="cloud-upload" size={28} color="#FFFFFF" />
              <Text style={styles.submitText}>Upload & Convert</Text>
            </Pressable>
          </View>
        </ScrollView>

        <SwipeHintBar hints={voiceHints.institutionUpload} />
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
    fontSize: 18,
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
    fontSize: 18,
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
    fontSize: 18,
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
