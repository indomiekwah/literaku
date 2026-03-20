import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { speakText, stopTTSPlayback } from "@/services/speech";
import { useReadingPreferences } from "@/contexts/ReadingPreferences";

const ANNOUNCE_SPEED = 0.85;

export function useTTSAnnounce(text: string) {
  const { selectedVoice } = useReadingPreferences();
  const lastTextRef = useRef("");

  useEffect(() => {
    if (Platform.OS !== "web" || !text || text === lastTextRef.current) return;
    lastTextRef.current = text;

    const timer = setTimeout(() => {
      speakText(text, selectedVoice, ANNOUNCE_SPEED).catch(() => {});
    }, 500);

    return () => {
      clearTimeout(timer);
      stopTTSPlayback();
    };
  }, [text, selectedVoice]);
}
