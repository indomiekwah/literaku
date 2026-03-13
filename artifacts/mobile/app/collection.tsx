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
        { opacity: pressed ? 0.85 : 1 },
      ]}
      onPress={() =>
        router.push({ pathname: "/reader/[id]", params: { id: book.id } })
      }
    >
      <View style={[styles.bookCover, { backgroundColor: bgColor }]}>
        <Ionicons name="book" size={24} color={Colors.primary} />
      </View>
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.bookAuthor}>{book.author}</Text>
      </View>
      <Feather name="chevron-right" size={20} color={Colors.textSecondary} />
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
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={Colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <View style={styles.headerLogoCircle}>
            <Ionicons name="globe-outline" size={14} color={Colors.primary} />
          </View>
          <Text style={styles.headerBrand}>Literaku</Text>
        </View>
        <View style={{ width: 36 }} />
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
            <Ionicons name="library-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>No books in collection</Text>
          </View>
        }
      />

      <View style={styles.bottomBar}>
        <View style={styles.micContainer}>
          <Ionicons name="mic" size={22} color={Colors.primary} />
        </View>
        <Text style={styles.listeningText}>Listening...</Text>
        <View style={styles.helpButton}>
          <Ionicons name="help-circle" size={28} color={Colors.historyButton} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerLogoCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBrand: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.primary,
  },
  pageTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: Colors.primary,
    textAlign: "center",
    marginBottom: 20,
  },
  listContent: {
    paddingBottom: 12,
    gap: 12,
  },
  bookCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  bookCover: {
    width: 52,
    height: 64,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  bookInfo: {
    flex: 1,
    gap: 4,
  },
  bookTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  bookAuthor: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: Colors.textSecondary,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 10,
  },
  micContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  listeningText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  helpButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});
