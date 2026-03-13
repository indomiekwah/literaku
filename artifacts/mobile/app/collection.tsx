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
import { sampleBooks, type Book } from "@/constants/data";

const bookColors = ["#E3F2FD", "#FFF3E0", "#E8F5E9", "#F3E5F5", "#FFEBEE"];

function BookCard({ book, index }: { book: Book; index: number }) {
  const bgColor = bookColors[index % bookColors.length];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.bookCard,
        { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
      onPress={() =>
        router.push({ pathname: "/reader/[id]", params: { id: book.id } })
      }
      accessibilityRole="button"
      accessibilityLabel={`Read ${book.title} by ${book.author}`}
    >
      <View style={[styles.bookCover, { backgroundColor: bgColor }]}>
        <Ionicons name="book" size={36} color={Colors.primary} />
      </View>
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.bookAuthor}>{book.author}</Text>
      </View>
      <View style={styles.chevronCircle}>
        <Feather name="chevron-right" size={28} color={Colors.primary} />
      </View>
    </Pressable>
  );
}

export default function CollectionScreen() {
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
        <View style={styles.headerCenter}>
          <View style={styles.headerLogoCircle}>
            <Ionicons name="globe-outline" size={18} color={Colors.primary} />
          </View>
          <Text style={styles.headerBrand}>Literaku</Text>
        </View>
        <View style={{ width: 56 }} />
      </View>

      <Text style={styles.pageTitle}>Collection</Text>

      <FlatList
        data={sampleBooks}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <BookCard book={item} index={index} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={sampleBooks.length > 0}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="library-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>No books in collection</Text>
          </View>
        }
      />

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
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerLogoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBrand: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.primary,
  },
  pageTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 30,
    color: Colors.primary,
    textAlign: "center",
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 12,
    gap: 14,
  },
  bookCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 18,
    padding: 18,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: 16,
    minHeight: 100,
  },
  bookCover: {
    width: 68,
    height: 80,
    borderRadius: 12,
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
  bookAuthor: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.textSecondary,
  },
  chevronCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.textSecondary,
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
