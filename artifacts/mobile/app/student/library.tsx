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
import { sampleBooks, voiceCommands, type CatalogBook } from "@/constants/data";

const bookColors = ["#E3F2FD", "#E8F5E9", "#FFF3E0", "#F3E5F5", "#FFEBEE"];

function BookCard({ book, index }: { book: CatalogBook; index: number }) {
  const bgColor = bookColors[index % bookColors.length];
  const isReady = book.daisyStatus === "ready";

  return (
    <Pressable
      style={({ pressed }) => [
        styles.bookCard,
        { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
      onPress={() => {
        if (isReady) {
          router.push({ pathname: "/student/reader/[id]", params: { id: book.id } });
        }
      }}
      disabled={!isReady}
      accessibilityRole="button"
      accessibilityLabel={`${book.title} by ${book.author}. ${isReady ? "Ready to read. Double tap to open" : "Not yet available. DAISY conversion in progress"}`}
    >
      <View style={[styles.bookCover, { backgroundColor: bgColor }]}>
        <Ionicons name="book" size={36} color={isReady ? Colors.studentPrimary : Colors.borderStrong} />
      </View>
      <View style={styles.bookInfo}>
        <Text style={[styles.bookTitle, !isReady && styles.bookTitleDisabled]} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.bookAuthor}>{book.author}</Text>
        {!isReady && (
          <View style={styles.notReadyBadge}>
            <Text style={styles.notReadyText}>Converting...</Text>
          </View>
        )}
      </View>
      {isReady && (
        <View style={styles.playCircle}>
          <Ionicons name="play" size={28} color="#FFFFFF" />
        </View>
      )}
    </Pressable>
  );
}

export default function StudentLibraryScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;

  const assignedBooks = sampleBooks.filter(b => b.assignedTo.includes("s1"));

  return (
    <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back to home">
          <Feather name="arrow-left" size={32} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} accessibilityRole="header">My Library</Text>
        <View style={{ width: 56 }} />
      </View>

      <Text style={styles.bookCount} accessibilityLabel={`${assignedBooks.length} books assigned to you`}>
        {assignedBooks.length} books available
      </Text>

      <FlatList
        data={assignedBooks}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <BookCard book={item} index={index} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={assignedBooks.length > 0}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="library-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>No books assigned yet</Text>
            <Text style={styles.emptySubtext}>Ask your institution to assign books</Text>
          </View>
        }
      />

      <VoiceCommandBar
        hints={voiceCommands.studentLibrary}
        onHelpPress={() => router.push("/student/guide")}
      />
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
  bookCount: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 8,
    gap: 14,
  },
  bookCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    gap: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    minHeight: 110,
  },
  bookCover: {
    width: 70,
    height: 84,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  bookInfo: {
    flex: 1,
    gap: 6,
  },
  bookTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 19,
    color: Colors.text,
    lineHeight: 26,
  },
  bookTitleDisabled: {
    color: Colors.textSecondary,
  },
  bookAuthor: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: Colors.textSecondary,
  },
  notReadyBadge: {
    backgroundColor: Colors.warningLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  notReadyText: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    color: Colors.warning,
  },
  playCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.studentPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.textSecondary,
  },
  emptySubtext: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
