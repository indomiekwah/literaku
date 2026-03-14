import React, { createContext, useContext, useState, type ReactNode } from "react";

export interface VoiceOption {
  id: string;
  label: string;
  lang: string;
}

export const VOICE_OPTIONS: VoiceOption[] = [
  { id: "v1", label: "Sari (Female)", lang: "id-ID" },
  { id: "v2", label: "Budi (Male)", lang: "id-ID" },
  { id: "v3", label: "Emma (Female)", lang: "en-US" },
  { id: "v4", label: "James (Male)", lang: "en-US" },
];

export type AppLanguage = "id" | "en";
export type SpeedValue = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2;

export const SPEED_OPTIONS: SpeedValue[] = [0.5, 0.75, 1, 1.25, 1.5, 2];

interface ReadingPreferencesState {
  selectedVoice: string;
  speed: SpeedValue;
  textSize: number;
  language: AppLanguage;
  autoDetectLanguage: boolean;
}

interface ReadingPreferencesContextValue extends ReadingPreferencesState {
  setSelectedVoice: (voiceId: string) => void;
  setSpeed: (speed: SpeedValue) => void;
  setTextSize: (size: number) => void;
  setLanguage: (lang: AppLanguage) => void;
  setAutoDetectLanguage: (enabled: boolean) => void;
  currentVoiceLabel: string;
}

const ReadingPreferencesContext = createContext<ReadingPreferencesContextValue | null>(null);

export function ReadingPreferencesProvider({ children }: { children: ReactNode }) {
  const [selectedVoice, setSelectedVoice] = useState("v1");
  const [speed, setSpeed] = useState<SpeedValue>(1);
  const [textSize, setTextSize] = useState(19);
  const [language, setLanguage] = useState<AppLanguage>("id");
  const [autoDetectLanguage, setAutoDetectLanguage] = useState(true);

  const currentVoiceLabel = VOICE_OPTIONS.find((v) => v.id === selectedVoice)?.label || "Sari (Female)";

  return (
    <ReadingPreferencesContext.Provider
      value={{
        selectedVoice,
        speed,
        textSize,
        language,
        autoDetectLanguage,
        setSelectedVoice,
        setSpeed,
        setTextSize,
        setLanguage,
        setAutoDetectLanguage,
        currentVoiceLabel,
      }}
    >
      {children}
    </ReadingPreferencesContext.Provider>
  );
}

export function useReadingPreferences(): ReadingPreferencesContextValue {
  const context = useContext(ReadingPreferencesContext);
  if (!context) {
    throw new Error("useReadingPreferences must be used within a ReadingPreferencesProvider");
  }
  return context;
}
