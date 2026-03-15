import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  AccessibilityInfo,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import SwipeHintBar from "@/components/SwipeHintBar";
import SwipeVoiceWrapper from "@/components/SwipeVoiceWrapper";
import { sampleBooks, formatRupiah, voiceHints, type Book } from "@/constants/data";
import { useReadingPreferences } from "@/contexts/ReadingPreferences";

function BookListItem({ book }: { book: Book }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.bookCard,
        { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
      onPress={() => router.push({ pathname: "/student/book/[id]", params: { id: book.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${book.title} oleh ${book.author}. ${book.genre}. ${formatRupiah(book.price)}${book.owned ? ". Sudah dimiliki" : ""}`}
      accessibilityHint="Double tap to view book details"
    >
      <View style={[styles.bookCover, { backgroundColor: book.coverColor }]}>
        <Ionicons name="book" size={28} color="#FFFFFF" />
      </View>
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>{book.author}</Text>
        <Text style={styles.bookGenre}>{book.genre}</Text>
        {book.owned ? (
          <View style={styles.ownedBadge}>
            <Text style={styles.ownedText}>Dimiliki</Text>
          </View>
        ) : (
          <Text style={styles.bookPrice}>{formatRupiah(book.price)}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={24} color={Colors.borderStrong} />
    </Pressable>
  );
}

export default function PenjelajahScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;
  const { isVoiceOnly } = useReadingPreferences();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBooks = sampleBooks.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.genre.toLowerCase().includes(q)
    );
  });

  React.useEffect(() => {
    AccessibilityInfo.announceForAccessibility(
      `Penjelajah buku. ${sampleBooks.length} buku tersedia. Gunakan pencarian atau pilih buku.`
    );
  }, []);

  return (
    <SwipeVoiceWrapper>
      <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
        <StatusBar style="dark" />

        <View style={[styles.freezeZone, isVoiceOnly && styles.frozen, { pointerEvents: isVoiceOnly ? 'none' : 'auto' }]}>
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Kembali ke beranda"
              accessibilityHint="Double tap to go back to home"
            >
              <Feather name="arrow-left" size={28} color={Colors.text} />
            </Pressable>
            <Text style={styles.headerTitle} accessibilityRole="header">Penjelajah</Text>
            <View style={{ width: 48 }} />
          </View>

          <View style={styles.searchRow}>
            <Ionicons name="search" size={22} color={Colors.borderStrong} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari buku..."
              placeholderTextColor={Colors.borderStrong}
              value={searchQuery}
              onChangeText={setSearchQuery}
              accessibilityLabel="Search books"
              accessibilityHint="Type to search books by title, author, or genre"
            />
            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => setSearchQuery("")}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
              >
                <Ionicons name="close-circle" size={22} color={Colors.borderStrong} />
              </Pressable>
            )}
          </View>

          <FlatList
            data={filteredBooks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <BookListItem book={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={64} color={Colors.textSecondary} />
                <Text style={styles.emptyText}>Tidak ada buku ditemukan</Text>
              </View>
            }
          />
        </View>

        <SwipeHintBar hints={voiceHints.penjelajah} />
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
    width: 48,
    height: 48,
    borderRadius: 24,
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    minHeight: 56,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.text,
    paddingVertical: 14,
  },
  listContent: {
    paddingBottom: 8,
    gap: 12,
  },
  bookCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    gap: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    minHeight: 100,
  },
  bookCover: {
    width: 64,
    height: 80,
    borderRadius: 10,
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
  },
  bookAuthor: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
  },
  bookGenre: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: Colors.primaryLight,
  },
  bookPrice: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.studentPrimary,
  },
  ownedBadge: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  ownedText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.studentPrimary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.textSecondary,
  },
  freezeZone: {
    flex: 1,
  },
  frozen: {
    opacity: 0.5,
  },
});
