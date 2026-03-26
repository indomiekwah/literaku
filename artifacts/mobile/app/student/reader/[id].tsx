import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  Modal,
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
import { useVoiceActivation } from "@/contexts/VoiceActivation";
import { useT } from "@/hooks/useTranslation";
import { useTTSAnnounce } from "@/hooks/useTTSAnnounce";
import { speakText, stopTTSPlayback, summarizeText } from "@/services/speech";
import type { VoiceIntent } from "@/services/voiceRouter";

export default function StudentReaderScreen() {
  const insets = useSafeAreaInsets();
  const { id, preview } = useLocalSearchParams<{ id: string; preview?: string }>();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;
  const { speed, textSize, isVoiceOnly, isSubscribed, selectedVoice, language } = useReadingPreferences();
  const { onTranscription, clearTranscriptionCallback } = useVoiceActivation();
  const t = useT();

  const book = sampleBooks.find((b) => b.id === id);
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTTSLoading, setIsTTSLoading] = useState(false);
  const ttsAbortRef = useRef(false);

  const [showSummary, setShowSummary] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState(false);

  const isPreviewMode = preview === "true" && !isSubscribed;
  const totalPages = book ? (isPreviewMode ? 1 : book.content.length) : 0;
  const maxPage = Math.max(0, totalPages - 1);
  const progress = totalPages > 0 ? ((currentPage + 1) / totalPages) * 100 : 0;

  const startTTS = useCallback(async (pageIndex: number) => {
    if (!book) return;
    const pageText = book.content[pageIndex];
    if (!pageText) return;

    ttsAbortRef.current = false;
    setIsTTSLoading(true);
    setIsPlaying(true);
    AccessibilityInfo.announceForAccessibility(t.reader.playing);

    try {
      await speakText(pageText, selectedVoice, speed);
      setIsTTSLoading(false);
      if (!ttsAbortRef.current) {
        setIsPlaying(false);
        if (pageIndex < maxPage) {
          const nextPage = pageIndex + 1;
          setCurrentPage(nextPage);
          startTTS(nextPage);
        }
      }
    } catch (err) {
      console.error("TTS error:", err);
      setIsTTSLoading(false);
      setIsPlaying(false);
      AccessibilityInfo.announceForAccessibility("Voice playback failed.");
    }
  }, [book, selectedVoice, speed, maxPage, t]);

  const goToPage = useCallback((page: number) => {
    if (page >= 0 && page <= maxPage) {
      stopTTSPlayback();
      setIsPlaying(false);
      setCurrentPage(page);
      AccessibilityInfo.announceForAccessibility(t.reader.pageOf(page + 1, totalPages));
    }
  }, [maxPage, totalPages, t]);

  const handleSummarize = useCallback(async () => {
    if (!book || isSummarizing) return;
    const pageText = book.content[currentPage];
    if (!pageText) return;

    stopTTSPlayback();
    ttsAbortRef.current = true;
    setIsPlaying(false);
    setIsSummarizing(true);
    setSummaryError(false);
    setSummaryText("");
    setShowSummary(true);
    AccessibilityInfo.announceForAccessibility(t.reader.summaryLoading);

    try {
      const result = await summarizeText(pageText, language);
      setSummaryText(result.summary);
      AccessibilityInfo.announceForAccessibility(result.summary);
    } catch (err) {
      console.error("Summarize error:", err);
      setSummaryError(true);
      AccessibilityInfo.announceForAccessibility(t.reader.summaryError);
    } finally {
      setIsSummarizing(false);
    }
  }, [book, currentPage, language, isSummarizing, t]);

  const handleReadSummaryAloud = useCallback(() => {
    if (summaryText) {
      speakText(summaryText, selectedVoice, 1).catch(() => {});
    }
  }, [summaryText, selectedVoice]);

  const handleCloseSummary = useCallback(() => {
    stopTTSPlayback();
    setShowSummary(false);
    setSummaryText("");
    setSummaryError(false);
  }, []);

  useTTSAnnounce(book ? t.reader.mountAnnounce(book.title) : "");

  useEffect(() => {
    return () => {
      ttsAbortRef.current = true;
      stopTTSPlayback();
      clearTranscriptionCallback();
    };
  }, []);

  useFocusEffect(useCallback(() => {
    onTranscription((_text: string, intent: VoiceIntent) => {
      if (intent === "repeat_commands") {
        AccessibilityInfo.announceForAccessibility(t.reader.pageCommands);
        speakText(t.reader.pageCommands, selectedVoice, 1).catch(() => {});
        return true;
      }
      switch (intent) {
        case "reader_next":
          if (currentPage < maxPage) {
            ttsAbortRef.current = true;
            stopTTSPlayback();
            setIsPlaying(false);
            setCurrentPage(currentPage + 1);
            AccessibilityInfo.announceForAccessibility(t.reader.pageOf(currentPage + 2, totalPages));
          }
          return true;
        case "reader_prev":
          if (currentPage > 0) {
            ttsAbortRef.current = true;
            stopTTSPlayback();
            setIsPlaying(false);
            setCurrentPage(currentPage - 1);
            AccessibilityInfo.announceForAccessibility(t.reader.pageOf(currentPage, totalPages));
          }
          return true;
        case "reader_play":
          ttsAbortRef.current = true;
          stopTTSPlayback();
          setIsPlaying(false);
          setTimeout(() => startTTS(currentPage), 100);
          return true;
        case "reader_pause":
        case "reader_stop":
          ttsAbortRef.current = true;
          stopTTSPlayback();
          setIsPlaying(false);
          setIsTTSLoading(false);
          AccessibilityInfo.announceForAccessibility(t.reader.paused);
          return true;
        case "reader_summarize":
          handleSummarize();
          return true;
        case "reader_read_aloud":
          if (summaryText) {
            speakText(summaryText, selectedVoice, 1).catch(() => {});
          } else {
            handleSummarize();
          }
          return true;
        default:
          return false;
      }
    });
    return () => clearTranscriptionCallback();
  }, [currentPage, maxPage, totalPages, isPlaying, startTTS, handleSummarize, summaryText, selectedVoice, t]));

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

  const handleRewind = useCallback(() => {
    if (currentPage > 0) {
      stopTTSPlayback();
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      setIsPlaying(false);
      AccessibilityInfo.announceForAccessibility(t.reader.rewind);
    } else {
      AccessibilityInfo.announceForAccessibility(t.reader.rewind);
    }
  }, [currentPage, t]);

  const handleForward = useCallback(() => {
    if (currentPage < maxPage) {
      stopTTSPlayback();
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      setIsPlaying(false);
      AccessibilityInfo.announceForAccessibility(t.reader.forward);
    } else {
      AccessibilityInfo.announceForAccessibility(t.reader.forward);
    }
  }, [currentPage, maxPage, t]);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      ttsAbortRef.current = true;
      stopTTSPlayback();
      setIsPlaying(false);
      setIsTTSLoading(false);
      AccessibilityInfo.announceForAccessibility(t.reader.paused);
    } else {
      startTTS(currentPage);
    }
  }, [isPlaying, currentPage, startTTS, t]);

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
              style={[styles.summarizeHeaderButton, isSummarizing && { opacity: 0.5 }]}
              onPress={handleSummarize}
              disabled={isSummarizing}
              accessibilityRole="button"
              accessibilityLabel={t.reader.summarize}
              accessibilityHint={t.reader.summarizeA11yHint}
            >
              {isSummarizing
                ? <ActivityIndicator size="small" color={Colors.primaryLight} />
                : <Ionicons name="sparkles" size={24} color={Colors.primaryLight} />
              }
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

        <Modal
          visible={showSummary}
          animationType="slide"
          transparent
          onRequestClose={handleCloseSummary}
          accessibilityViewIsModal
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Ionicons name="sparkles" size={22} color={Colors.primaryLight} />
                <Text style={styles.modalTitle} accessibilityRole="header">
                  {t.reader.summaryTitle}
                </Text>
                <Pressable
                  style={styles.modalCloseButton}
                  onPress={handleCloseSummary}
                  accessibilityRole="button"
                  accessibilityLabel={t.reader.summaryClose}
                >
                  <Ionicons name="close" size={24} color={Colors.text} />
                </Pressable>
              </View>

              <ScrollView style={styles.modalScrollView}>
                {isSummarizing ? (
                  <View style={styles.modalLoadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primaryLight} />
                    <Text style={styles.modalLoadingText}>{t.reader.summaryLoading}</Text>
                  </View>
                ) : summaryError ? (
                  <View style={styles.modalErrorContainer}>
                    <Ionicons name="alert-circle" size={32} color="#E65100" />
                    <Text style={styles.modalErrorText}>{t.reader.summaryError}</Text>
                    <Pressable
                      style={styles.retryButton}
                      onPress={handleSummarize}
                      accessibilityRole="button"
                    >
                      <Ionicons name="refresh" size={20} color="#FFF" />
                      <Text style={styles.retryButtonText}>
                        {t.reader.summaryRetry}
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  <Text
                    style={styles.modalSummaryText}
                    accessibilityRole="text"
                    accessibilityLabel={summaryText}
                  >
                    {summaryText}
                  </Text>
                )}
              </ScrollView>

              {summaryText && !isSummarizing && (
                <Pressable
                  style={styles.readAloudButton}
                  onPress={handleReadSummaryAloud}
                  accessibilityRole="button"
                  accessibilityLabel={t.reader.summaryReadAloud}
                >
                  <Ionicons name="volume-high" size={22} color="#FFF" />
                  <Text style={styles.readAloudButtonText}>{t.reader.summaryReadAloud}</Text>
                </Pressable>
              )}
            </View>
          </View>
        </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "70%",
    minHeight: 250,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    flex: 1,
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.text,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  modalScrollView: {
    flex: 1,
    marginVertical: 16,
  },
  modalLoadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingVertical: 40,
  },
  modalLoadingText: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: Colors.textSecondary,
  },
  modalErrorContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 24,
  },
  modalErrorText: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: "#E65100",
    textAlign: "center",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  retryButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#FFF",
  },
  modalSummaryText: {
    fontFamily: "Inter_400Regular",
    fontSize: 18,
    color: Colors.text,
    lineHeight: 30,
  },
  readAloudButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.studentPrimary,
    borderRadius: 14,
    paddingVertical: 16,
    minHeight: 56,
  },
  readAloudButtonText: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#FFF",
  },
});
