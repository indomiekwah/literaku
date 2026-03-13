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
        { backgroundColor: color, opacity: pressed ? 0.85 : 1 },
      ]}
      onPress={onPress}
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
            <Ionicons name="globe-outline" size={18} color={Colors.primary} />
          </View>
          <Text style={styles.headerTitle}>Literaku</Text>
        </View>
        <Pressable style={styles.settingsButton}>
          <Feather name="settings" size={22} color={Colors.text} />
        </Pressable>
      </View>

      <View style={styles.menuContainer}>
        <MenuButton
          icon={<Ionicons name="compass-outline" size={24} color="#FFF" />}
          label="Explorer"
          color={Colors.explorerButton}
          onPress={() => router.push("/explorer")}
        />
        <MenuButton
          icon={<MaterialIcons name="history" size={24} color="#FFF" />}
          label="History"
          color={Colors.historyButton}
          onPress={() => router.push("/history")}
        />
        <MenuButton
          icon={<Ionicons name="library-outline" size={24} color="#FFF" />}
          label="Collection"
          color={Colors.collectionButton}
          onPress={() => router.push("/collection")}
        />
        <MenuButton
          icon={<Ionicons name="book-outline" size={24} color="#FFF" />}
          label="Guide"
          color={Colors.guideButton}
          onPress={() => router.push("/guide")}
        />
      </View>

      <View style={styles.bottomBar}>
        <View style={styles.micContainer}>
          <Ionicons name="mic" size={22} color={Colors.primary} />
        </View>
        <Text style={styles.listeningText}>Listening...</Text>
        <View style={styles.helpButton}>
          <Ionicons name="help-circle" size={28} color={Colors.historyButton} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerLogoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.primary,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  menuContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 16,
    paddingVertical: 20,
  },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 14,
  },
  menuIconContainer: {
    width: 32,
    alignItems: "center",
  },
  menuButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
    color: "#FFFFFF",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 10,
  },
  micContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  listeningText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  helpButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});
