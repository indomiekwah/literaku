import { useCallback } from "react";
import { AccessibilityInfo } from "react-native";
import { useFocusEffect } from "expo-router";
import { speakText, stopTTSPlayback } from "@/services/speech";
import { useReadingPreferences } from "@/contexts/ReadingPreferences";

const ANNOUNCE_SPEED = 1;

export function useTTSAnnounce(text: string) {
  const { selectedVoice } = useReadingPreferences();

  useFocusEffect(
    useCallback(() => {
      if (!text) return;

      AccessibilityInfo.announceForAccessibility(text);

      const timer = setTimeout(() => {
        speakText(text, selectedVoice, ANNOUNCE_SPEED).catch((err) => {
          console.warn('[useTTSAnnounce] TTS failed:', err?.message);
        });
      }, 300);

      return () => {
        clearTimeout(timer);
        stopTTSPlayback();
      };
    }, [text, selectedVoice])
  );
}
