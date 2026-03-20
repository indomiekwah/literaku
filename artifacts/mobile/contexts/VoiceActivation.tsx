import React, { createContext, useContext, useCallback, useState, useRef } from "react";
import { AccessibilityInfo, Platform } from "react-native";
import { AudioRecorder, speechToText, speechToTextFromUri } from "@/services/speech";
import { speakText } from "@/services/speech";
import { useReadingPreferences, type SpeedValue } from "@/contexts/ReadingPreferences";
import { matchVoiceIntent, executeGlobalNavigation, type VoiceIntent } from "@/services/voiceRouter";

const SPEED_MAP: Record<string, SpeedValue> = {
  "1": 0.5,
  "2": 0.75,
  "3": 1,
  "4": 1.25,
  "5": 1.5,
};

interface VoiceActivationContextType {
  activateVoice: () => void;
  dismissVoice: () => void;
  isVoiceActive: boolean;
  isListening: boolean;
  transcribedText: string;
  onTranscription: (callback: (text: string, intent: VoiceIntent, param?: string) => void) => void;
  clearTranscriptionCallback: () => void;
}

const VoiceActivationContext = createContext<VoiceActivationContextType>({
  activateVoice: () => {},
  dismissVoice: () => {},
  isVoiceActive: false,
  isListening: false,
  transcribedText: "",
  onTranscription: () => {},
  clearTranscriptionCallback: () => {},
});

export function VoiceActivationProvider({ children }: { children: React.ReactNode }) {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const recorderRef = useRef<AudioRecorder | null>(null);
  const callbackRef = useRef<((text: string, intent: VoiceIntent, param?: string) => void) | null>(null);
  const listenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { setSpeed, selectedVoice, language } = useReadingPreferences();

  const stopRecording = useCallback(async () => {
    if (!recorderRef.current) return;
    try {
      const audioData = await recorderRef.current.stop();
      recorderRef.current = null;
      setIsListening(false);

      const lang = language === "id" ? "id-ID" : "en-US";
      console.log(`VoiceActivation: sending audio for STT, type=${typeof audioData}, lang=${lang}`);

      const result = typeof audioData === "string"
        ? await speechToTextFromUri(audioData, lang)
        : await speechToText(audioData, lang);

      console.log(`VoiceActivation: STT result status=${result.RecognitionStatus}`);
      const displayText = result.DisplayText || result.NBest?.[0]?.Display || "";

      if (result.RecognitionStatus === "Success" && displayText) {
        const text = displayText;
        setTranscribedText(text);
        AccessibilityInfo.announceForAccessibility(`You said: ${text}`);

        const { intent, param } = matchVoiceIntent(text);
        console.log(`Voice intent: ${intent}, param: ${param}, text: ${text}`);

        if (intent === "speed_change" && param) {
          const mapped = SPEED_MAP[param];
          if (mapped) {
            setSpeed(mapped);
            const msg = `Speed set to level ${param}`;
            AccessibilityInfo.announceForAccessibility(msg);
            speakText(msg, selectedVoice, 0.5).catch(() => {});
            setIsVoiceActive(false);
            return;
          }
        }

        if (callbackRef.current) {
          const handled = callbackRef.current(text, intent, param);
        }

        const globalHandled = executeGlobalNavigation(intent, selectedVoice);
        if (globalHandled) {
          setIsVoiceActive(false);
          return;
        }

        if (intent === "unknown") {
          const msg = language === "id"
            ? "Maaf, saya tidak mengerti. Coba lagi."
            : "Sorry, I didn't understand that. Please try again.";
          AccessibilityInfo.announceForAccessibility(msg);
          speakText(msg, selectedVoice, 0.5).catch(() => {});
        }

        setTimeout(() => setIsVoiceActive(false), 2000);
      } else {
        const msg = language === "id"
          ? "Tidak terdengar suara. Coba lagi."
          : "Could not understand. Please try again.";
        AccessibilityInfo.announceForAccessibility(msg);
        speakText(msg, selectedVoice, 0.5).catch(() => {});
        setTimeout(() => setIsVoiceActive(false), 2000);
      }
    } catch (err) {
      console.error("STT error:", err);
      setIsListening(false);
      AccessibilityInfo.announceForAccessibility("Voice recognition failed. Please try again.");
      setTimeout(() => setIsVoiceActive(false), 2000);
    }
  }, [setSpeed, selectedVoice, language]);

  const startRecording = useCallback(async () => {
    try {
      const recorder = new AudioRecorder();
      recorderRef.current = recorder;
      await recorder.start();
      setIsListening(true);

      listenTimeoutRef.current = setTimeout(() => {
        stopRecording();
      }, 7000);
    } catch (err: any) {
      console.error("Mic access error:", err);
      const msg = language === "id"
        ? "Akses mikrofon ditolak. Izinkan akses mikrofon di pengaturan browser."
        : "Microphone access denied. Please allow microphone access in browser settings.";
      setTranscribedText(msg);
      AccessibilityInfo.announceForAccessibility(msg);
      speakText(msg, selectedVoice, 0.5).catch(() => {});
      setTimeout(() => {
        setIsVoiceActive(false);
        setTranscribedText("");
      }, 3000);
    }
  }, [stopRecording, language, selectedVoice]);

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
      recorderRef.current.cancel();
      recorderRef.current = null;
    }
    setIsVoiceActive(false);
    setIsListening(false);
    setTranscribedText("");
  }, []);

  const onTranscription = useCallback((callback: (text: string, intent: VoiceIntent, param?: string) => void) => {
    callbackRef.current = callback;
  }, []);

  const clearTranscriptionCallback = useCallback(() => {
    callbackRef.current = null;
  }, []);

  return (
    <VoiceActivationContext.Provider
      value={{ activateVoice, dismissVoice, isVoiceActive, isListening, transcribedText, onTranscription, clearTranscriptionCallback }}
    >
      {children}
    </VoiceActivationContext.Provider>
  );
}

export function useVoiceActivation() {
  return useContext(VoiceActivationContext);
}
