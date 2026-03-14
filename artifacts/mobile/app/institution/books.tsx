import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  FlatList,
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
import { sampleBooks, voiceHints, type CatalogBook, type ConversionStatus } from "@/constants/data";

function getStatusColor(status: ConversionStatus) {
  switch (status) {
    case "ready": return Colors.success;
    case "processing": return Colors.processingBadge;
    case "pending": return Colors.pendingBadge;
    case "error": return Colors.error;
  }
}

function getStatusBg(status: ConversionStatus) {
  switch (status) {
    case "ready": return Colors.successLight;
    case "processing": return Colors.warningLight;
    case "pending": return "#E8EAF6";
    case "error": return Colors.errorLight;
  }
}

function getStatusLabel(status: ConversionStatus) {
  switch (status) {
    case "ready": return "Ready";
    case "processing": return "Processing";
    case "pending": return "Pending";
    case "error": return "Error";
  }
}

function BookRow({ book }: { book: CatalogBook }) {
  return (
    <View
      style={styles.bookRow}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${book.title} by ${book.author}. Status: ${getStatusLabel(book.conversionStatus)}. Assigned to ${book.assignedTo.length} students.`}
    >
      <View style={[styles.bookIcon, { backgroundColor: getStatusBg(book.conversionStatus) }]}>
        <Ionicons name="book" size={28} color={getStatusColor(book.conversionStatus)} />
      </View>
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
        <Text style={styles.bookAuthor}>{book.author}</Text>
        <View style={styles.bookMeta}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusBg(book.conversionStatus) }]}>
            <Text style={[styles.statusText, { color: getStatusColor(book.conversionStatus) }]}>
              {getStatusLabel(book.conversionStatus)}
            </Text>
          </View>
          <Text style={styles.assignedText}>{book.assignedTo.length} students</Text>
        </View>
      </View>
    </View>
  );
}

export default function InstitutionBooksScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;

  return (
    <SwipeVoiceWrapper>
      <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
        <StatusBar style="dark" />

        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back to dashboard"
            accessibilityHint="Double tap to return to institution dashboard"
          >
            <Feather name="arrow-left" size={32} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle} accessibilityRole="header">Book Catalog</Text>
          <Pressable
            style={styles.addButton}
            onPress={() => router.push("/institution/upload")}
            accessibilityRole="button"
            accessibilityLabel="Upload new book"
            accessibilityHint="Double tap to open the book upload form"
          >
            <Ionicons name="add" size={30} color="#FFFFFF" />
          </Pressable>
        </View>

        <FlatList
          data={sampleBooks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <BookRow book={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={sampleBooks.length > 0}
        />

        <SwipeHintBar hints={voiceHints.institutionBooks} />
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
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.institutionPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingBottom: 8,
    gap: 12,
  },
  bookRow: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    minHeight: 100,
    alignItems: "center",
  },
  bookIcon: {
    width: 60,
    height: 60,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  bookInfo: {
    flex: 1,
    gap: 4,
  },
  bookTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.text,
    lineHeight: 24,
  },
  bookAuthor: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
  },
  bookMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  assignedText: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
  },
});
