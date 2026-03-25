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
import { useTTSAnnounce } from "@/hooks/useTTSAnnounce";

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
  const [institutionCode, setInstitutionCode] = useState("");
  const [joinedInstitution, setJoinedInstitution] = useState<string | null>("SMAN 5 Jakarta");
  const t = useT();

  const recentBookIds = sampleHistory.map((h) => h.bookId);
  const bookmarkedBookIds = sampleBookmarks.map((b) => b.bookId);
  const institutionBookIds = joinedInstitution ? ["5", "6", "9"] : [];

  useTTSAnnounce(t.history.mountAnnounce);

  const handleJoinInstitution = () => {
    if (!institutionCode.trim()) {
      AccessibilityInfo.announceForAccessibility(t.history.joinCodeEmpty);
      return;
    }
    const mockInstitutionName = "SMAN 5 Jakarta";
    Alert.alert(
      t.history.joinSuccess,
      t.history.joinSuccessMsg(mockInstitutionName),
      [{
        text: "OK",
        onPress: () => {
          setJoinedInstitution(mockInstitutionName);
          setIsSubscribed(true);
        },
      }]
    );
    AccessibilityInfo.announceForAccessibility(t.history.joinedAnnounce);
    setInstitutionCode("");
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
            <View style={styles.institutionSection}>
              <View style={styles.institutionHeader}>
                <View style={styles.institutionIconCircle}>
                  <Ionicons name="school" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.institutionHeaderText}>
                  <Text style={styles.institutionTitle} accessibilityRole="header">
                    {t.history.fromInstitution}
                  </Text>
                  <Text style={styles.institutionDesc}>{t.history.fromInstitutionDesc}</Text>
                </View>
              </View>

              {joinedInstitution ? (
                <View style={styles.joinedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.studentPrimary} />
                  <Text style={styles.joinedText}>{joinedInstitution}</Text>
                </View>
              ) : (
                <View style={styles.joinInputRow}>
                  <TextInput
                    style={styles.joinInput}
                    placeholder={t.history.joinInstitutionCodePlaceholder}
                    placeholderTextColor={Colors.borderStrong}
                    value={institutionCode}
                    onChangeText={setInstitutionCode}
                    autoCapitalize="characters"
                    accessibilityLabel={t.history.joinInstitutionCode}
                    accessibilityHint="Enter the code from your school or institution"
                  />
                  <Pressable
                    style={({ pressed }) => [
                      styles.joinButton,
                      { opacity: pressed ? 0.85 : 1 },
                    ]}
                    onPress={handleJoinInstitution}
                    accessibilityRole="button"
                    accessibilityLabel={t.history.joinButton}
                    accessibilityHint="Double tap to join the institution"
                  >
                    <Text style={styles.joinButtonText}>{t.history.joinButton}</Text>
                  </Pressable>
                </View>
              )}

              {institutionBookIds.length > 0 ? (
                <FlatList
                  horizontal
                  data={institutionBookIds.map((id) => sampleBooks.find((b) => b.id === id)).filter(Boolean)}
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
                      accessibilityLabel={`${item!.title} by ${item!.author}. Assigned by ${joinedInstitution}`}
                      accessibilityHint="Double tap to read this book for free"
                    >
                      <View style={[styles.bookCover, { backgroundColor: item!.coverColor }]}>
                        <Ionicons name="book" size={24} color="#FFFFFF" />
                        <View style={styles.freeBadge}>
                          <Text style={styles.freeBadgeText}>FREE</Text>
                        </View>
                      </View>
                      <Text style={styles.bookThumbTitle} numberOfLines={2}>{item!.title}</Text>
                    </Pressable>
                  )}
                />
              ) : (
                <View style={styles.emptyInstitution}>
                  <Ionicons name="library-outline" size={32} color={Colors.borderStrong} />
                  <Text style={styles.emptyTitle}>{t.history.noInstitutionBooks}</Text>
                  <Text style={styles.emptySub}>{t.history.noInstitutionBooksSub}</Text>
                </View>
              )}
            </View>

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
  institutionSection: {
    backgroundColor: Colors.voiceBarBg,
    borderRadius: 18,
    padding: 20,
    gap: 16,
    borderWidth: 2,
    borderColor: "#E65100",
  },
  institutionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  institutionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E65100",
    alignItems: "center",
    justifyContent: "center",
  },
  institutionHeaderText: {
    flex: 1,
    gap: 2,
  },
  institutionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: "#E65100",
  },
  institutionDesc: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.textSecondary,
  },
  joinedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(46,125,50,0.1)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(46,125,50,0.3)",
  },
  joinedText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.studentPrimary,
  },
  joinInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  joinInput: {
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
  joinButton: {
    backgroundColor: "#E65100",
    borderRadius: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    flexShrink: 0,
  },
  joinButtonText: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#FFFFFF",
  },
  freeBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: Colors.studentPrimary,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  freeBadgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 9,
    color: "#FFFFFF",
  },
  emptyInstitution: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
  },
  emptyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.textSecondary,
  },
  emptySub: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.borderStrong,
    textAlign: "center",
  },
  freezeZone: {
    flex: 1,
  },
  frozen: {
    opacity: 0.5,
  },
});
