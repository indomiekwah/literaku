import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Font from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ReadingPreferencesProvider } from "@/contexts/ReadingPreferences";
import { VoiceActivationProvider } from "@/contexts/VoiceActivation";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="student/login" />
      <Stack.Screen name="student/home" />
      <Stack.Screen name="student/penjelajah" />
      <Stack.Screen name="student/book/[id]" />
      <Stack.Screen name="student/library" />
      <Stack.Screen name="student/riwayat" />
      <Stack.Screen name="student/reader/[id]" />
      <Stack.Screen name="student/guide" />
      <Stack.Screen name="student/settings" />
      <Stack.Screen name="student/signup" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [iconsLoaded, setIconsLoaded] = useState(false);

  useEffect(() => {
    Font.loadAsync({
      Ionicons: require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf"),
    })
      .then(() => setIconsLoaded(true))
      .catch(() => setIconsLoaded(true));
  }, []);

  const allReady = (fontsLoaded || fontError) && iconsLoaded;

  useEffect(() => {
    if (allReady) {
      SplashScreen.hideAsync();
    }
  }, [allReady]);

  if (!allReady) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ReadingPreferencesProvider>
            <VoiceActivationProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <KeyboardProvider>
                  <RootLayoutNav />
                </KeyboardProvider>
              </GestureHandlerRootView>
            </VoiceActivationProvider>
          </ReadingPreferencesProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
