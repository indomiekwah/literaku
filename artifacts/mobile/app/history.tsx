import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { sampleHistory, type HistoryItem } from "@/constants/data";

function HistoryCard({ item, index }: { item: HistoryItem; index: number }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.historyCard,
        { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${item.timestamp}`}
    >
      <View style={styles.historyLeft}>
        <View style={styles.indexCircle}>
          <Text style={styles.historyIndex}>{index + 1}</Text>
        </View>
        <Text style={styles.historyTitle} numberOfLines={2}>
          {item.title}
        </Text>
      </View>
      <Text style={styles.historyTime}>{item.timestamp}</Text>
    </Pressable>
  );
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Go back">
          <Feather name="arrow-left" size={32} color={Colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <View style={styles.headerLogoCircle}>
            <Ionicons name="globe-outline" size={18} color={Colors.primary} />
          </View>
          <Text style={styles.headerBrand}>Literaku</Text>
        </View>
        <View style={{ width: 56 }} />
      </View>

      <Text style={styles.pageTitle}>History</Text>

      <FlatList
        data={sampleHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <HistoryCard item={item} index={index} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={sampleHistory.length > 0}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="history" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>No reading history yet</Text>
          </View>
        }
      />

      <View style={styles.bottomBar}>
        <Pressable style={styles.micContainer} accessibilityLabel="Microphone">
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
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  backButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerLogoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBrand: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.primary,
  },
  pageTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 30,
    color: Colors.primary,
    textAlign: "center",
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 12,
    gap: 12,
  },
  historyCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 18,
    borderWidth: 2,
    borderColor: Colors.border,
    minHeight: 84,
  },
  historyLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
    marginRight: 12,
  },
  indexCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  historyIndex: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#FFFFFF",
  },
  historyTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.text,
    flex: 1,
    lineHeight: 24,
  },
  historyTime: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.textSecondary,
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
    backgroundColor: Colors.surface,
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
