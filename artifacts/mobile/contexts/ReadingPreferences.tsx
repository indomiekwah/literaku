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
export type InteractionMode = "voice" | "touch";
export type SubscriptionPlan = "free" | "premium";

export const SPEED_OPTIONS: SpeedValue[] = [0.5, 0.75, 1, 1.25, 1.5, 2];

interface ReadingPreferencesState {
  selectedVoice: string;
  speed: SpeedValue;
  textSize: number;
  language: AppLanguage;
  interactionMode: InteractionMode;
  isSubscribed: boolean;
  subscriptionPlan: SubscriptionPlan;
}

interface ReadingPreferencesContextValue extends ReadingPreferencesState {
  setSelectedVoice: (voiceId: string) => void;
  setSpeed: (speed: SpeedValue) => void;
  setTextSize: (size: number) => void;
  setLanguage: (lang: AppLanguage) => void;
  setInteractionMode: (mode: InteractionMode) => void;
  setSubscriptionPlan: (plan: SubscriptionPlan) => void;
  setIsSubscribed: (subscribed: boolean) => void;
  isVoiceOnly: boolean;
  currentVoiceLabel: string;
}

const ReadingPreferencesContext = createContext<ReadingPreferencesContextValue | null>(null);

export function ReadingPreferencesProvider({ children }: { children: ReactNode }) {
  const [selectedVoice, setSelectedVoice] = useState("v3");
  const [speed, setSpeed] = useState<SpeedValue>(1);
  const [textSize, setTextSize] = useState(22);
  const [language, setLanguage] = useState<AppLanguage>("en");
  const [interactionMode, setInteractionMode] = useState<InteractionMode>("touch");
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan>("free");

  const isSubscribed = subscriptionPlan !== "free";
  const setIsSubscribed = (subscribed: boolean) => {
    setSubscriptionPlan(subscribed ? "premium" : "free");
  };
  const currentVoiceLabel = VOICE_OPTIONS.find((v) => v.id === selectedVoice)?.label || "Emma (Female)";
  const isVoiceOnly = interactionMode === "voice";

  return (
    <ReadingPreferencesContext.Provider
      value={{
        selectedVoice,
        speed,
        textSize,
        language,
        interactionMode,
        isSubscribed,
        subscriptionPlan,
        setSelectedVoice,
        setSpeed,
        setTextSize,
        setLanguage,
        setInteractionMode,
        setSubscriptionPlan,
        setIsSubscribed,
        isVoiceOnly,
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
