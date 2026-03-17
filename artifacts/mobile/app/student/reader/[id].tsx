import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
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
import { sampleBooks, voiceHints } from "@/constants/data";
import { useReadingPreferences } from "@/contexts/ReadingPreferences";
import { useT } from "@/hooks/useTranslation";

export default function StudentReaderScreen() {
  const insets = useSafeAreaInsets();
  const { id, preview } = useLocalSearchParams<{ id: string; preview?: string }>();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;
  const { speed, textSize, isVoiceOnly, isSubscribed } = useReadingPreferences();
  const t = useT();

  const book = sampleBooks.find((b) => b.id === id);
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const isPreviewMode = preview === "true" && !isSubscribed;
  const maxPage = isPreviewMode ? 0 : (book ? book.content.length - 1 : 0);

  React.useEffect(() => {
    if (book) {
      AccessibilityInfo.announceForAccessibility(t.reader.mountAnnounce(book.title));
    }
  }, [book?.title]);

  if (!book) {
    return (
      <SwipeVoiceWrapper>
        <View style={[styles.container, { paddingTop: topPadding }]}>
          <Text style={styles.errorText} accessibilityRole="alert">
            {t.reader.notFound}
          </Text>
        </View>
      </SwipeVoiceWrapper>
    );
  }

  const totalPages = isPreviewMode ? 1 : book.content.length;
  const progress = ((currentPage + 1) / totalPages) * 100;

  const goToPage = (page: number) => {
    if (page >= 0 && page <= maxPage) {
      setCurrentPage(page);
      AccessibilityInfo.announceForAccessibility(t.reader.pageOf(page + 1, totalPages));
    }
  };

  const handleRewind = () => {
    AccessibilityInfo.announceForAccessibility(t.reader.rewind);
  };

  const handleForward = () => {
    AccessibilityInfo.announceForAccessibility(t.reader.forward);
  };

  const handlePlayPause = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    AccessibilityInfo.announceForAccessibility(newState ? t.reader.playing : t.reader.paused);
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
              accessibilityLabel={t.reader.backA11yLabel}
              accessibilityHint="Double tap to go back"
            >
              <Feather name="arrow-left" size={28} color={Colors.text} />
            </Pressable>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle} numberOfLines={1} accessibilityRole="header">
                {book.title}
              </Text>
              <Text style={styles.headerSubtitle}>
                {isPreviewMode
                  ? t.bookDetail.freePreview
                  : t.reader.pageOf(currentPage + 1, totalPages)}
              </Text>
            </View>
            <Pressable
              style={styles.summarizeHeaderButton}
              onPress={() => {
                AccessibilityInfo.announceForAccessibility(t.reader.summarizing);
              }}
              accessibilityRole="button"
              accessibilityLabel={t.reader.summarize}
              accessibilityHint={t.reader.summarizeA11yHint}
            >
              <Ionicons name="sparkles" size={24} color={Colors.primaryLight} />
            </Pressable>
          </View>

          {isPreviewMode && (
            <View style={styles.previewBanner}>
              <Ionicons name="eye-outline" size={18} color={Colors.primaryLight} />
              <Text style={styles.previewBannerText}>{t.bookDetail.freePreview}</Text>
            </View>
          )}

          <View
            style={styles.progressBarContainer}
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={t.reader.readingProgress}
            accessibilityValue={{ min: 0, max: 100, now: Math.round(progress) }}
          >
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={styles.readerCard}
              accessibilityRole="text"
              accessibilityLabel={`${t.reader.pageOf(currentPage + 1, totalPages)}. ${book.content[currentPage]}`}
            >
              <Text style={[styles.pageContent, { fontSize: textSize, lineHeight: textSize * 1.7 }]}>
                {book.content[currentPage]}
              </Text>
            </View>

            {isPreviewMode && (
              <View style={styles.paywallCard}>
                <Ionicons name="lock-closed" size={36} color="#E65100" />
                <Text style={styles.paywallTitle}>{t.bookDetail.subscriptionBadge}</Text>
                <Text style={styles.paywallDesc}>{t.subscription.description}</Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.paywallButton,
                    { opacity: pressed ? 0.85 : 1 },
                  ]}
                  onPress={() => {
                    router.back();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={t.bookDetail.subscribeCta}
                >
                  <Ionicons name="diamond" size={20} color="#FFFFFF" />
                  <Text style={styles.paywallButtonText}>{t.bookDetail.subscribeCta}</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>

          <View style={styles.controlsSection}>
            <View style={styles.narrationRow}>
              <Pressable
                style={styles.rewindButton}
                onPress={handleRewind}
                accessibilityRole="button"
                accessibilityLabel={t.reader.rewind}
                accessibilityHint="Double tap to rewind 10 seconds"
              >
                <MaterialIcons name="replay-10" size={32} color={Colors.text} />
              </Pressable>

              <Pressable
                style={styles.playButton}
                onPress={handlePlayPause}
                accessibilityRole="button"
                accessibilityLabel={isPlaying ? t.reader.pauseNarration : t.reader.playNarration}
                accessibilityHint={isPlaying ? "Double tap to pause" : "Double tap to play"}
              >
                <Ionicons name={isPlaying ? "pause" : "play"} size={36} color="#FFF" />
              </Pressable>

              <Pressable
                style={styles.forwardButton}
                onPress={handleForward}
                accessibilityRole="button"
                accessibilityLabel={t.reader.forward}
                accessibilityHint="Double tap to forward 10 seconds"
              >
                <MaterialIcons name="forward-10" size={32} color={Colors.text} />
              </Pressable>
            </View>

            {!isPreviewMode && (
              <View style={styles.pageNavRow}>
                <Pressable
                  style={[styles.pageButton, currentPage === 0 && styles.pageButtonDisabled]}
                  onPress={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 0}
                  accessibilityRole="button"
                  accessibilityLabel={t.reader.prevPage}
                  accessibilityState={{ disabled: currentPage === 0 }}
                >
                  <Ionicons name="chevron-back" size={24} color={currentPage === 0 ? Colors.borderStrong : Colors.text} />
                  <Text style={[styles.pageButtonText, currentPage === 0 && styles.pageButtonTextDisabled]}>{t.reader.prev}</Text>
                </Pressable>

                <Text style={styles.pageIndicator} accessibilityLiveRegion="polite">
                  {currentPage + 1} / {totalPages}
                </Text>

                <Pressable
                  style={[styles.pageButton, currentPage === totalPages - 1 && styles.pageButtonDisabled]}
                  onPress={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  accessibilityRole="button"
                  accessibilityLabel={t.reader.nextPage}
                  accessibilityState={{ disabled: currentPage === totalPages - 1 }}
                >
                  <Text style={[styles.pageButtonText, currentPage === totalPages - 1 && styles.pageButtonTextDisabled]}>{t.reader.next}</Text>
                  <Ionicons name="chevron-forward" size={24} color={currentPage === totalPages - 1 ? Colors.borderStrong : Colors.text} />
                </Pressable>
              </View>
            )}

            <View style={styles.infoRow}>
              <Ionicons name="speedometer-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.infoText}>{speed}x</Text>
              <Text style={styles.infoDot}>·</Text>
              <Ionicons name="settings-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.infoText}>{t.reader.changeInSettings}</Text>
            </View>
          </View>
        </View>

        <SwipeHintBar hints={voiceHints.reader} />
      </View>
    </SwipeVoiceWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    gap: 10,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.text,
  },
  headerSubtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
  },
  summarizeHeaderButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.voiceBarBg,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  previewBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.voiceBarBg,
    borderRadius: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    marginBottom: 4,
  },
  previewBannerText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.primaryLight,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginVertical: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.studentPrimary,
    borderRadius: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 8,
    gap: 16,
  },
  readerCard: {
    backgroundColor: Colors.background,
    borderRadius: 18,
    padding: 22,
    borderWidth: 2,
    borderColor: Colors.border,
    minHeight: 200,
  },
  pageContent: {
    fontFamily: "Inter_400Regular",
    color: Colors.text,
  },
  paywallCard: {
    backgroundColor: "#FFF3E0",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    gap: 12,
    borderWidth: 2,
    borderColor: "#E65100",
  },
  paywallTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: "#E65100",
    textAlign: "center",
  },
  paywallDesc: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  paywallButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#E65100",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    minHeight: 56,
    width: "100%",
  },
  paywallButtonText: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#FFFFFF",
  },
  controlsSection: {
    paddingTop: 8,
    gap: 8,
  },
  narrationRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  rewindButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.studentPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  forwardButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  pageNavRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  pageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    minHeight: 48,
  },
  pageButtonDisabled: {
    opacity: 0.35,
  },
  pageButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.text,
  },
  pageButtonTextDisabled: {
    color: Colors.borderStrong,
  },
  pageIndicator: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.textSecondary,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 4,
  },
  infoText: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
  },
  infoDot: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.borderStrong,
  },
  errorText: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 100,
  },
  freezeZone: {
    flex: 1,
  },
  frozen: {
    opacity: 0.5,
  },
});
