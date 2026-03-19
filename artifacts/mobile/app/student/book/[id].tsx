import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  AccessibilityInfo,
  Alert,
  Image,
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
import { sampleBooks, subscriptionPlans, formatRupiah, voiceHints } from "@/constants/data";
import { useReadingPreferences } from "@/contexts/ReadingPreferences";
import { useT } from "@/hooks/useTranslation";

export default function BookDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;
  const { isVoiceOnly, isSubscribed, setIsSubscribed } = useReadingPreferences();
  const [showSubscription, setShowSubscription] = useState(false);
  const [selectedPlanType, setSelectedPlanType] = useState<"monthly" | "yearly">("monthly");
  const t = useT();

  const book = sampleBooks.find((b) => b.id === id);

  React.useEffect(() => {
    if (book) {
      AccessibilityInfo.announceForAccessibility(
        t.bookDetail.mountAnnounce(book.title, book.author, book.genre)
      );
    }
  }, [book?.title]);

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

  const handleSubscribe = () => {
    setShowSubscription(true);
    AccessibilityInfo.announceForAccessibility(t.subscription.subtitle);
  };

  const handleConfirmSubscription = () => {
    const plan = subscriptionPlans[0];
    const price = selectedPlanType === "monthly"
      ? formatRupiah(plan.priceMonthly)
      : formatRupiah(plan.priceYearly);

    Alert.alert(
      t.subscription.successTitle,
      t.subscription.successMsg,
      [
        {
          text: "OK",
          onPress: () => {
            setIsSubscribed(true);
            setShowSubscription(false);
            AccessibilityInfo.announceForAccessibility(t.subscription.successA11y);
          },
        },
      ]
    );
  };

  const handlePreview = () => {
    router.push({ pathname: "/student/reader/[id]", params: { id: book.id, preview: "true" } });
  };

  const handleRead = () => {
    router.push({ pathname: "/student/reader/[id]", params: { id: book.id } });
  };

  if (showSubscription) {
    const plan = subscriptionPlans[0];
    return (
      <SwipeVoiceWrapper>
        <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
          <StatusBar style="dark" />

          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={() => setShowSubscription(false)}
              accessibilityRole="button"
              accessibilityLabel={t.bookDetail.backA11yLabel}
            >
              <Feather name="arrow-left" size={28} color={Colors.text} />
            </Pressable>
            <Text style={styles.headerTitle} accessibilityRole="header">{t.subscription.title}</Text>
            <View style={{ width: 48 }} />
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.subHero}>
              <Ionicons name="diamond" size={48} color={Colors.primaryLight} />
              <Text style={styles.subHeroTitle}>{t.subscription.subtitle}</Text>
              <Text style={styles.subHeroDesc}>{t.subscription.description}</Text>
            </View>

            <View style={styles.planToggleRow}>
              <Pressable
                style={[styles.planToggle, selectedPlanType === "monthly" && styles.planToggleActive]}
                onPress={() => setSelectedPlanType("monthly")}
                accessibilityRole="radio"
                accessibilityState={{ selected: selectedPlanType === "monthly" }}
              >
                <Text style={[styles.planToggleText, selectedPlanType === "monthly" && styles.planToggleTextActive]}>
                  {t.subscription.monthly}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.planToggle, selectedPlanType === "yearly" && styles.planToggleActive]}
                onPress={() => setSelectedPlanType("yearly")}
                accessibilityRole="radio"
                accessibilityState={{ selected: selectedPlanType === "yearly" }}
              >
                <Text style={[styles.planToggleText, selectedPlanType === "yearly" && styles.planToggleTextActive]}>
                  {t.subscription.yearly}
                </Text>
                <View style={styles.saveBadge}>
                  <Text style={styles.saveBadgeText}>{t.subscription.savePercent(17)}</Text>
                </View>
              </Pressable>
            </View>

            <View style={styles.planCard}>
              <Text style={styles.planName}>{plan.name}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.planPrice}>
                  {formatRupiah(selectedPlanType === "monthly" ? plan.priceMonthly : plan.priceYearly)}
                </Text>
                <Text style={styles.planPeriod}>
                  {selectedPlanType === "monthly" ? t.subscription.perMonth : t.subscription.perYear}
                </Text>
              </View>

              <Text style={styles.featuresLabel}>{t.subscription.features}</Text>
              {plan.features.map((feature, idx) => (
                <View key={idx} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={22} color={Colors.studentPrimary} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}

              <Text style={styles.cancelText}>{t.subscription.cancelAnytime}</Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.subscribeButton,
                { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
              ]}
              onPress={handleConfirmSubscription}
              accessibilityRole="button"
              accessibilityLabel={t.subscription.subscribe}
            >
              <Ionicons name="diamond" size={22} color="#FFFFFF" />
              <Text style={styles.subscribeButtonText}>{t.subscription.subscribe}</Text>
            </Pressable>
          </ScrollView>

          <SwipeHintBar hints={voiceHints.bookDetail} />
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
              <Text style={styles.bookGenre}>{book.genre} · {book.category}</Text>
              <View style={styles.badgeRow}>
                {isSubscribed ? (
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

              {isSubscribed ? (
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
  subHero: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 20,
  },
  subHeroTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    color: Colors.text,
    textAlign: "center",
  },
  subHeroDesc: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 26,
  },
  planToggleRow: {
    flexDirection: "row",
    gap: 12,
  },
  planToggle: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    minHeight: 56,
    gap: 4,
  },
  planToggleActive: {
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.voiceBarBg,
  },
  planToggleText: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.textSecondary,
  },
  planToggleTextActive: {
    color: Colors.primaryLight,
  },
  saveBadge: {
    backgroundColor: Colors.studentPrimary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  saveBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: "#FFFFFF",
  },
  planCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 20,
    gap: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  planName: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: Colors.text,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  planPrice: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: Colors.studentPrimary,
  },
  planPeriod: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
  },
  featuresLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureText: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.text,
  },
  cancelText: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
  subscribeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#E65100",
    borderRadius: 16,
    paddingVertical: 20,
    minHeight: 64,
  },
  subscribeButtonText: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: "#FFFFFF",
  },
});
