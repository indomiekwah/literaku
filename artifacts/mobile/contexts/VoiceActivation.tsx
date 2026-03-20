import React, { createContext, useContext, useCallback, useState, useRef } from "react";
import { AccessibilityInfo, Platform } from "react-native";
import { AudioRecorder, speechToText } from "@/services/speech";
import { speakText } from "@/services/speech";
import { useReadingPreferences, type SpeedValue } from "@/contexts/ReadingPreferences";

const SPEED_MAP: Record<string, SpeedValue> = {
  "1": 0.75,
  "2": 1,
  "3": 1.25,
  "4": 1.5,
  "5": 2,
};

function parseVoiceCommand(text: string, setSpeed: (s: SpeedValue) => void, selectedVoice: string): boolean {
  const lower = text.toLowerCase().replace(/[.,!?]/g, "").trim();

  const speedMatch = lower.match(/speed\s*(\d)/i) || lower.match(/kecepatan\s*(\d)/i);
  if (speedMatch) {
    const level = speedMatch[1];
    const mapped = SPEED_MAP[level];
    if (mapped) {
      setSpeed(mapped);
      const msg = `Speed set to level ${level}`;
      AccessibilityInfo.announceForAccessibility(msg);
      if (Platform.OS === "web") {
        speakText(msg, selectedVoice, 0.85).catch(() => {});
      }
      return true;
    }
  }

  return false;
}

interface VoiceActivationContextType {
  activateVoice: () => void;
  dismissVoice: () => void;
  isVoiceActive: boolean;
  isListening: boolean;
  transcribedText: string;
  onTranscription: (callback: (text: string) => void) => void;
}

const VoiceActivationContext = createContext<VoiceActivationContextType>({
  activateVoice: () => {},
  dismissVoice: () => {},
  isVoiceActive: false,
  isListening: false,
  transcribedText: "",
  onTranscription: () => {},
});

export function VoiceActivationProvider({ children }: { children: React.ReactNode }) {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const recorderRef = useRef<AudioRecorder | null>(null);
  const callbackRef = useRef<((text: string) => void) | null>(null);
  const listenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { setSpeed, selectedVoice } = useReadingPreferences();

  const stopRecording = useCallback(async () => {
    if (!recorderRef.current) return;
    try {
      const audioBlob = await recorderRef.current.stop();
      recorderRef.current = null;
      setIsListening(false);

      const lang = "en-US";
      const result = await speechToText(audioBlob, lang);

      if (result.RecognitionStatus === "Success" && result.DisplayText) {
        const text = result.DisplayText;
        setTranscribedText(text);
        AccessibilityInfo.announceForAccessibility(`You said: ${text}`);

        const handled = parseVoiceCommand(text, setSpeed, selectedVoice);

        if (!handled && callbackRef.current) {
          callbackRef.current(text);
        }
      } else {
        AccessibilityInfo.announceForAccessibility("Could not understand. Please try again.");
      }
    } catch (err) {
      console.error("STT error:", err);
      setIsListening(false);
      AccessibilityInfo.announceForAccessibility("Voice recognition failed. Please try again.");
    }
  }, [setSpeed, selectedVoice]);

  const startRecording = useCallback(async () => {
    if (Platform.OS !== "web") return;
    try {
      const recorder = new AudioRecorder();
      recorderRef.current = recorder;
      await recorder.start();
      setIsListening(true);

      listenTimeoutRef.current = setTimeout(() => {
        stopRecording();
      }, 7000);
    } catch (err) {
      console.error("Mic access error:", err);
      AccessibilityInfo.announceForAccessibility("Microphone access denied. Please allow microphone access.");
    }
  }, [stopRecording]);

  const activateVoice = useCallback(() => {
    setIsVoiceActive(true);
    setTranscribedText("");
    startRecording();
  }, [startRecording]);

  const dismissVoice = useCallback(() => {
    if (listenTimeoutRef.current) {
      clearTimeout(listenTimeoutRef.current);
      listenTimeoutRef.current = null;
    }
    if (recorderRef.current) {
      if (isListening) {
        stopRecording();
      } else {
        recorderRef.current.cancel();
        recorderRef.current = null;
      }
    }
    setIsVoiceActive(false);
    setIsListening(false);
  }, [isListening, stopRecording]);

  const onTranscription = useCallback((callback: (text: string) => void) => {
    callbackRef.current = callback;
  }, []);

  return (
    <VoiceActivationContext.Provider
      value={{ activateVoice, dismissVoice, isVoiceActive, isListening, transcribedText, onTranscription }}
    >
      {children}
    </VoiceActivationContext.Provider>
  );
}

export function useVoiceActivation() {
  return useContext(VoiceActivationContext);
}
