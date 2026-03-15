import React from "react";
import { View, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import SwipeVoiceOverlay from "./SwipeVoiceOverlay";
import { useVoiceActivation } from "@/contexts/VoiceActivation";

interface SwipeVoiceWrapperProps {
  children: React.ReactNode;
}

export default function SwipeVoiceWrapper({ children }: SwipeVoiceWrapperProps) {
  const { activateVoice, dismissVoice, isVoiceActive } = useVoiceActivation();

  const swipeLeft = Gesture.Fling()
    .direction(2)
    .onEnd(() => {
      activateVoice();
    })
    .runOnJS(true);

  const swipeRight = Gesture.Fling()
    .direction(1)
    .onEnd(() => {
      dismissVoice();
    })
    .runOnJS(true);

  const composed = Gesture.Race(swipeLeft, swipeRight);

  return (
    <GestureDetector gesture={composed}>
      <View style={styles.wrapper}>
        {children}
        <SwipeVoiceOverlay visible={isVoiceActive} onDismiss={dismissVoice} />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
});
