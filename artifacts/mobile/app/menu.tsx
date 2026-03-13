import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";

interface MenuButtonProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  onPress: () => void;
}

function MenuButton({ icon, label, color, onPress }: MenuButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuButton,
        { backgroundColor: color, opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.menuIconContainer}>{icon}</View>
      <Text style={styles.menuButtonText}>{label}</Text>
    </Pressable>
  );
}

export default function MenuScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerLogoCircle}>
            <Ionicons name="globe-outline" size={26} color={Colors.primary} />
          </View>
          <Text style={styles.headerTitle}>Literaku</Text>
        </View>
        <Pressable style={styles.settingsButton} accessibilityLabel="Settings">
          <Feather name="settings" size={30} color={Colors.text} />
        </Pressable>
      </View>

      <View style={styles.menuContainer}>
        <MenuButton
          icon={<Ionicons name="compass-outline" size={44} color="#FFF" />}
          label="Explorer"
          color={Colors.explorerButton}
          onPress={() => router.push("/explorer")}
        />
        <MenuButton
          icon={<MaterialIcons name="history" size={44} color="#FFF" />}
          label="History"
          color={Colors.historyButton}
          onPress={() => router.push("/history")}
        />
        <MenuButton
          icon={<Ionicons name="library-outline" size={44} color="#FFF" />}
          label="Collection"
          color={Colors.collectionButton}
          onPress={() => router.push("/collection")}
        />
        <MenuButton
          icon={<Ionicons name="book-outline" size={44} color="#FFF" />}
          label="Guide"
          color={Colors.guideButton}
          onPress={() => router.push("/guide")}
        />
      </View>

      <View style={styles.bottomBar}>
        <Pressable style={styles.micContainer} accessibilityLabel="Microphone, listening">
          <Ionicons name="mic" size={32} color={Colors.primary} />
        </Pressable>
        <Text style={styles.listeningText}>Listening...</Text>
        <Pressable style={styles.helpButton} accessibilityLabel="Help">
          <Ionicons name="help-circle" size={44} color={Colors.historyButton} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerLogoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    borderWidth: 2.5,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    color: Colors.primary,
  },
  settingsButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  menuContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 14,
    paddingVertical: 8,
  },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: 26,
    paddingHorizontal: 28,
    gap: 20,
    minHeight: 96,
  },
  menuIconContainer: {
    width: 50,
    alignItems: "center",
  },
  menuButtonText: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: "#FFFFFF",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  micContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  listeningText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.textSecondary,
    flex: 1,
  },
  helpButton: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
});
