import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useMemo } from "react";
import {
  AccessibilityInfo,
  FlatList,
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
import { sampleBooks, voiceHints, type Book } from "@/constants/data";
import { useReadingPreferences } from "@/contexts/ReadingPreferences";
import { useVoiceActivation } from "@/contexts/VoiceActivation";
import { useT } from "@/hooks/useTranslation";
import { useTTSAnnounce } from "@/hooks/useTTSAnnounce";
import { speakText } from "@/services/speech";
import type { VoiceIntent } from "@/services/voiceRouter";

const GENRE_COLORS: Record<string, string> = {
  "Psychological": "#7B1FA2",
  "Drama": "#C62828",
  "Historical": "#4E342E",
  "Magical Realism": "#AD1457",
  "Philosophical Fiction": "#283593",
  "Romance": "#D81B60",
  "Sci-Fi": "#00695C",
};

const GENRE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  "Psychological": "eye",
  "Drama": "heart",
  "Historical": "time",
  "Magical Realism": "sparkles",
  "Philosophical Fiction": "bulb",
  "Romance": "rose",
  "Sci-Fi": "rocket",
};

function GenreBookCard({ book, t }: { book: Book; t: ReturnType<typeof useT> }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.genreBookCard,
        { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
      onPress={() => router.push({ pathname: "/student/book/[id]", params: { id: book.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${book.title} ${t.explorer.byAuthor} ${book.author}. ${t.explorer.freePreview}`}
      accessibilityHint="Double tap to view book details"
    >
      <View style={[styles.genreBookCover, { backgroundColor: book.coverColor }]}>
        <Ionicons name="book" size={24} color="#FFFFFF" />
      </View>
      <Text style={styles.genreBookTitle} numberOfLines={2}>{book.title}</Text>
      <Text style={styles.genreBookAuthor} numberOfLines={1}>{book.author}</Text>
    </Pressable>
  );
}

function SearchBookItem({ book, t }: { book: Book; t: ReturnType<typeof useT> }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.searchBookCard,
        { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
      onPress={() => router.push({ pathname: "/student/book/[id]", params: { id: book.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${book.title} ${t.explorer.byAuthor} ${book.author}. ${book.genre}. ${t.explorer.freePreview}`}
      accessibilityHint="Double tap to view book details"
    >
      <View style={[styles.searchBookCover, { backgroundColor: book.coverColor }]}>
        <Ionicons name="book" size={28} color="#FFFFFF" />
      </View>
      <View style={styles.searchBookInfo}>
        <Text style={styles.searchBookTitle} numberOfLines={1}>{book.title}</Text>
        <Text style={styles.searchBookAuthor} numberOfLines={1}>{book.author}</Text>
        <Text style={styles.searchBookGenre}>{book.genre}</Text>
        <View style={styles.previewBadge}>
          <Ionicons name="eye-outline" size={14} color={Colors.primaryLight} />
          <Text style={styles.previewText}>{t.explorer.freePreview}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color={Colors.borderStrong} />
    </Pressable>
  );
}

function getGenreGroups(books: Book[]) {
  const map = new Map<string, Book[]>();
  for (const book of books) {
    const existing = map.get(book.genre);
    if (existing) {
      existing.push(book);
    } else {
      map.set(book.genre, [book]);
    }
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([genre, data]) => ({ genre, data }));
}

function normalizeGenreQuery(s: string): string {
  return s.replace(/[-_]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
}

function findGenreMatch(query: string): string | null {
  const q = normalizeGenreQuery(query.replace(/\b(books?|buku|kategori|category)\b/gi, ""));
  if (!q) return null;
  const genres = [...new Set(sampleBooks.map((b) => b.genre))];
  const exact = genres.find((g) => normalizeGenreQuery(g) === q);
  if (exact) return exact;
  const partial = genres.find((g) => normalizeGenreQuery(g).includes(q) || q.includes(normalizeGenreQuery(g)));
  return partial ?? null;
}

export default function PenjelajahScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;
  const { isVoiceOnly, selectedVoice } = useReadingPreferences();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const t = useT();

  const genreGroups = useMemo(() => getGenreGroups(sampleBooks), []);
  const genreNames = useMemo(() => genreGroups.map((g) => g.genre), [genreGroups]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.replace(/[.,!?'";\-:()]/g, "").trim().toLowerCase();
    if (!q) return [];
    const clean = (s: string) => s.replace(/[.,!?'";\-:()]/g, "").toLowerCase();
    return sampleBooks.filter(
      (b) => clean(b.title).includes(q) || clean(b.author).includes(q) || clean(b.genre).includes(q)
    );
  }, [searchQuery]);

  const { onTranscription, clearTranscriptionCallback } = useVoiceActivation();

  const categoriesText = genreNames.join(", ");
  useTTSAnnounce(t.explorer.mountAnnounce(sampleBooks.length) + " " + t.explorer.categoriesAnnounce(categoriesText));

  useEffect(() => {
    onTranscription((_text: string, intent: VoiceIntent, param?: string) => {
      if (intent === "repeat_commands") {
        AccessibilityInfo.announceForAccessibility(t.explorer.pageCommands);
        speakText(t.explorer.pageCommands, selectedVoice, 1).catch(() => {});
        return true;
      }
      if (intent === "search_book" && param) {
        setSearchQuery(param);
        setIsSearching(true);
        const q = param.replace(/[.,!?'";\-:()]/g, "").trim().toLowerCase();
        const clean = (s: string) => s.replace(/[.,!?'";\-:()]/g, "").toLowerCase();
        const matches = sampleBooks.filter(
          (b) => clean(b.title).includes(q) || clean(b.author).includes(q) || clean(b.genre).includes(q)
        );
        if (matches.length > 0) {
          const titles = matches.map((b) => b.title).join(", ");
          const msg = t.explorer.searchResultsAnnounce(matches.length, titles);
          setTimeout(() => {
            AccessibilityInfo.announceForAccessibility(msg);
            speakText(msg, selectedVoice, 1).catch(() => {});
          }, 300);
        } else {
          const msg = t.explorer.noSearchResults(param);
          setTimeout(() => {
            AccessibilityInfo.announceForAccessibility(msg);
            speakText(msg, selectedVoice, 1).catch(() => {});
          }, 300);
        }
        return true;
      }
      if (intent === "browse_category" && param) {
        const genreMatch = findGenreMatch(param);
        if (genreMatch) {
          const booksInGenre = sampleBooks.filter((b) => b.genre === genreMatch);
          const titles = booksInGenre.map((b) => b.title).join(", ");
          const msg = t.explorer.categoryBooksAnnounce(genreMatch, booksInGenre.length, titles);
          AccessibilityInfo.announceForAccessibility(msg);
          speakText(msg, selectedVoice, 1).catch(() => {});
        } else {
          const msg = t.explorer.noSearchResults(param);
          AccessibilityInfo.announceForAccessibility(msg);
          speakText(msg, selectedVoice, 1).catch(() => {});
        }
        return true;
      }
      if (intent === "open_book" && param) {
        const cleanQ = param.replace(/[.,!?'";\-:()]/g, "").toLowerCase();
        const match = sampleBooks.find((b) =>
          b.title.replace(/[.,!?'";\-:()]/g, "").toLowerCase().includes(cleanQ)
        );
        if (match) {
          router.push({ pathname: "/student/book/[id]", params: { id: match.id } });
        } else {
          setSearchQuery(param);
          setIsSearching(true);
        }
        return true;
      }
      return false;
    });
    return () => clearTranscriptionCallback();
  }, [selectedVoice, t]);

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
  };

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
              accessibilityLabel={t.explorer.backA11yLabel}
              accessibilityHint="Double tap to go back to home"
            >
              <Feather name="arrow-left" size={28} color={Colors.text} />
            </Pressable>
            <Text style={styles.headerTitle} accessibilityRole="header">{t.explorer.title}</Text>
            <View style={{ width: 48 }} />
          </View>

          <View style={styles.searchRow}>
            <Ionicons name="search" size={22} color={Colors.borderStrong} />
            <TextInput
              style={styles.searchInput}
              placeholder={t.explorer.searchPlaceholder}
              placeholderTextColor={Colors.borderStrong}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setIsSearching(text.length > 0);
              }}
              accessibilityLabel="Search books"
              accessibilityHint="Type to search books by title, author, or genre"
            />
            {searchQuery.length > 0 && (
              <Pressable
                onPress={handleClearSearch}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
              >
                <Ionicons name="close-circle" size={22} color={Colors.borderStrong} />
              </Pressable>
            )}
          </View>

          {isSearching ? (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <SearchBookItem book={item} t={t} />}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                searchResults.length > 0 ? (
                  <Text style={styles.searchResultsHeader}>
                    {t.explorer.searchResultsCount(searchResults.length)}
                  </Text>
                ) : null
              }
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="search-outline" size={64} color={Colors.textSecondary} />
                  <Text style={styles.emptyText}>{t.explorer.noResults}</Text>
                </View>
              }
            />
          ) : (
            <ScrollView
              style={styles.catalogScroll}
              contentContainerStyle={styles.catalogContent}
              showsVerticalScrollIndicator={false}
            >
              {genreGroups.map((group) => (
                <View key={group.genre} style={styles.genreSection}>
                  <View style={styles.genreTitleRow}>
                    <View style={[styles.genreIconCircle, { backgroundColor: GENRE_COLORS[group.genre] || Colors.primaryLight }]}>
                      <Ionicons
                        name={GENRE_ICONS[group.genre] || "library"}
                        size={20}
                        color="#FFFFFF"
                      />
                    </View>
                    <Text
                      style={styles.genreTitle}
                      accessibilityRole="header"
                    >
                      {group.genre}
                    </Text>
                    <View style={styles.genreCountBadge}>
                      <Text style={styles.genreCountText}>{group.data.length}</Text>
                    </View>
                  </View>
                  <FlatList
                    horizontal
                    data={group.data}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.genreHorizontalList}
                    renderItem={({ item }) => <GenreBookCard book={item} t={t} />}
                  />
                </View>
              ))}
            </ScrollView>
          )}
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
  catalogScroll: {
    flex: 1,
  },
  catalogContent: {
    paddingBottom: 16,
    gap: 28,
  },
  genreSection: {
    gap: 12,
  },
  genreTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  genreIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  genreTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.text,
    flex: 1,
  },
  genreCountBadge: {
    backgroundColor: Colors.voiceBarBg,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  genreCountText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.textSecondary,
  },
  genreHorizontalList: {
    gap: 14,
    paddingRight: 4,
  },
  genreBookCard: {
    width: 120,
    gap: 6,
    alignItems: "center",
  },
  genreBookCover: {
    width: 100,
    height: 140,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  genreBookTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: Colors.text,
    textAlign: "center",
  },
  genreBookAuthor: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 8,
    gap: 12,
  },
  searchResultsHeader: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  searchBookCard: {
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
  searchBookCover: {
    width: 64,
    height: 80,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBookInfo: {
    flex: 1,
    gap: 4,
  },
  searchBookTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.text,
  },
  searchBookAuthor: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
  },
  searchBookGenre: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: Colors.primaryLight,
  },
  previewBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.voiceBarBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  previewText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.primaryLight,
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
