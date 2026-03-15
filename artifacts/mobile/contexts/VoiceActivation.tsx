import React, { createContext, useContext, useCallback, useState } from "react";

interface VoiceActivationContextType {
  activateVoice: () => void;
  dismissVoice: () => void;
  isVoiceActive: boolean;
}

const VoiceActivationContext = createContext<VoiceActivationContextType>({
  activateVoice: () => {},
  dismissVoice: () => {},
  isVoiceActive: false,
});

export function VoiceActivationProvider({ children }: { children: React.ReactNode }) {
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  const activateVoice = useCallback(() => {
    setIsVoiceActive(true);
  }, []);

  const dismissVoice = useCallback(() => {
    setIsVoiceActive(false);
  }, []);

  return (
    <VoiceActivationContext.Provider value={{ activateVoice, dismissVoice, isVoiceActive }}>
      {children}
    </VoiceActivationContext.Provider>
  );
}

export function useVoiceActivation() {
  return useContext(VoiceActivationContext);
}
