import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  AccessibilityInfo,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import SwipeHintBar from "@/components/SwipeHintBar";
import SwipeVoiceWrapper from "@/components/SwipeVoiceWrapper";
import { sampleBooks, sampleHistory, sampleBookmarks, voiceHints } from "@/constants/data";
import { useReadingPreferences } from "@/contexts/ReadingPreferences";
import { useVoiceActivation } from "@/contexts/VoiceActivation";
import { useT } from "@/hooks/useTranslation";
import { useTTSAnnounce } from "@/hooks/useTTSAnnounce";
import { speakText } from "@/services/speech";
import type { VoiceIntent } from "@/services/voiceRouter";
import { findBookByTitle } from "@/services/voiceRouter";

function RecentBookCard({ bookId, lastPage, totalPages, timestamp, t }: {
  bookId: string;
  lastPage: number;
  totalPages: number;
  timestamp: string;
  t: ReturnType<typeof useT>;
}) {
  const book = sampleBooks.find((b) => b.id === bookId);
  if (!book) return null;

  const progressPercent = Math.round((lastPage / totalPages) * 100);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.recentCard,
        { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
      onPress={() => router.push({ pathname: "/student/book/[id]", params: { id: book.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${book.title} by ${book.author}. ${t.history.progressLabel(progressPercent)}. ${timestamp}.`}
      accessibilityHint="Double tap to open book details"
    >
      <View style={[styles.bookCover, { backgroundColor: book.coverColor }]}>
        <Ionicons name="book" size={24} color="#FFFFFF" />
      </View>
      <View style={styles.recentInfo}>
        <Text style={styles.recentTitle} numberOfLines={1}>{book.title}</Text>
        <Text style={styles.recentAuthor} numberOfLines={1}>{book.author}</Text>
        <View style={styles.progressRow}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressText}>{progressPercent}%</Text>
        </View>
        <Text style={styles.timestamp}>{timestamp}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={Colors.textSecondary} />
    </Pressable>
  );
}

function BookmarkCard({ bookId, page, note }: { bookId: string; page: number; note?: string }) {
  const book = sampleBooks.find((b) => b.id === bookId);
  if (!book) return null;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.bookmarkCard,
        { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
      onPress={() => router.push({ pathname: "/student/book/[id]", params: { id: book.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${book.title}. Page ${page}.${note ? ` Note: ${note}` : ""}`}
      accessibilityHint="Double tap to open book details"
    >
      <View style={[styles.bookmarkCover, { backgroundColor: book.coverColor }]}>
        <Ionicons name="bookmark" size={20} color="#FFFFFF" />
      </View>
      <View style={styles.bookmarkInfo}>
        <Text style={styles.bookmarkTitle} numberOfLines={1}>{book.title}</Text>
        <Text style={styles.bookmarkMeta}>Page {page}{note ? ` · ${note}` : ""}</Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color={Colors.textSecondary} />
    </Pressable>
  );
}

function EmptySection({ icon, title, subtitle }: { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string }) {
  return (
    <View style={styles.emptySection}>
      <Ionicons name={icon} size={48} color={Colors.textSecondary} />
      <Text style={styles.emptySectionTitle}>{title}</Text>
      <Text style={styles.emptySectionSub}>{subtitle}</Text>
    </View>
  );
}

export default function RiwayatScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;
  const { isVoiceOnly, selectedVoice, isSubscribed } = useReadingPreferences();
  const { onTranscription, clearTranscriptionCallback } = useVoiceActivation();
  const t = useT();

  const recentBookIds = sampleHistory.map((h) => h.bookId);
  const bookmarkedBookIds = sampleBookmarks.map((b) => b.bookId);

  useTTSAnnounce(t.history.mountAnnounce);

  React.useEffect(() => {
    onTranscription((_text: string, intent: VoiceIntent, param?: string) => {
      if (intent === "repeat_commands") {
        AccessibilityInfo.announceForAccessibility(t.history.pageCommands);
        speakText(t.history.pageCommands, selectedVoice, 1).catch(() => {});
        return true;
      }
      if (intent === "list_recent_books") {
        const titles = sampleHistory.map((h) => {
          const pct = Math.round((h.lastPage / h.totalPages) * 100);
          return `${h.title}, ${pct}%`;
        }).join(". ");
        const msg = t.history.recentBooksAnnounce(sampleHistory.length, titles);
        AccessibilityInfo.announceForAccessibility(msg);
        speakText(msg, selectedVoice, 1).catch(() => {});
        return true;
      }
      if (intent === "list_bookmarked_books") {
        const titles = sampleBookmarks.map((bm) => {
          const book = sampleBooks.find((b) => b.id === bm.bookId);
          return book ? book.title : "";
        }).filter(Boolean).join(", ");
        const msg = t.history.bookmarkedBooksAnnounce(sampleBookmarks.length, titles);
        AccessibilityInfo.announceForAccessibility(msg);
        speakText(msg, selectedVoice, 1).catch(() => {});
        return true;
      }
      if ((intent === "open_book" || intent === "search_book") && param) {
        const book = findBookByTitle(param);
        if (book) {
          const inHistory = recentBookIds.includes(book.id) || bookmarkedBookIds.includes(book.id);
          if (inHistory || isSubscribed) {
            router.push({ pathname: "/student/book/[id]", params: { id: book.id } });
          } else {
            const msg = t.collection.subscriptionRequired;
            AccessibilityInfo.announceForAccessibility(msg);
            speakText(msg, selectedVoice, 1).catch(() => {});
          }
          return true;
        }
      }
      return false;
    });
    return () => clearTranscriptionCallback();
  }, [selectedVoice, t, isSubscribed]);

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
              accessibilityLabel={t.history.backA11yLabel}
              accessibilityHint="Double tap to go back to home"
            >
              <Feather name="arrow-left" size={28} color={Colors.text} />
            </Pressable>
            <Text style={styles.headerTitle} accessibilityRole="header">{t.history.title}</Text>
            <View style={{ width: 48 }} />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle} accessibilityRole="header">{t.history.recentlyRead}</Text>
              {sampleHistory.length > 0 ? (
                sampleHistory.map((entry) => (
                  <RecentBookCard
                    key={entry.id}
                    bookId={entry.bookId}
                    lastPage={entry.lastPage}
                    totalPages={entry.totalPages}
                    timestamp={entry.timestamp}
                    t={t}
                  />
                ))
              ) : (
                <EmptySection
                  icon="time-outline"
                  title={t.history.noRecentBooks}
                  subtitle={t.history.noRecentBooksSub}
                />
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle} accessibilityRole="header">{t.history.bookmarked}</Text>
              {sampleBookmarks.length > 0 ? (
                sampleBookmarks.map((bm, idx) => (
                  <BookmarkCard
                    key={`${bm.bookId}-${bm.page}-${idx}`}
                    bookId={bm.bookId}
                    page={bm.page}
                    note={bm.note}
                  />
                ))
              ) : (
                <EmptySection
                  icon="bookmark-outline"
                  title={t.history.noBookmarks}
                  subtitle={t.history.noBookmarksSub}
                />
              )}
            </View>
          </ScrollView>
        </View>

        <SwipeHintBar hints={voiceHints.riwayat} />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  recentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    gap: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    minHeight: 90,
  },
  bookCover: {
    width: 56,
    height: 72,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  recentInfo: {
    flex: 1,
    gap: 3,
  },
  recentTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.text,
  },
  recentAuthor: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: Colors.textSecondary,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  progressBar: {
    flex: 1,
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
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: Colors.studentPrimary,
    minWidth: 36,
    textAlign: "right",
  },
  timestamp: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.borderStrong,
  },
  bookmarkCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    gap: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    minHeight: 64,
  },
  bookmarkCover: {
    width: 44,
    height: 56,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  bookmarkInfo: {
    flex: 1,
    gap: 2,
  },
  bookmarkTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.text,
  },
  bookmarkMeta: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptySection: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    gap: 10,
  },
  emptySectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  emptySectionSub: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  freezeZone: {
    flex: 1,
  },
  frozen: {
    opacity: 0.5,
  },
});
