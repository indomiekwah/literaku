import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { sampleBooks } from "@/constants/data";

export default function ReaderScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;

  const book = sampleBooks.find((b) => b.id === id);
  const [currentPage, setCurrentPage] = useState(0);

  if (!book) {
    return (
      <View style={[styles.container, { paddingTop: topPadding }]}>
        <Text style={styles.errorText}>Book not found</Text>
      </View>
    );
  }

  const totalPages = book.content.length;

  const goToPage = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Go back">
          <Feather name="arrow-left" size={32} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {book.title}
        </Text>
        <View style={{ width: 56 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.readerCard}>
          <Text style={styles.pageContent}>{book.content[currentPage]}</Text>
        </View>
      </ScrollView>

      <View style={styles.pageInfo}>
        <Text style={styles.pageText}>
          Page {currentPage + 1} of {totalPages}
        </Text>
      </View>

      <View style={styles.controlsRow}>
        <Pressable
          style={[styles.controlButton, currentPage === 0 && styles.controlDisabled]}
          onPress={() => goToPage(0)}
          disabled={currentPage === 0}
          accessibilityLabel="First page"
        >
          <Ionicons name="play-skip-back" size={26} color={currentPage === 0 ? Colors.textSecondary : Colors.primary} />
        </Pressable>

        <Pressable
          style={[styles.controlButton, currentPage === 0 && styles.controlDisabled]}
          onPress={() => goToPage(currentPage - 1)}
          disabled={currentPage === 0}
          accessibilityLabel="Previous page"
        >
          <Ionicons name="play-back" size={26} color={currentPage === 0 ? Colors.textSecondary : Colors.primary} />
        </Pressable>

        <Pressable style={styles.playButton} accessibilityLabel="Play or pause">
          <Ionicons name="pause" size={34} color="#FFF" />
        </Pressable>

        <Pressable
          style={[styles.controlButton, currentPage === totalPages - 1 && styles.controlDisabled]}
          onPress={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          accessibilityLabel="Next page"
        >
          <Ionicons name="play-forward" size={26} color={currentPage === totalPages - 1 ? Colors.textSecondary : Colors.primary} />
        </Pressable>

        <Pressable
          style={[styles.controlButton, currentPage === totalPages - 1 && styles.controlDisabled]}
          onPress={() => goToPage(totalPages - 1)}
          disabled={currentPage === totalPages - 1}
          accessibilityLabel="Last page"
        >
          <Ionicons name="play-skip-forward" size={26} color={currentPage === totalPages - 1 ? Colors.textSecondary : Colors.primary} />
        </Pressable>
      </View>

      <View style={styles.bottomBar}>
        <Pressable style={styles.micContainer} accessibilityLabel="Microphone">
          <Ionicons name="mic" size={32} color={Colors.primary} />
        </Pressable>
        <Text style={styles.listeningText}>Listening...</Text>
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
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  backButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.text,
    flex: 1,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  readerCard: {
    backgroundColor: Colors.background,
    borderRadius: 18,
    padding: 24,
    borderWidth: 2,
    borderColor: Colors.border,
    minHeight: 240,
  },
  pageContent: {
    fontFamily: "Inter_400Regular",
    fontSize: 19,
    color: Colors.text,
    lineHeight: 32,
  },
  pageInfo: {
    alignItems: "center",
    paddingVertical: 8,
  },
  pageText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.textSecondary,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingVertical: 6,
  },
  controlButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  controlDisabled: {
    opacity: 0.35,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
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
  errorText: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 100,
  },
});
