import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  LayoutChangeEvent,
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
import { speakText, stopTTSPlayback, speakTextWithProgress } from "@/services/speech";
import type { VoiceIntent } from "@/services/voiceRouter";

interface WordToken {
  word: string;
  globalIndex: number;
  sectionIndex: number;
}

function buildWordMap(sections: string[]): { tokens: WordToken[]; sectionWordCounts: number[] } {
  const tokens: WordToken[] = [];
  const sectionWordCounts: number[] = [];
  let globalIndex = 0;
  for (let s = 0; s < sections.length; s++) {
    const words = sections[s].split(/\s+/).filter(Boolean);
    sectionWordCounts.push(words.length);
    for (const word of words) {
      tokens.push({ word, globalIndex, sectionIndex: s });
      globalIndex++;
    }
  }
  return { tokens, sectionWordCounts };
}

function estimateWordIndex(
  currentTimeMs: number,
  durationMs: number,
  wordCount: number,
  wordLengths: number[],
): number {
  if (durationMs <= 0 || wordCount === 0) return 0;
  const fraction = Math.min(currentTimeMs / durationMs, 1);
  const totalChars = wordLengths.reduce((a, b) => a + b, 0);
  if (totalChars === 0) return 0;
  let cumChars = 0;
  for (let i = 0; i < wordCount; i++) {
    cumChars += wordLengths[i];
    if (cumChars / totalChars >= fraction) return i;
  }
  return wordCount - 1;
}

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
  const isPreviewMode = preview === "true" && !isSubscribed;

  const visibleSections = useMemo(() => {
    if (!book) return [];
    return isPreviewMode ? [book.content[0]] : book.content;
  }, [book, isPreviewMode]);

  const { tokens, sectionWordCounts } = useMemo(
    () => buildWordMap(visibleSections),
    [visibleSections],
  );

  const sectionWordOffsets = useMemo(() => {
    const offsets: number[] = [0];
    for (let i = 0; i < sectionWordCounts.length; i++) {
      offsets.push(offsets[i] + sectionWordCounts[i]);
    }
    return offsets;
  }, [sectionWordCounts]);

  const [currentSection, setCurrentSection] = useState(0);
  const [highlightedWordGlobal, setHighlightedWordGlobal] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTTSLoading, setIsTTSLoading] = useState(false);
  const ttsAbortRef = useRef(false);

  const [showSummary, setShowSummary] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [summaryError, setSummaryError] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const sectionLayoutsRef = useRef<Map<number, { y: number; height: number }>>(new Map());
  const scrollContentOffsetRef = useRef(0);
  const scrollViewHeightRef = useRef(0);

  const totalSections = visibleSections.length;
  const progress = totalSections > 0 ? ((currentSection + 1) / totalSections) * 100 : 0;

  const scrollToSectionProgress = useCallback((sectionIdx: number, fraction: number) => {
    const layout = sectionLayoutsRef.current.get(sectionIdx);
    if (layout && scrollViewRef.current) {
      const targetY = layout.y + fraction * layout.height - scrollViewHeightRef.current / 3;
      scrollViewRef.current.scrollTo({
        y: Math.max(0, targetY),
        animated: true,
      });
    }
  }, []);

  const startTTSForSection = useCallback(async (sectionIdx: number) => {
    if (!book || sectionIdx >= visibleSections.length) {
      setIsPlaying(false);
      setIsTTSLoading(false);
      return;
    }

    const sectionText = visibleSections[sectionIdx];
    if (!sectionText) {
      setIsPlaying(false);
      return;
    }

    ttsAbortRef.current = false;
    setCurrentSection(sectionIdx);
    setIsTTSLoading(true);
    setIsPlaying(true);
    AccessibilityInfo.announceForAccessibility(t.reader.readingSection(sectionIdx + 1));

    const sectionWords = sectionText.split(/\s+/).filter(Boolean);
    const wordLengths = sectionWords.map((w) => w.length);
    const globalOffset = sectionWordOffsets[sectionIdx] || 0;

    try {
      await speakTextWithProgress(
        sectionText,
        selectedVoice,
        speed,
        (currentTimeMs, durationMs) => {
          setIsTTSLoading(false);
          const fraction = durationMs > 0 ? currentTimeMs / durationMs : 0;
          const localIdx = estimateWordIndex(currentTimeMs, durationMs, sectionWords.length, wordLengths);
          const globalIdx = globalOffset + localIdx;
          setHighlightedWordGlobal(globalIdx);
          scrollToSectionProgress(sectionIdx, fraction);
        },
      );

      setIsTTSLoading(false);
      if (!ttsAbortRef.current) {
        if (sectionIdx < visibleSections.length - 1) {
          startTTSForSection(sectionIdx + 1);
        } else {
          setIsPlaying(false);
          setHighlightedWordGlobal(-1);
        }
      }
    } catch (err) {
      console.error("TTS error:", err);
      setIsTTSLoading(false);
      setIsPlaying(false);
      setHighlightedWordGlobal(-1);
      AccessibilityInfo.announceForAccessibility("Voice playback failed.");
    }
  }, [book, visibleSections, selectedVoice, speed, sectionWordOffsets, scrollToSectionProgress, t]);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      ttsAbortRef.current = true;
      stopTTSPlayback();
      setIsPlaying(false);
      setIsTTSLoading(false);
      AccessibilityInfo.announceForAccessibility(t.reader.paused);
    } else {
      startTTSForSection(currentSection);
    }
  }, [isPlaying, currentSection, startTTSForSection, t]);

  const handlePrevSection = useCallback(() => {
    if (currentSection > 0) {
      ttsAbortRef.current = true;
      stopTTSPlayback();
      setIsPlaying(false);
      setIsTTSLoading(false);
      setHighlightedWordGlobal(-1);
      const prev = currentSection - 1;
      setCurrentSection(prev);
      AccessibilityInfo.announceForAccessibility(t.reader.sectionOf(prev + 1, totalSections));
      const layout = sectionLayoutsRef.current.get(prev);
      if (layout && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: Math.max(0, layout.y - 20), animated: true });
      }
    }
  }, [currentSection, totalSections, t]);

  const handleNextSection = useCallback(() => {
    if (currentSection < totalSections - 1) {
      ttsAbortRef.current = true;
      stopTTSPlayback();
      setIsPlaying(false);
      setIsTTSLoading(false);
      setHighlightedWordGlobal(-1);
      const next = currentSection + 1;
      setCurrentSection(next);
      AccessibilityInfo.announceForAccessibility(t.reader.sectionOf(next + 1, totalSections));
      const layout = sectionLayoutsRef.current.get(next);
      if (layout && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: Math.max(0, layout.y - 20), animated: true });
      }
    }
  }, [currentSection, totalSections, t]);

  const handleSummarize = useCallback(() => {
    if (!book) return;

    stopTTSPlayback();
    ttsAbortRef.current = true;
    setIsPlaying(false);
    setHighlightedWordGlobal(-1);
    setSummaryError(false);
    setShowSummary(true);

    const fullSummary = book.summary || "";
    const pageSummary = book.pageSummaries?.[currentSection] || "";
    const combined = fullSummary
      ? (language === "id"
          ? `Ringkasan keseluruhan buku: ${fullSummary}\n\nRingkasan halaman ini: ${pageSummary || "Tidak tersedia."}`
          : `Full book summary: ${fullSummary}\n\nThis page summary: ${pageSummary || "Not available."}`)
      : pageSummary || (language === "id" ? "Ringkasan belum tersedia." : "Summary not available.");

    setSummaryText(combined);
    AccessibilityInfo.announceForAccessibility(combined);
  }, [book, currentSection, language, t]);

  const handleSummarizeAndRead = useCallback(() => {
    if (summaryText) {
      setShowSummary(true);
      speakText(summaryText, selectedVoice, 1).catch(() => {});
      return;
    }
    if (!book) return;

    stopTTSPlayback();
    ttsAbortRef.current = true;
    setIsPlaying(false);
    setHighlightedWordGlobal(-1);
    setSummaryError(false);
    setShowSummary(true);

    const fullSummary = book.summary || "";
    const pageSummary = book.pageSummaries?.[currentSection] || "";
    const combined = fullSummary
      ? (language === "id"
          ? `Ringkasan keseluruhan buku: ${fullSummary}\n\nRingkasan halaman ini: ${pageSummary || "Tidak tersedia."}`
          : `Full book summary: ${fullSummary}\n\nThis page summary: ${pageSummary || "Not available."}`)
      : pageSummary || (language === "id" ? "Ringkasan belum tersedia." : "Summary not available.");

    setSummaryText(combined);
    AccessibilityInfo.announceForAccessibility(combined);
    speakText(combined, selectedVoice, 1).catch(() => {});
  }, [book, currentSection, language, summaryText, selectedVoice, t]);

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
    onTranscription((_text: string, intent: VoiceIntent, param?: string) => {
      if (intent === "repeat_commands") {
        AccessibilityInfo.announceForAccessibility(t.reader.pageCommands);
        speakText(t.reader.pageCommands, selectedVoice, 1).catch(() => {});
        return true;
      }
      switch (intent) {
        case "reader_next":
          handleNextSection();
          return true;
        case "reader_prev":
          handlePrevSection();
          return true;
        case "reader_goto_page": {
          const pageNum = parseInt(param || "", 10);
          if (pageNum >= 1 && pageNum <= totalSections) {
            ttsAbortRef.current = true;
            stopTTSPlayback();
            setIsPlaying(false);
            setIsTTSLoading(false);
            setHighlightedWordGlobal(-1);
            const idx = pageNum - 1;
            setCurrentSection(idx);
            AccessibilityInfo.announceForAccessibility(t.reader.sectionOf(pageNum, totalSections));
            const layout = sectionLayoutsRef.current.get(idx);
            if (layout && scrollViewRef.current) {
              scrollViewRef.current.scrollTo({ y: Math.max(0, layout.y - 20), animated: true });
            }
          } else {
            const msg = language === "id"
              ? `Halaman ${param} tidak tersedia. Buku ini memiliki ${totalSections} halaman.`
              : `Page ${param} is not available. This book has ${totalSections} pages.`;
            AccessibilityInfo.announceForAccessibility(msg);
            speakText(msg, selectedVoice, 1).catch(() => {});
          }
          return true;
        }
        case "reader_play":
          ttsAbortRef.current = true;
          stopTTSPlayback();
          setIsPlaying(false);
          setTimeout(() => startTTSForSection(currentSection), 100);
          return true;
        case "reader_pause":
        case "reader_stop":
          ttsAbortRef.current = true;
          stopTTSPlayback();
          setIsPlaying(false);
          setIsTTSLoading(false);
          setHighlightedWordGlobal(-1);
          AccessibilityInfo.announceForAccessibility(t.reader.paused);
          return true;
        case "reader_summarize":
          handleSummarize();
          return true;
        case "reader_read_aloud":
          handleSummarizeAndRead();
          return true;
        default:
          return false;
      }
    });
    return () => clearTranscriptionCallback();
  }, [currentSection, totalSections, isPlaying, startTTSForSection, handleSummarize, handleSummarizeAndRead, handleNextSection, handlePrevSection, summaryText, selectedVoice, language, t]));

  const handleSectionLayout = useCallback((sectionIdx: number, e: LayoutChangeEvent) => {
    sectionLayoutsRef.current.set(sectionIdx, {
      y: e.nativeEvent.layout.y,
      height: e.nativeEvent.layout.height,
    });
  }, []);

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

  return (
    <SwipeVoiceWrapper>
      <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
        <StatusBar style="dark" />

        <View style={[styles.freezeZone, isVoiceOnly && styles.frozen, { pointerEvents: isVoiceOnly ? 'none' : 'auto' }]}>
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={() => {
                ttsAbortRef.current = true;
                stopTTSPlayback();
                setIsPlaying(false);
                setHighlightedWordGlobal(-1);
                router.back();
              }}
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
                  : t.reader.sectionOf(currentSection + 1, totalSections)}
              </Text>
            </View>
            <Pressable
              style={styles.summarizeHeaderButton}
              onPress={handleSummarize}
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
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            onScroll={(e) => {
              scrollContentOffsetRef.current = e.nativeEvent.contentOffset.y;
            }}
            onLayout={(e) => {
              scrollViewHeightRef.current = e.nativeEvent.layout.height;
            }}
            scrollEventThrottle={16}
          >
            {visibleSections.map((sectionText, sectionIdx) => {
              const words = sectionText.split(/\s+/).filter(Boolean);
              const globalOffset = sectionWordOffsets[sectionIdx] || 0;
              const isCurrent = sectionIdx === currentSection;

              return (
                <View
                  key={sectionIdx}
                  style={[
                    styles.sectionCard,
                    isCurrent && isPlaying && styles.sectionCardActive,
                  ]}
                  onLayout={(e) => handleSectionLayout(sectionIdx, e)}
                  accessibilityRole="text"
                  accessibilityLabel={t.reader.sectionOf(sectionIdx + 1, totalSections)}
                >
                  <Text style={[styles.sectionContent, { fontSize: textSize, lineHeight: textSize * 1.8 }]}>
                    {words.map((word, wIdx) => {
                      const globalIdx = globalOffset + wIdx;
                      const isHighlighted = globalIdx === highlightedWordGlobal;
                      return (
                        <Text
                          key={globalIdx}
                          style={isHighlighted ? [
                            styles.highlightedWord,
                            { fontSize: textSize, lineHeight: textSize * 1.8 },
                          ] : undefined}
                        >
                          {word}{wIdx < words.length - 1 ? " " : ""}
                        </Text>
                      );
                    })}
                  </Text>
                </View>
              );
            })}

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
                  onPress={() => router.back()}
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
                style={[styles.skipButton, currentSection === 0 && styles.skipButtonDisabled]}
                onPress={handlePrevSection}
                disabled={currentSection === 0}
                accessibilityRole="button"
                accessibilityLabel={t.reader.prevSection}
                accessibilityState={{ disabled: currentSection === 0 }}
              >
                <Ionicons name="play-skip-back" size={28} color={currentSection === 0 ? Colors.borderStrong : Colors.text} />
              </Pressable>

              <Pressable
                style={styles.playButton}
                onPress={handlePlayPause}
                accessibilityRole="button"
                accessibilityLabel={isPlaying ? t.reader.pauseNarration : t.reader.playNarration}
                accessibilityHint={isPlaying ? "Double tap to pause" : "Double tap to play"}
              >
                {isTTSLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Ionicons name={isPlaying ? "pause" : "play"} size={36} color="#FFF" />
                )}
              </Pressable>

              <Pressable
                style={[styles.skipButton, currentSection >= totalSections - 1 && styles.skipButtonDisabled]}
                onPress={handleNextSection}
                disabled={currentSection >= totalSections - 1}
                accessibilityRole="button"
                accessibilityLabel={t.reader.nextSection}
                accessibilityState={{ disabled: currentSection >= totalSections - 1 }}
              >
                <Ionicons name="play-skip-forward" size={28} color={currentSection >= totalSections - 1 ? Colors.borderStrong : Colors.text} />
              </Pressable>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.sectionIndicator} accessibilityLiveRegion="polite">
                {t.reader.sectionOf(currentSection + 1, totalSections)}
              </Text>
              <Text style={styles.infoDot}>·</Text>
              <Ionicons name="speedometer-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.infoText}>{speed}x</Text>
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
                <Text
                  style={styles.modalSummaryText}
                  accessibilityRole="text"
                  accessibilityLabel={summaryText}
                >
                  {summaryText}
                </Text>
              </ScrollView>

              {summaryText && (
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
    gap: 20,
  },
  sectionCard: {
    backgroundColor: Colors.background,
    borderRadius: 18,
    padding: 22,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  sectionCardActive: {
    borderColor: Colors.studentPrimary,
    backgroundColor: "#F1F8E9",
  },
  sectionContent: {
    fontFamily: "Inter_400Regular",
    color: Colors.text,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  highlightedWord: {
    backgroundColor: "#BBDEFB",
    borderRadius: 4,
    fontFamily: "Inter_700Bold",
    color: "#0D47A1",
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
    gap: 6,
    paddingBottom: 4,
  },
  narrationRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
  },
  skipButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  skipButtonDisabled: {
    opacity: 0.35,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.studentPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionIndicator: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.textSecondary,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 2,
  },
  infoText: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: Colors.textSecondary,
  },
  infoDot: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
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
