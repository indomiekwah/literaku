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
import VoiceCommandBar from "@/components/VoiceCommandBar";
import { sampleBooks, type CatalogBook, type DaisyStatus } from "@/constants/data";

function getStatusColor(status: DaisyStatus) {
  switch (status) {
    case "ready": return Colors.success;
    case "processing": return Colors.processingBadge;
    case "pending": return Colors.pendingBadge;
    case "error": return Colors.error;
  }
}

function getStatusBg(status: DaisyStatus) {
  switch (status) {
    case "ready": return Colors.successLight;
    case "processing": return Colors.warningLight;
    case "pending": return "#E8EAF6";
    case "error": return Colors.errorLight;
  }
}

function getStatusLabel(status: DaisyStatus) {
  switch (status) {
    case "ready": return "DAISY Ready";
    case "processing": return "Processing";
    case "pending": return "Pending";
    case "error": return "Error";
  }
}

function BookRow({ book }: { book: CatalogBook }) {
  return (
    <View
      style={styles.bookRow}
      accessibilityRole="text"
      accessibilityLabel={`${book.title} by ${book.author}. Status: ${getStatusLabel(book.daisyStatus)}. Assigned to ${book.assignedTo.length} students.`}
    >
      <View style={[styles.bookIcon, { backgroundColor: getStatusBg(book.daisyStatus) }]}>
        <Ionicons name="book" size={28} color={getStatusColor(book.daisyStatus)} />
      </View>
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
        <Text style={styles.bookAuthor}>{book.author}</Text>
        <View style={styles.bookMeta}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusBg(book.daisyStatus) }]}>
            <Text style={[styles.statusText, { color: getStatusColor(book.daisyStatus) }]}>
              {getStatusLabel(book.daisyStatus)}
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
    <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back to dashboard">
          <Feather name="arrow-left" size={32} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} accessibilityRole="header">Book Catalog</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => router.push("/institution/upload")}
          accessibilityRole="button"
          accessibilityLabel="Upload new book"
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
  },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
    fontSize: 17,
    color: Colors.text,
    lineHeight: 24,
  },
  bookAuthor: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
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
    fontSize: 12,
  },
  assignedText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
