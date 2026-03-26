import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState, useCallback } from "react";
import {
  AccessibilityInfo,
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
import { sampleBooks, voiceHints, findInstitutionByCode } from "@/constants/data";
import { useReadingPreferences } from "@/contexts/ReadingPreferences";
import { useVoiceActivation } from "@/contexts/VoiceActivation";
import { useT } from "@/hooks/useTranslation";
import { useTTSAnnounce } from "@/hooks/useTTSAnnounce";
import { speakText } from "@/services/speech";
import type { VoiceIntent } from "@/services/voiceRouter";

export default function InstitusiScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;
  const { isVoiceOnly, selectedVoice } = useReadingPreferences();
  const { onTranscription, clearTranscriptionCallback } = useVoiceActivation();
  const t = useT();

  const [joinedInstitution, setJoinedInstitution] = useState<{
    name: string;
    type: string;
    location: string;
    admin: string;
    studentCount: number;
    tier: string;
  } | null>(null);

  const [institutionCode, setInstitutionCode] = useState("");
  const institutionBookIds = joinedInstitution ? ["5", "6", "9"] : [];

  const announceText = joinedInstitution
    ? t.institution.mountAnnounceRegistered(joinedInstitution.name)
    : t.institution.mountAnnounceNotRegistered;
  useTTSAnnounce(announceText);

  const tryJoinWithCode = React.useCallback((code: string) => {
    const institution = findInstitutionByCode(code);
    if (institution) {
      setJoinedInstitution({
        name: institution.name,
        type: institution.type,
        location: institution.location,
        admin: institution.admin,
        studentCount: institution.studentCount,
        tier: institution.tier,
      });
      setInstitutionCode("");
      const msg = t.institution.joinSuccess(institution.name);
      AccessibilityInfo.announceForAccessibility(msg);
      speakText(msg, selectedVoice, 1).catch(() => {});
    } else {
      const msg = t.institution.invalidCode(code);
      AccessibilityInfo.announceForAccessibility(msg);
      speakText(msg, selectedVoice, 1).catch(() => {});
    }
  }, [t, selectedVoice]);

  useFocusEffect(useCallback(() => {
    onTranscription((_text: string, intent: VoiceIntent, param?: string) => {
      if (intent === "repeat_commands") {
        const msg = joinedInstitution
          ? t.institution.pageCommandsRegistered
          : t.institution.pageCommandsNotRegistered;
        AccessibilityInfo.announceForAccessibility(msg);
        speakText(msg, selectedVoice, 1).catch(() => {});
        return true;
      }
      if (intent === "join_institution_code" && param) {
        if (joinedInstitution) {
          const msg = t.institution.alreadyRegistered(joinedInstitution.name);
          AccessibilityInfo.announceForAccessibility(msg);
          speakText(msg, selectedVoice, 1).catch(() => {});
        } else {
          tryJoinWithCode(param);
        }
        return true;
      }
      return false;
    });
    return () => clearTranscriptionCallback();
  }, [selectedVoice, t, joinedInstitution, tryJoinWithCode]));

  const handleJoinRequest = () => {
    if (!institutionCode.trim()) {
      AccessibilityInfo.announceForAccessibility(t.institution.codeEmpty);
      return;
    }
    tryJoinWithCode(institutionCode.trim());
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
              accessibilityLabel={t.institution.backA11yLabel}
              accessibilityHint="Double tap to go back to home"
            >
              <Feather name="arrow-left" size={28} color={Colors.text} />
            </Pressable>
            <Text style={styles.headerTitle} accessibilityRole="header">{t.institution.title}</Text>
            <View style={{ width: 48 }} />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {joinedInstitution ? (
              <>
                <View style={styles.infoCard}>
                  <View style={styles.infoHeader}>
                    <View style={styles.institutionIconCircle}>
                      <Ionicons name="school" size={28} color="#FFFFFF" />
                    </View>
                    <View style={styles.infoHeaderText}>
                      <Text style={styles.institutionName}>{joinedInstitution.name}</Text>
                      <View style={styles.statusBadge}>
                        <Ionicons name="checkmark-circle" size={16} color={Colors.studentPrimary} />
                        <Text style={styles.statusText}>{t.institution.activeMember}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.detailsGrid}>
                    <View style={styles.detailRow}>
                      <Ionicons name="business" size={20} color={Colors.textSecondary} />
                      <Text style={styles.detailLabel}>{t.institution.typeLabel}</Text>
                      <Text style={styles.detailValue}>{joinedInstitution.type}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="location" size={20} color={Colors.textSecondary} />
                      <Text style={styles.detailLabel}>{t.institution.locationLabel}</Text>
                      <Text style={styles.detailValue}>{joinedInstitution.location}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="person" size={20} color={Colors.textSecondary} />
                      <Text style={styles.detailLabel}>{t.institution.adminLabel}</Text>
                      <Text style={styles.detailValue}>{joinedInstitution.admin}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="people" size={20} color={Colors.textSecondary} />
                      <Text style={styles.detailLabel}>{t.institution.studentsLabel}</Text>
                      <Text style={styles.detailValue}>{joinedInstitution.studentCount}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="ribbon" size={20} color={Colors.textSecondary} />
                      <Text style={styles.detailLabel}>{t.institution.tierLabel}</Text>
                      <Text style={styles.detailValue}>{joinedInstitution.tier}</Text>
                    </View>
                  </View>
                </View>

                {institutionBookIds.length > 0 && (
                  <View style={styles.booksSection}>
                    <Text style={styles.sectionTitle} accessibilityRole="header">
                      {t.institution.assignedBooks}
                    </Text>
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
                          accessibilityLabel={`${item!.title} by ${item!.author}. ${t.institution.freeAccess}`}
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
                  </View>
                )}
              </>
            ) : (
              <View style={styles.notRegisteredSection}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="school-outline" size={48} color={Colors.borderStrong} />
                </View>
                <Text style={styles.notRegisteredTitle}>{t.institution.notRegistered}</Text>
                <Text style={styles.notRegisteredDesc}>{t.institution.notRegisteredDesc}</Text>

                <View style={styles.joinSection}>
                  <Text style={styles.joinTitle}>{t.institution.joinTitle}</Text>
                  <Text style={styles.joinDesc}>{t.institution.joinDesc}</Text>

                  <View style={styles.joinInputRow}>
                    <TextInput
                      style={styles.joinInput}
                      placeholder={t.institution.codePlaceholder}
                      placeholderTextColor={Colors.borderStrong}
                      value={institutionCode}
                      onChangeText={setInstitutionCode}
                      autoCapitalize="characters"
                      accessibilityLabel={t.institution.codeLabel}
                      accessibilityHint="Enter the institution code provided by your school"
                    />
                    <Pressable
                      style={({ pressed }) => [
                        styles.joinButton,
                        { opacity: pressed ? 0.85 : 1 },
                      ]}
                      onPress={handleJoinRequest}
                      accessibilityRole="button"
                      accessibilityLabel={t.institution.requestButton}
                      accessibilityHint="Double tap to send a join request to the institution"
                    >
                      <Text style={styles.joinButtonText}>{t.institution.requestButton}</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </View>

        <SwipeHintBar hints={voiceHints.institusi} />
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
  infoCard: {
    backgroundColor: Colors.voiceBarBg,
    borderRadius: 18,
    padding: 20,
    gap: 20,
    borderWidth: 2,
    borderColor: "#E65100",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  institutionIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E65100",
    alignItems: "center",
    justifyContent: "center",
  },
  infoHeaderText: {
    flex: 1,
    gap: 4,
  },
  institutionName: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: Colors.text,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.studentPrimary,
  },
  detailsGrid: {
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  detailLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.textSecondary,
    width: 80,
  },
  detailValue: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: Colors.text,
    flex: 1,
  },
  booksSection: {
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
  notRegisteredSection: {
    alignItems: "center",
    gap: 16,
    paddingTop: 40,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.border,
  },
  notRegisteredTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: Colors.text,
    textAlign: "center",
  },
  notRegisteredDesc: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 12,
  },
  joinSection: {
    width: "100%",
    backgroundColor: Colors.voiceBarBg,
    borderRadius: 18,
    padding: 20,
    gap: 12,
    marginTop: 8,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  joinTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.text,
  },
  joinDesc: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  joinInputRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
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
    fontSize: 16,
    color: "#FFFFFF",
  },
  freezeZone: {
    flex: 1,
  },
  frozen: {
    opacity: 0.5,
  },
});
