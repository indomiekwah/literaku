import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  AccessibilityInfo,
  FlatList,
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

function HorizontalBookRow({ bookIds, label }: { bookIds: string[]; label: string }) {
  const books = bookIds.map((id) => sampleBooks.find((b) => b.id === id)).filter(Boolean);

  if (books.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header">{label}</Text>
      <FlatList
        horizontal
        data={books}
        keyExtractor={(item) => item!.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.bookThumb,
              { opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={() => router.push({ pathname: "/student/book/[id]", params: { id: item!.id } })}
            accessibilityRole="button"
            accessibilityLabel={`${item!.title} by ${item!.author}`}
            accessibilityHint="Double tap to open book details"
          >
            <View style={[styles.bookCover, { backgroundColor: item!.coverColor }]}>
              <Ionicons name="book" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.bookThumbTitle} numberOfLines={2}>{item!.title}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

export default function RiwayatScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;
  const { isVoiceOnly, selectedVoice } = useReadingPreferences();
  const { onTranscription, clearTranscriptionCallback } = useVoiceActivation();
  const t = useT();

  const recentBookIds = sampleHistory.map((h) => h.bookId);
  const bookmarkedBookIds = sampleBookmarks.map((b) => b.bookId);

  useTTSAnnounce(t.history.mountAnnounce);

  React.useEffect(() => {
    onTranscription((_text: string, intent: VoiceIntent) => {
      if (intent === "repeat_commands") {
        AccessibilityInfo.announceForAccessibility(t.history.pageCommands);
        speakText(t.history.pageCommands, selectedVoice, 1).catch(() => {});
        return true;
      }
      return false;
    });
    return () => clearTranscriptionCallback();
  }, [selectedVoice, t]);

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
            <HorizontalBookRow bookIds={recentBookIds} label={t.history.recentlyRead} />
            <HorizontalBookRow bookIds={bookmarkedBookIds} label={t.history.bookmarked} />
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
  horizontalList: {
    gap: 14,
    paddingRight: 4,
  },
  bookThumb: {
    width: 100,
    gap: 8,
    alignItems: "center",
  },
  bookCover: {
    width: 80,
    height: 110,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  bookThumbTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.text,
    textAlign: "center",
  },
  freezeZone: {
    flex: 1,
  },
  frozen: {
    opacity: 0.5,
  },
});
