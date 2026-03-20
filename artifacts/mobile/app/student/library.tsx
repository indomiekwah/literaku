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
import { sampleBooks, sampleReadingProgress, voiceHints, type Book, type ReadingProgress } from "@/constants/data";
import { useReadingPreferences } from "@/contexts/ReadingPreferences";
import { useT } from "@/hooks/useTranslation";
import { useTTSAnnounce } from "@/hooks/useTTSAnnounce";

const savedBookIds = ["1", "2", "3", "5", "8", "11"];

function KoleksiBookCard({ book, progress, isSubscribed, t }: { book: Book; progress?: ReadingProgress; isSubscribed: boolean; t: ReturnType<typeof useT> }) {
  const progressPercent = progress
    ? Math.round((progress.currentPage / progress.totalPages) * 100)
    : 0;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.bookCard,
        { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
      onPress={() => router.push({ pathname: "/student/book/[id]", params: { id: book.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${book.title} by ${book.author}. ${book.genre}. ${progress ? `${t.collection.progress}: ${progressPercent}%. ${t.collection.lastRead} ${progress.lastRead}` : t.collection.notStarted}`}
      accessibilityHint="Double tap to open book details"
    >
      <View style={[styles.bookCover, { backgroundColor: book.coverColor }]}>
        <Ionicons name="book" size={28} color="#FFFFFF" />
      </View>
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>{book.author}</Text>
        <Text style={styles.bookGenre}>{book.genre}</Text>
        {progress ? (
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={styles.progressText}>{progressPercent}% · {progress.lastRead}</Text>
          </View>
        ) : (
          <Text style={styles.notStarted}>{t.collection.notStarted}</Text>
        )}
      </View>
      {isSubscribed ? (
        <View style={styles.playCircle}>
          <Ionicons name="play" size={22} color="#FFFFFF" />
        </View>
      ) : (
        <View style={styles.lockCircle}>
          <Ionicons name="lock-closed" size={20} color="#E65100" />
        </View>
      )}
    </Pressable>
  );
}

export default function KoleksiScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;
  const { isVoiceOnly, isSubscribed } = useReadingPreferences();
  const [searchQuery, setSearchQuery] = useState("");
  const t = useT();

  const collectionBooks = sampleBooks.filter((b) => savedBookIds.includes(b.id));
  const filteredBooks = collectionBooks.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
  });

  useTTSAnnounce(t.collection.mountAnnounce(collectionBooks.length));

  React.useEffect(() => {
    AccessibilityInfo.announceForAccessibility(t.collection.mountAnnounce(collectionBooks.length));
  }, [collectionBooks.length]);

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
              accessibilityLabel={t.collection.backA11yLabel}
              accessibilityHint="Double tap to go back to home"
            >
              <Feather name="arrow-left" size={28} color={Colors.text} />
            </Pressable>
            <Text style={styles.headerTitle} accessibilityRole="header">{t.collection.title}</Text>
            <View style={{ width: 48 }} />
          </View>

          <View style={styles.searchRow}>
            <Ionicons name="search" size={22} color={Colors.borderStrong} />
            <TextInput
              style={styles.searchInput}
              placeholder={t.collection.searchPlaceholder}
              placeholderTextColor={Colors.borderStrong}
              value={searchQuery}
              onChangeText={setSearchQuery}
              accessibilityLabel="Search collection"
              accessibilityHint="Type to search your book collection"
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

          <Text style={styles.bookCount} accessibilityLabel={t.collection.bookCountA11y(filteredBooks.length)}>
            {t.collection.bookCount(filteredBooks.length)}
          </Text>

          <FlatList
            data={filteredBooks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const progress = sampleReadingProgress.find((p) => p.bookId === item.id);
              return <KoleksiBookCard book={item} progress={progress} isSubscribed={isSubscribed} t={t} />;
            }}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="library-outline" size={64} color={Colors.textSecondary} />
                <Text style={styles.emptyText}>{t.collection.emptyTitle}</Text>
                <Text style={styles.emptySubtext}>{t.collection.emptySub}</Text>
              </View>
            }
          />
        </View>

        <SwipeHintBar
          hints={voiceHints.koleksi}
          showHelpButton
          onHelpPress={() => router.push("/student/guide")}
        />
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
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.text,
    paddingVertical: 14,
  },
  bookCount: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 8,
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
    width: 60,
    height: 78,
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
    fontSize: 16,
    color: Colors.textSecondary,
  },
  bookGenre: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.primaryLight,
  },
  progressSection: {
    gap: 4,
    marginTop: 2,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.studentPrimary,
    borderRadius: 3,
  },
  progressText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.studentPrimary,
  },
  notStarted: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.borderStrong,
  },
  playCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.studentPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  lockCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF3E0",
    borderWidth: 2,
    borderColor: "#E65100",
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
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  freezeZone: {
    flex: 1,
  },
  frozen: {
    opacity: 0.5,
  },
});
