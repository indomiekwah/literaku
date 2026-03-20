import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { speakText, stopTTSPlayback } from "@/services/speech";
import { useReadingPreferences } from "@/contexts/ReadingPreferences";

export function useTTSAnnounce(text: string) {
  const { selectedVoice, speed } = useReadingPreferences();
  const lastTextRef = useRef("");

  useEffect(() => {
    if (Platform.OS !== "web" || !text || text === lastTextRef.current) return;
    lastTextRef.current = text;

    const timer = setTimeout(() => {
      speakText(text, selectedVoice, speed).catch(() => {});
    }, 500);

    return () => {
      clearTimeout(timer);
      stopTTSPlayback();
    };
  }, [text, selectedVoice, speed]);
}
