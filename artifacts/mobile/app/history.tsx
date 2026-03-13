import { Feather, Ionicons } from "@expo/vector-icons";
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
        { opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View style={styles.historyLeft}>
        <Text style={styles.historyIndex}>{index + 1}.</Text>
        <Text style={styles.historyTitle} numberOfLines={1}>
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
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={Colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <View style={styles.headerLogoCircle}>
            <Ionicons name="globe-outline" size={14} color={Colors.primary} />
          </View>
          <Text style={styles.headerBrand}>Literaku</Text>
        </View>
        <View style={{ width: 36 }} />
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
            <MaterialIcons name="history" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>No reading history yet</Text>
          </View>
        }
      />

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

import { MaterialIcons } from "@expo/vector-icons";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerLogoCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBrand: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.primary,
  },
  pageTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: Colors.primary,
    textAlign: "center",
    marginBottom: 20,
  },
  listContent: {
    paddingBottom: 12,
    gap: 10,
  },
  historyCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    marginRight: 12,
  },
  historyIndex: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: Colors.text,
    minWidth: 20,
  },
  historyTitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  historyTime: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: Colors.textSecondary,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 10,
  },
  micContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
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
