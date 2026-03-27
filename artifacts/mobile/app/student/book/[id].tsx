import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useState } from "react";
import {
  AccessibilityInfo,
  Image,
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
import { purchasedBookIds, assignedBookIds, voiceHints } from "@/constants/data";
import { useBooks } from "@/contexts/BooksContext";
import { useReadingPreferences } from "@/contexts/ReadingPreferences";
import { useVoiceActivation } from "@/contexts/VoiceActivation";
import { useT } from "@/hooks/useTranslation";
import { useTTSAnnounce } from "@/hooks/useTTSAnnounce";
import { speakText } from "@/services/speech";
import type { VoiceIntent } from "@/services/voiceRouter";

export default function BookDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;
  const { isVoiceOnly, isSubscribed, selectedVoice } = useReadingPreferences();
  const { onTranscription, clearTranscriptionCallback } = useVoiceActivation();
  const [showPreview, setShowPreview] = useState(false);
  const { getBookById } = useBooks();
  const t = useT();

  const book = getBookById(id);
  const genresText = book ? book.genres.join(", ") : "";

  useTTSAnnounce(book ? t.bookDetail.mountAnnounce(book.title, book.author, genresText) : "");

  useFocusEffect(
    useCallback(() => {
      if (!book) return;
      onTranscription((_text: string, intent: VoiceIntent) => {
        if (intent === "repeat_commands") {
          AccessibilityInfo.announceForAccessibility(t.bookDetail.pageCommands);
          speakText(t.bookDetail.pageCommands, selectedVoice, 1).catch(() => {});
          return true;
        }
        switch (intent) {
          case "open_preview": {
            setShowPreview(true);
            const previewText = book.content[0] || "";
            const msg = `${t.bookDetail.previewReading} ${previewText}`;
            AccessibilityInfo.announceForAccessibility(msg);
            speakText(msg, selectedVoice, 1).catch(() => {});
            return true;
          }
          case "read_synopsis": {
            const msg = t.bookDetail.synopsisAnnounce(book.synopsis);
            AccessibilityInfo.announceForAccessibility(msg);
            speakText(msg, selectedVoice, 1).catch(() => {});
            return true;
          }
          case "read_full":
          case "reader_play": {
            const owned = purchasedBookIds.includes(book.id) || assignedBookIds.includes(book.id);
            if (isSubscribed || owned) {
              AccessibilityInfo.announceForAccessibility(t.bookDetail.readNow);
              router.push({ pathname: "/student/reader/[id]", params: { id: book.id } });
            } else {
              const msg = t.bookDetail.subscriptionRequired;
              AccessibilityInfo.announceForAccessibility(msg);
              speakText(msg, selectedVoice, 1).catch(() => {});
            }
            return true;
          }
          case "nav_subscription": {
            router.push("/student/subscription");
            return true;
          }
          default:
            return false;
        }
      });
      return () => clearTranscriptionCallback();
    }, [book, isSubscribed, selectedVoice, t])
  );

  if (!book) {
    return (
      <SwipeVoiceWrapper>
        <View style={[styles.container, { paddingTop: topPadding }]}>
          <Text style={styles.errorText} accessibilityRole="alert">
            {t.bookDetail.notFound}
          </Text>
        </View>
      </SwipeVoiceWrapper>
    );
  }

  const owned = purchasedBookIds.includes(book.id) || assignedBookIds.includes(book.id);

  const handleSubscribe = () => {
    router.push("/student/subscription");
  };

  const handlePreview = () => {
    setShowPreview(true);
    const previewText = book.content[0] || "";
    const msg = `${t.bookDetail.previewReading} ${previewText}`;
    speakText(msg, selectedVoice, 1).catch(() => {});
  };

  const handleRead = () => {
    if (isSubscribed || owned) {
      router.push({ pathname: "/student/reader/[id]", params: { id: book.id } });
    } else {
      const msg = t.bookDetail.subscriptionRequired;
      AccessibilityInfo.announceForAccessibility(msg);
      speakText(msg, selectedVoice, 1).catch(() => {});
    }
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
              accessibilityLabel={t.bookDetail.backA11yLabel}
              accessibilityHint="Double tap to go back"
            >
              <Feather name="arrow-left" size={28} color={Colors.text} />
            </Pressable>
            <View style={styles.headerCenter}>
              <View style={styles.headerLogoRow}>
                <Image source={require("@/assets/images/literaku-logo.png")} style={styles.headerLogoImg} accessibilityLabel="Literaku logo" />
                <Text style={styles.headerBrand}>Literaku</Text>
              </View>
            </View>
            <View style={{ width: 48 }} />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.coverSection, { backgroundColor: book.coverColor }]}>
              <Ionicons name="book" size={64} color="rgba(255,255,255,0.9)" />
            </View>

            <View style={styles.titleSection}>
              <Text style={styles.bookTitle} accessibilityRole="header">{book.title}</Text>
              <Text style={styles.bookAuthor}>{book.author}</Text>
              <Text style={styles.bookGenre}>{genresText} · {book.category}</Text>
              <View style={styles.badgeRow}>
                {(isSubscribed || owned) ? (
                  <View style={styles.subscribedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.studentPrimary} />
                    <Text style={styles.subscribedBadgeText}>{t.bookDetail.subscribedBadge}</Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.previewBadge}>
                      <Ionicons name="eye-outline" size={16} color={Colors.primaryLight} />
                      <Text style={styles.previewBadgeText}>{t.bookDetail.freePreview}</Text>
                    </View>
                    <View style={styles.subRequiredBadge}>
                      <Ionicons name="lock-closed-outline" size={16} color="#E65100" />
                      <Text style={styles.subRequiredText}>{t.bookDetail.subscriptionBadge}</Text>
                    </View>
                  </>
                )}
              </View>
            </View>

            <View style={styles.actionRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.previewButton,
                  { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
                ]}
                onPress={handlePreview}
                accessibilityRole="button"
                accessibilityLabel={t.bookDetail.previewA11yLabel}
                accessibilityHint={t.bookDetail.previewA11yHint}
              >
                <Ionicons name="eye" size={22} color={Colors.primaryLight} />
                <Text style={styles.previewText}>{t.bookDetail.preview}</Text>
              </Pressable>

              {(isSubscribed || owned) ? (
                <Pressable
                  style={({ pressed }) => [
                    styles.readButton,
                    { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
                  ]}
                  onPress={handleRead}
                  accessibilityRole="button"
                  accessibilityLabel={t.bookDetail.readA11yLabel}
                  accessibilityHint={t.bookDetail.readA11yHint}
                >
                  <Ionicons name="book" size={22} color="#FFFFFF" />
                  <Text style={styles.buyText}>{t.bookDetail.readNow}</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={({ pressed }) => [
                    styles.subscribeCtaButton,
                    { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
                  ]}
                  onPress={handleSubscribe}
                  accessibilityRole="button"
                  accessibilityLabel={t.bookDetail.subscribeA11yLabel}
                  accessibilityHint={t.bookDetail.subscribeA11yHint}
                >
                  <Ionicons name="diamond" size={22} color="#FFFFFF" />
                  <Text style={styles.buyText}>{t.bookDetail.subscribeCta}</Text>
                </Pressable>
              )}
            </View>

            <View style={styles.synopsisSection}>
              <Text style={styles.synopsisLabel} accessibilityRole="header">{t.bookDetail.synopsis}</Text>
              <Text
                style={styles.synopsisText}
                accessibilityLabel={`${t.bookDetail.synopsis}: ${book.synopsis}`}
              >
                {book.synopsis}
              </Text>
            </View>
          </ScrollView>
        </View>

        <Modal
          visible={showPreview}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPreview(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.previewCard, { paddingBottom: bottomPadding + 16 }]}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewTitle}>{t.bookDetail.previewTitle}</Text>
                <Pressable
                  onPress={() => setShowPreview(false)}
                  accessibilityRole="button"
                  accessibilityLabel={t.bookDetail.previewCloseA11y}
                  style={styles.previewCloseBtn}
                >
                  <Ionicons name="close-circle" size={32} color={Colors.textSecondary} />
                </Pressable>
              </View>
              <ScrollView style={styles.previewScroll} showsVerticalScrollIndicator={false}>
                <Text style={styles.previewContentText}>
                  {book.content[0] || ""}
                </Text>
              </ScrollView>
              <Pressable
                style={({ pressed }) => [
                  styles.previewCloseButton,
                  { opacity: pressed ? 0.85 : 1 },
                ]}
                onPress={() => setShowPreview(false)}
                accessibilityRole="button"
                accessibilityLabel={t.bookDetail.previewClose}
              >
                <Text style={styles.previewCloseButtonText}>{t.bookDetail.previewClose}</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <SwipeHintBar hints={voiceHints.bookDetail} />
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
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: Colors.text,
    flex: 1,
    textAlign: "center",
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
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerLogoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerLogoImg: {
    width: 22,
    height: 22,
    borderRadius: 5,
  },
  headerBrand: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.primaryLight,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
    gap: 20,
  },
  coverSection: {
    height: 180,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  titleSection: {
    gap: 6,
  },
  bookTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    color: Colors.text,
  },
  bookAuthor: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
  },
  bookGenre: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.primaryLight,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  previewBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.voiceBarBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  previewBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.primaryLight,
  },
  subRequiredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E65100",
  },
  subRequiredText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#E65100",
  },
  subscribedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  subscribedBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.studentPrimary,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  previewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.voiceBarBg,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    minHeight: 60,
  },
  previewText: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.primaryLight,
  },
  subscribeCtaButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#E65100",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
    minHeight: 60,
  },
  readButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
    minHeight: 60,
  },
  buyText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#FFFFFF",
    flexShrink: 1,
  },
  synopsisSection: {
    gap: 10,
  },
  synopsisLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.text,
  },
  synopsisText: {
    fontFamily: "Inter_400Regular",
    fontSize: 18,
    color: Colors.textSecondary,
    lineHeight: 28,
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  previewCard: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    maxHeight: "80%",
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  previewTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: Colors.text,
  },
  previewCloseBtn: {
    padding: 4,
  },
  previewScroll: {
    flex: 1,
    marginBottom: 12,
  },
  previewContentText: {
    fontFamily: "Inter_400Regular",
    fontSize: 18,
    color: Colors.text,
    lineHeight: 30,
  },
  previewCloseButton: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 8,
  },
  previewCloseButtonText: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#FFFFFF",
  },
});
