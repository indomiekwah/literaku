import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
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
import { voiceHints, subscriptionPlansInfo } from "@/constants/data";
import { useReadingPreferences } from "@/contexts/ReadingPreferences";
import { useVoiceActivation } from "@/contexts/VoiceActivation";
import { useT } from "@/hooks/useTranslation";
import { useTTSAnnounce } from "@/hooks/useTTSAnnounce";
import { speakText } from "@/services/speech";
import type { VoiceIntent } from "@/services/voiceRouter";

export default function SubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;
  const t = useT();
  const { subscriptionPlan, setSubscriptionPlan, isVoiceOnly, selectedVoice, language } = useReadingPreferences();
  const { onTranscription, clearTranscriptionCallback } = useVoiceActivation();

  useTTSAnnounce(t.subscription.mountAnnounce(subscriptionPlan));

  React.useEffect(() => {
    onTranscription((text: string, intent: VoiceIntent) => {
      if (intent === "repeat_commands") {
        AccessibilityInfo.announceForAccessibility(t.subscription.pageCommands);
        speakText(t.subscription.pageCommands, selectedVoice, 1).catch(() => {});
        return true;
      }
      if (intent === "nav_subscription") {
        const lower = text.toLowerCase();
        if (lower.includes("premium")) {
          setSubscriptionPlan("premium");
          const msg = t.subscription.planChanged("Premium");
          AccessibilityInfo.announceForAccessibility(msg);
          speakText(msg, selectedVoice, 1).catch(() => {});
          return true;
        } else if (lower.includes("free")) {
          setSubscriptionPlan("free");
          const msg = t.subscription.planChanged("Free");
          AccessibilityInfo.announceForAccessibility(msg);
          speakText(msg, selectedVoice, 1).catch(() => {});
          return true;
        }
      }
      return false;
    });
    return () => clearTranscriptionCallback();
  }, [selectedVoice, language]);

  const handleSubscribe = (planId: string) => {
    if (planId === "premium") {
      setSubscriptionPlan("premium");
      const msg = t.subscription.planChanged("Premium");
      AccessibilityInfo.announceForAccessibility(msg);
      speakText(msg, selectedVoice, 1).catch(() => {});
    } else {
      setSubscriptionPlan("free");
      const msg = t.subscription.planChanged("Free");
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
              accessibilityLabel={t.subscription.backA11yLabel}
              accessibilityHint="Double tap to go back"
            >
              <Feather name="arrow-left" size={32} color={Colors.text} />
            </Pressable>
            <Text style={styles.headerTitle} accessibilityRole="header">{t.subscription.title}</Text>
            <View style={{ width: 56 }} />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.currentPlanBanner}>
              <Ionicons
                name={subscriptionPlan === "premium" ? "checkmark-circle" : "information-circle"}
                size={28}
                color={subscriptionPlan === "premium" ? Colors.studentPrimary : "#E65100"}
              />
              <View style={styles.currentPlanInfo}>
                <Text style={styles.currentPlanLabel}>{t.subscription.currentPlan}</Text>
                <Text style={styles.currentPlanName}>
                  {subscriptionPlan === "premium" ? t.subscription.premiumPlan : t.subscription.freePlan}
                </Text>
              </View>
            </View>

            {subscriptionPlansInfo.map((plan) => {
              const isCurrent = plan.id === subscriptionPlan;
              return (
                <View
                  key={plan.id}
                  style={[styles.planCard, isCurrent && styles.planCardActive]}
                  accessible
                  accessibilityRole="text"
                  accessibilityLabel={`${plan.name} plan. ${plan.price}. ${isCurrent ? "Current plan" : "Available"}`}
                >
                  <View style={styles.planHeader}>
                    <Text style={[styles.planName, isCurrent && styles.planNameActive]}>{plan.name}</Text>
                    <Text style={[styles.planPrice, isCurrent && styles.planPriceActive]}>{plan.price}</Text>
                  </View>

                  <Text style={styles.planDesc}>
                    {plan.id === "premium" ? t.subscription.premiumDesc : t.subscription.freeDesc}
                  </Text>

                  <View style={styles.featureList}>
                    {plan.features.map((feature, idx) => (
                      <View key={idx} style={styles.featureRow}>
                        <Ionicons name="checkmark-circle" size={20} color={isCurrent ? Colors.studentPrimary : Colors.textSecondary} />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>

                  {!isCurrent && (
                    <Pressable
                      style={({ pressed }) => [
                        styles.subscribeButton,
                        plan.id === "premium" ? styles.premiumButton : styles.freeButton,
                        { opacity: pressed ? 0.85 : 1 },
                      ]}
                      onPress={() => handleSubscribe(plan.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`${plan.id === "premium" ? "Subscribe to Premium" : "Switch to Free"}`}
                      accessibilityHint="Double tap to change your plan"
                    >
                      <Text style={[styles.subscribeButtonText, plan.id !== "premium" && styles.freeButtonText]}>
                        {plan.id === "premium" ? t.subscription.subscribe : "Switch to Free"}
                      </Text>
                    </Pressable>
                  )}

                  {isCurrent && (
                    <View style={styles.currentBadge}>
                      <Ionicons name="checkmark" size={20} color={Colors.studentPrimary} />
                      <Text style={styles.currentBadgeText}>{t.subscription.currentPlan}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>

        <SwipeHintBar hints={voiceHints.subscription} />
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    color: Colors.text,
    flex: 1,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
    gap: 16,
  },
  currentPlanBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  currentPlanInfo: {
    flex: 1,
    gap: 2,
  },
  currentPlanLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: Colors.textSecondary,
  },
  currentPlanName: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: Colors.text,
  },
  planCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: 14,
  },
  planCardActive: {
    borderColor: Colors.studentPrimary,
    backgroundColor: Colors.successLight,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planName: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: Colors.text,
  },
  planNameActive: {
    color: Colors.studentPrimary,
  },
  planPrice: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: Colors.textSecondary,
  },
  planPriceActive: {
    color: Colors.studentPrimary,
  },
  planDesc: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  featureList: {
    gap: 8,
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
  subscribeButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    minHeight: 56,
    justifyContent: "center",
  },
  premiumButton: {
    backgroundColor: Colors.studentPrimary,
  },
  freeButton: {
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  subscribeButtonText: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: "#FFFFFF",
  },
  freeButtonText: {
    color: Colors.text,
  },
  currentBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  currentBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.studentPrimary,
  },
  freezeZone: {
    flex: 1,
  },
  frozen: {
    opacity: 0.5,
  },
});
