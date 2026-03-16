import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  AccessibilityInfo,
  Alert,
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
import { sampleBooks, formatRupiah, voiceHints } from "@/constants/data";
import { useReadingPreferences } from "@/contexts/ReadingPreferences";
import { useT } from "@/hooks/useTranslation";

export default function BookDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;
  const { isVoiceOnly } = useReadingPreferences();
  const [purchased, setPurchased] = useState(false);
  const t = useT();

  const book = sampleBooks.find((b) => b.id === id);
  const isOwned = book?.owned || purchased;

  React.useEffect(() => {
    if (book) {
      AccessibilityInfo.announceForAccessibility(
        t.bookDetail.mountAnnounce(book.title, book.author, book.genre, isOwned ? t.bookDetail.owned : formatRupiah(book.price))
      );
    }
  }, [book?.title, isOwned]);

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

  const handleBuy = () => {
    Alert.alert(
      t.bookDetail.purchaseSuccess,
      t.bookDetail.purchaseSuccessMsg(book.title),
      [
        {
          text: "OK",
          onPress: () => {
            setPurchased(true);
            AccessibilityInfo.announceForAccessibility(t.bookDetail.purchaseA11y(book.title));
          },
        },
      ]
    );
  };

  const handlePreview = () => {
    router.push({ pathname: "/student/reader/[id]", params: { id: book.id } });
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
                <Ionicons name="headset" size={18} color={Colors.primaryLight} />
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
              <Text style={styles.bookGenre}>{book.genre} · {book.category}</Text>
              <Text style={styles.bookPrice}>
                {isOwned ? t.bookDetail.owned : formatRupiah(book.price)}
              </Text>
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

              {!isOwned ? (
                <Pressable
                  style={({ pressed }) => [
                    styles.buyButton,
                    { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
                  ]}
                  onPress={handleBuy}
                  accessibilityRole="button"
                  accessibilityLabel={t.bookDetail.buyA11yLabel(book.title, formatRupiah(book.price))}
                  accessibilityHint="Double tap to purchase this book"
                >
                  <Ionicons name="cart" size={22} color="#FFFFFF" />
                  <Text style={styles.buyText}>{t.bookDetail.buyBook}</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={({ pressed }) => [
                    styles.readButton,
                    { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
                  ]}
                  onPress={handlePreview}
                  accessibilityRole="button"
                  accessibilityLabel={t.bookDetail.readA11yLabel}
                  accessibilityHint={t.bookDetail.readA11yHint}
                >
                  <Ionicons name="book" size={22} color="#FFFFFF" />
                  <Text style={styles.buyText}>{t.bookDetail.readNow}</Text>
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
  bookPrice: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: Colors.studentPrimary,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  previewButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.voiceBarBg,
    borderRadius: 16,
    paddingVertical: 18,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    minHeight: 60,
  },
  previewText: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.primaryLight,
  },
  buyButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.studentPrimary,
    borderRadius: 16,
    paddingVertical: 18,
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
    paddingVertical: 18,
    minHeight: 60,
  },
  buyText: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#FFFFFF",
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
});
