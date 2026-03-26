import React, { createContext, useContext, useCallback, useState, useRef } from "react";
import { AccessibilityInfo, Platform } from "react-native";
import { AudioRecorder, speechToText, speechToTextFromUri, stopTTSPlayback as stopTTS } from "@/services/speech";
import { speakText } from "@/services/speech";
import { useReadingPreferences, type SpeedValue } from "@/contexts/ReadingPreferences";
import {
  matchVoiceIntent,
  executeGlobalNavigation,
  READER_ONLY_INTENTS,
  BOOK_DETAIL_ONLY_INTENTS,
  type VoiceIntent,
} from "@/services/voiceRouter";

const SPEED_MAP: Record<string, SpeedValue> = {
  "1": 0.5,
  "2": 0.75,
  "3": 1,
  "4": 1.25,
  "5": 1.5,
};

const SPEED_LEVELS: SpeedValue[] = [0.5, 0.75, 1, 1.25, 1.5];

type TranscriptionCallback = (text: string, intent: VoiceIntent, param?: string) => boolean | void;

interface VoiceActivationContextType {
  activateVoice: () => void;
  dismissVoice: () => void;
  isVoiceActive: boolean;
  isListening: boolean;
  transcribedText: string;
  onTranscription: (callback: TranscriptionCallback) => void;
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
  const callbackRef = useRef<TranscriptionCallback | null>(null);
  const listenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { speed, setSpeed, selectedVoice, language } = useReadingPreferences();

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

        const cluLang = language === "id" ? "id" : "en";
        const { intent, param, confidence, source } = await matchVoiceIntent(text, cluLang);
        console.log(`Voice intent: ${intent}, param: ${param}, confidence: ${confidence}, source: ${source}, text: ${text}`);

        if (intent === "speed_change" && param) {
          const mapped = SPEED_MAP[param];
          if (mapped) {
            setSpeed(mapped);
            const msg = language === "id"
              ? `Kecepatan diubah ke level ${param}`
              : `Speed set to level ${param}`;
            AccessibilityInfo.announceForAccessibility(msg);
            speakText(msg, selectedVoice, 1).catch(() => {});
            setIsVoiceActive(false);
            return;
          }
        }

        if (intent === "speed_increase") {
          const currentIdx = SPEED_LEVELS.indexOf(speed);
          if (currentIdx < SPEED_LEVELS.length - 1) {
            const newSpeed = SPEED_LEVELS[currentIdx + 1];
            setSpeed(newSpeed);
            const msg = language === "id"
              ? `Kecepatan dinaikkan ke ${newSpeed}x`
              : `Speed increased to ${newSpeed}x`;
            AccessibilityInfo.announceForAccessibility(msg);
            speakText(msg, selectedVoice, 1).catch(() => {});
          } else {
            const msg = language === "id"
              ? "Sudah di kecepatan maksimum"
              : "Already at maximum speed";
            AccessibilityInfo.announceForAccessibility(msg);
            speakText(msg, selectedVoice, 1).catch(() => {});
          }
          setIsVoiceActive(false);
          return;
        }

        if (intent === "speed_decrease") {
          const currentIdx = SPEED_LEVELS.indexOf(speed);
          if (currentIdx > 0) {
            const newSpeed = SPEED_LEVELS[currentIdx - 1];
            setSpeed(newSpeed);
            const msg = language === "id"
              ? `Kecepatan diturunkan ke ${newSpeed}x`
              : `Speed decreased to ${newSpeed}x`;
            AccessibilityInfo.announceForAccessibility(msg);
            speakText(msg, selectedVoice, 1).catch(() => {});
          } else {
            const msg = language === "id"
              ? "Sudah di kecepatan minimum"
              : "Already at minimum speed";
            AccessibilityInfo.announceForAccessibility(msg);
            speakText(msg, selectedVoice, 1).catch(() => {});
          }
          setIsVoiceActive(false);
          return;
        }

        if (callbackRef.current) {
          const handled = callbackRef.current(text, intent, param);
          if (handled === true) {
            dismissTimeoutRef.current = setTimeout(() => setIsVoiceActive(false), 1500);
            return;
          }
        }

        const globalHandled = executeGlobalNavigation(intent, selectedVoice, param, language);
        if (globalHandled) {
          setIsVoiceActive(false);
          return;
        }

        if (READER_ONLY_INTENTS.has(intent)) {
          const msg = language === "id"
            ? "Perintah ini hanya tersedia di halaman pembaca buku. Buka buku terlebih dahulu."
            : "This command is only available on the reader page. Open a book first.";
          AccessibilityInfo.announceForAccessibility(msg);
          speakText(msg, selectedVoice, 1).catch(() => {});
          dismissTimeoutRef.current = setTimeout(() => setIsVoiceActive(false), 2000);
          return;
        }

        if (BOOK_DETAIL_ONLY_INTENTS.has(intent)) {
          const msg = language === "id"
            ? "Perintah ini hanya tersedia di halaman detail buku."
            : "This command is only available on the book detail page.";
          AccessibilityInfo.announceForAccessibility(msg);
          speakText(msg, selectedVoice, 1).catch(() => {});
          dismissTimeoutRef.current = setTimeout(() => setIsVoiceActive(false), 2000);
          return;
        }

        if (intent === "unknown") {
          const msg = language === "id"
            ? "Maaf, saya tidak mengerti perintah tersebut. Untuk navigasi, ucapkan 'Buka' diikuti nama halaman, misalnya 'Buka pengaturan'."
            : "Sorry, I didn't understand that command. For navigation, say 'Open' followed by the page name, for example 'Open settings'.";
          AccessibilityInfo.announceForAccessibility(msg);
          speakText(msg, selectedVoice, 1).catch(() => {});
        }

        dismissTimeoutRef.current = setTimeout(() => setIsVoiceActive(false), 2000);
      } else {
        const msg = language === "id"
          ? "Tidak terdengar suara. Coba lagi."
          : "Could not understand. Please try again.";
        AccessibilityInfo.announceForAccessibility(msg);
        speakText(msg, selectedVoice, 1).catch(() => {});
        dismissTimeoutRef.current = setTimeout(() => setIsVoiceActive(false), 2000);
      }
    } catch (err) {
      console.error("STT error:", err);
      setIsListening(false);
      AccessibilityInfo.announceForAccessibility("Voice recognition failed. Please try again.");
      dismissTimeoutRef.current = setTimeout(() => setIsVoiceActive(false), 2000);
    }
  }, [speed, setSpeed, selectedVoice, language]);

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
      speakText(msg, selectedVoice, 1).catch(() => {});
      setTimeout(() => {
        setIsVoiceActive(false);
        setTranscribedText("");
      }, 3000);
    }
  }, [stopRecording, language, selectedVoice]);

  const activateVoice = useCallback(() => {
    stopTTS();
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
      dismissTimeoutRef.current = null;
    }
    if (listenTimeoutRef.current) {
      clearTimeout(listenTimeoutRef.current);
      listenTimeoutRef.current = null;
    }
    if (recorderRef.current) {
      recorderRef.current.cancel();
      recorderRef.current = null;
    }
    setIsVoiceActive(true);
    setIsListening(false);
    setTranscribedText("");
    startRecording();
  }, [startRecording]);

  const dismissVoice = useCallback(() => {
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
      dismissTimeoutRef.current = null;
    }
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

  const onTranscription = useCallback((callback: TranscriptionCallback) => {
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
