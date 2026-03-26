import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
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
import { sampleBooks, purchasedBookIds, assignedBookIds, voiceHints, type Book } from "@/constants/data";
import { useReadingPreferences } from "@/contexts/ReadingPreferences";
import { useVoiceActivation } from "@/contexts/VoiceActivation";
import { useT } from "@/hooks/useTranslation";
import { useTTSAnnounce } from "@/hooks/useTTSAnnounce";
import { speakText } from "@/services/speech";
import type { VoiceIntent } from "@/services/voiceRouter";
import { findBookByTitle } from "@/services/voiceRouter";

function CollectionBookCard({ book }: { book: Book }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.bookCard,
        { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
      onPress={() => router.push({ pathname: "/student/book/[id]", params: { id: book.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${book.title} by ${book.author}. ${book.genre}.`}
      accessibilityHint="Double tap to open book details"
    >
      <View style={[styles.bookCover, { backgroundColor: book.coverColor }]}>
        <Ionicons name="book" size={28} color="#FFFFFF" />
      </View>
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>{book.author}</Text>
        <Text style={styles.bookGenre}>{book.genre}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={Colors.textSecondary} />
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

export default function KoleksiScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;
  const { isVoiceOnly, selectedVoice, isSubscribed } = useReadingPreferences();
  const t = useT();

  const purchasedBooks = sampleBooks.filter((b) => purchasedBookIds.includes(b.id));
  const assignedBooks = sampleBooks.filter((b) => assignedBookIds.includes(b.id));
  const totalCount = purchasedBooks.length + assignedBooks.length;

  const { onTranscription, clearTranscriptionCallback } = useVoiceActivation();

  useTTSAnnounce(t.collection.mountAnnounce(totalCount));

  useEffect(() => {
    onTranscription((_text: string, intent: VoiceIntent, param?: string) => {
      if (intent === "repeat_commands") {
        AccessibilityInfo.announceForAccessibility(t.collection.pageCommands);
        speakText(t.collection.pageCommands, selectedVoice, 1).catch(() => {});
        return true;
      }
      if (intent === "list_paid_books") {
        const titles = purchasedBooks.map((b) => b.title).join(", ");
        const msg = t.collection.paidBooksAnnounce(purchasedBooks.length, titles);
        AccessibilityInfo.announceForAccessibility(msg);
        speakText(msg, selectedVoice, 1).catch(() => {});
        return true;
      }
      if (intent === "list_assigned_books") {
        const titles = assignedBooks.map((b) => b.title).join(", ");
        const msg = t.collection.assignedBooksAnnounce(assignedBooks.length, titles);
        AccessibilityInfo.announceForAccessibility(msg);
        speakText(msg, selectedVoice, 1).catch(() => {});
        return true;
      }
      if ((intent === "open_book" || intent === "search_book") && param) {
        const book = findBookByTitle(param);
        if (book) {
          const owned = purchasedBookIds.includes(book.id) || assignedBookIds.includes(book.id);
          if (owned || isSubscribed) {
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
              accessibilityLabel={t.collection.backA11yLabel}
              accessibilityHint="Double tap to go back to home"
            >
              <Feather name="arrow-left" size={28} color={Colors.text} />
            </Pressable>
            <Text style={styles.headerTitle} accessibilityRole="header">{t.collection.title}</Text>
            <View style={{ width: 48 }} />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle} accessibilityRole="header">{t.collection.purchasedBooks}</Text>
              {purchasedBooks.length > 0 ? (
                purchasedBooks.map((book) => (
                  <CollectionBookCard key={book.id} book={book} />
                ))
              ) : (
                <EmptySection
                  icon="cart-outline"
                  title={t.collection.noPurchasedBooks}
                  subtitle={t.collection.noPurchasedBooksSub}
                />
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle} accessibilityRole="header">{t.collection.assignedBooks}</Text>
              {assignedBooks.length > 0 ? (
                assignedBooks.map((book) => (
                  <CollectionBookCard key={book.id} book={book} />
                ))
              ) : (
                <EmptySection
                  icon="school-outline"
                  title={t.collection.noAssignedBooks}
                  subtitle={t.collection.noAssignedBooksSub}
                />
              )}
            </View>
          </ScrollView>
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
  bookCard: {
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
  bookInfo: {
    flex: 1,
    gap: 3,
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
