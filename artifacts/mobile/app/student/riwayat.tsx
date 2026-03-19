import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  AccessibilityInfo,
  Alert,
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
import { sampleBooks, sampleHistory, sampleBookmarks, voiceHints } from "@/constants/data";
import { useReadingPreferences } from "@/contexts/ReadingPreferences";
import { useT } from "@/hooks/useTranslation";

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
  const { isVoiceOnly, setIsSubscribed } = useReadingPreferences();
  const [tokenCode, setTokenCode] = useState("");
  const t = useT();

  const recentBookIds = sampleHistory.map((h) => h.bookId);
  const bookmarkedBookIds = sampleBookmarks.map((b) => b.bookId);
  const institutionBookIds = ["5", "6", "9"];

  React.useEffect(() => {
    AccessibilityInfo.announceForAccessibility(t.history.mountAnnounce);
  }, []);

  const handleRedeemToken = () => {
    if (!tokenCode.trim()) {
      AccessibilityInfo.announceForAccessibility(t.history.tokenEmpty);
      return;
    }
    Alert.alert(
      t.history.tokenSuccess,
      t.history.tokenSuccessMsg(tokenCode),
      [{
        text: "OK",
        onPress: () => {
          setIsSubscribed(true);
        },
      }]
    );
    AccessibilityInfo.announceForAccessibility(t.history.tokenRedeemed);
    setTokenCode("");
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
            <View style={styles.redeemSection}>
              <View style={styles.redeemHeader}>
                <Ionicons name="gift" size={24} color={Colors.primaryLight} />
                <Text style={styles.redeemTitle} accessibilityRole="header">{t.history.redeemToken}</Text>
              </View>
              <Text style={styles.redeemDesc}>{t.history.redeemDesc}</Text>
              <View style={styles.redeemInputRow}>
                <TextInput
                  style={styles.redeemInput}
                  placeholder={t.history.tokenPlaceholder}
                  placeholderTextColor={Colors.borderStrong}
                  value={tokenCode}
                  onChangeText={setTokenCode}
                  autoCapitalize="characters"
                  accessibilityLabel="Token code"
                  accessibilityHint="Enter the token code from your institution"
                />
                <Pressable
                  style={({ pressed }) => [
                    styles.redeemButton,
                    { opacity: pressed ? 0.85 : 1 },
                  ]}
                  onPress={handleRedeemToken}
                  accessibilityRole="button"
                  accessibilityLabel="Submit token"
                  accessibilityHint="Double tap to redeem the token code"
                >
                  <Text style={styles.redeemButtonText}>{t.history.redeemButton}</Text>
                </Pressable>
              </View>
            </View>

            <HorizontalBookRow bookIds={recentBookIds} label={t.history.recentlyRead} />
            <HorizontalBookRow bookIds={bookmarkedBookIds} label={t.history.bookmarked} />
            <HorizontalBookRow bookIds={institutionBookIds} label={t.history.fromInstitution} />
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
  redeemSection: {
    backgroundColor: Colors.voiceBarBg,
    borderRadius: 18,
    padding: 20,
    gap: 12,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
  },
  redeemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  redeemTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.primaryLight,
  },
  redeemDesc: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  redeemInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  redeemInput: {
    flex: 1,
    minWidth: 0,
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.text,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    minHeight: 56,
  },
  redeemButton: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    flexShrink: 0,
  },
  redeemButtonText: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#FFFFFF",
  },
  freezeZone: {
    flex: 1,
  },
  frozen: {
    opacity: 0.5,
  },
});
