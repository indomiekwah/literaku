import React, { createContext, useContext, useCallback, useState, useRef, useEffect } from "react";
import { AccessibilityInfo, Platform } from "react-native";
import { AudioRecorder, speechToText, speechToTextFromUri, stopTTSPlayback as stopTTS } from "@/services/speech";
import { speakText } from "@/services/speech";
import { useReadingPreferences, type SpeedValue, type InteractionMode } from "@/contexts/ReadingPreferences";
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
  isSpeechDetected: boolean;
  transcribedText: string;
  onTranscription: (callback: TranscriptionCallback) => void;
  clearTranscriptionCallback: () => void;
}

const VoiceActivationContext = createContext<VoiceActivationContextType>({
  activateVoice: () => {},
  dismissVoice: () => {},
  isVoiceActive: false,
  isListening: false,
  isSpeechDetected: false,
  transcribedText: "",
  onTranscription: () => {},
  clearTranscriptionCallback: () => {},
});

const NO_SPEECH_TIMEOUT_MS = 5000;
const MAX_RECORDING_MS = 15000;

export function VoiceActivationProvider({ children }: { children: React.ReactNode }) {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechDetected, setIsSpeechDetected] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const recorderRef = useRef<AudioRecorder | null>(null);
  const callbackRef = useRef<TranscriptionCallback | null>(null);
  const sessionIdRef = useRef(0);
  const noSpeechTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxRecordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { speed, setSpeed, selectedVoice, language, interactionMode, setInteractionMode } = useReadingPreferences();

  const clearTimersInline = () => {
    if (noSpeechTimeoutRef.current) {
      clearTimeout(noSpeechTimeoutRef.current);
      noSpeechTimeoutRef.current = null;
    }
    if (maxRecordingTimeoutRef.current) {
      clearTimeout(maxRecordingTimeoutRef.current);
      maxRecordingTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      sessionIdRef.current++;
      clearTimersInline();
      if (dismissTimeoutRef.current) {
        clearTimeout(dismissTimeoutRef.current);
        dismissTimeoutRef.current = null;
      }
      if (recorderRef.current) {
        recorderRef.current.cancel();
        recorderRef.current = null;
      }
    };
  }, []);

  const stopRecording = useCallback(async () => {
    const recorder = recorderRef.current;
    if (!recorder) return;
    const mySession = sessionIdRef.current;
    try {
      clearTimersInline();
      const audioData = await recorder.stop();
      if (recorderRef.current === recorder) {
        recorderRef.current = null;
      }
      if (mySession !== sessionIdRef.current) return;
      setIsListening(false);
      setIsSpeechDetected(false);

      const lang = language === "id" ? "id-ID" : "en-US";
      console.log(`VoiceActivation: sending audio for STT, type=${typeof audioData}, lang=${lang}`);

      const result = typeof audioData === "string"
        ? await speechToTextFromUri(audioData, lang)
        : await speechToText(audioData, lang);

      if (mySession !== sessionIdRef.current) return;

      console.log(`VoiceActivation: STT result status=${result.RecognitionStatus}`);
      const displayText = result.DisplayText || result.NBest?.[0]?.Display || "";

      if (result.RecognitionStatus === "Success" && displayText) {
        const text = displayText;
        setTranscribedText(text);
        AccessibilityInfo.announceForAccessibility(`You said: ${text}`);

        const cluLang = language === "id" ? "id" : "en";
        const { intent, param, confidence, source } = await matchVoiceIntent(text, cluLang);
        if (mySession !== sessionIdRef.current) return;
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

        if (intent === "switch_voice_mode" || intent === "switch_touch_mode") {
          let newMode: InteractionMode;
          if (intent === "switch_touch_mode") {
            newMode = "touch";
          } else {
            newMode = interactionMode === "voice" ? "touch" : "voice";
          }
          setInteractionMode(newMode);
          const msg = newMode === "voice"
            ? (language === "id" ? "Mode suara saja diaktifkan" : "Voice-only mode activated")
            : (language === "id" ? "Mode sentuh diaktifkan" : "Touch mode activated");
          AccessibilityInfo.announceForAccessibility(msg);
          speakText(msg, selectedVoice, 1).catch(() => {});
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

      await recorder.start({
        onSpeechStarted: () => {
          setIsSpeechDetected(true);
          if (noSpeechTimeoutRef.current) {
            clearTimeout(noSpeechTimeoutRef.current);
            noSpeechTimeoutRef.current = null;
          }
        },
        onSilenceDetected: () => {
          clearTimersInline();
          stopRecording();
        },
      });

      setIsListening(true);

      noSpeechTimeoutRef.current = setTimeout(() => {
        if (!recorderRef.current) return;
        console.log("VoiceActivation: no speech detected, cancelling");
        recorderRef.current.cancel();
        recorderRef.current = null;
        clearTimersInline();
        setIsListening(false);
        setIsSpeechDetected(false);
        const msg = language === "id"
          ? "Tidak terdengar suara. Coba lagi."
          : "No speech detected. Please try again.";
        setTranscribedText(msg);
        AccessibilityInfo.announceForAccessibility(msg);
        speakText(msg, selectedVoice, 1).catch(() => {});
        dismissTimeoutRef.current = setTimeout(() => {
          setIsVoiceActive(false);
          setTranscribedText("");
        }, 2000);
      }, NO_SPEECH_TIMEOUT_MS);

      maxRecordingTimeoutRef.current = setTimeout(() => {
        console.log("VoiceActivation: max recording duration reached");
        stopRecording();
      }, MAX_RECORDING_MS);
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
    sessionIdRef.current++;
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
      dismissTimeoutRef.current = null;
    }
    clearTimersInline();
    if (recorderRef.current) {
      recorderRef.current.cancel();
      recorderRef.current = null;
    }
    setIsVoiceActive(true);
    setIsListening(false);
    setIsSpeechDetected(false);
    setTranscribedText("");
    startRecording();
  }, [startRecording]);

  const dismissVoice = useCallback(() => {
    sessionIdRef.current++;
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
      dismissTimeoutRef.current = null;
    }
    clearTimersInline();
    if (recorderRef.current) {
      recorderRef.current.cancel();
      recorderRef.current = null;
    }
    setIsVoiceActive(false);
    setIsListening(false);
    setIsSpeechDetected(false);
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
      value={{ activateVoice, dismissVoice, isVoiceActive, isListening, isSpeechDetected, transcribedText, onTranscription, clearTranscriptionCallback }}
    >
      {children}
    </VoiceActivationContext.Provider>
  );
}

export function useVoiceActivation() {
  return useContext(VoiceActivationContext);
}
