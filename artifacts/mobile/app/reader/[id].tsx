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
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {book.title}
        </Text>
        <View style={{ width: 36 }} />
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
        >
          <Ionicons name="play-skip-back" size={18} color={currentPage === 0 ? Colors.textSecondary : Colors.primary} />
        </Pressable>

        <Pressable
          style={[styles.controlButton, currentPage === 0 && styles.controlDisabled]}
          onPress={() => goToPage(currentPage - 1)}
          disabled={currentPage === 0}
        >
          <Ionicons name="play-back" size={18} color={currentPage === 0 ? Colors.textSecondary : Colors.primary} />
        </Pressable>

        <Pressable style={styles.playButton}>
          <Ionicons name="pause" size={22} color="#FFF" />
        </Pressable>

        <Pressable
          style={[styles.controlButton, currentPage === totalPages - 1 && styles.controlDisabled]}
          onPress={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
        >
          <Ionicons name="play-forward" size={18} color={currentPage === totalPages - 1 ? Colors.textSecondary : Colors.primary} />
        </Pressable>

        <Pressable
          style={[styles.controlButton, currentPage === totalPages - 1 && styles.controlDisabled]}
          onPress={() => goToPage(totalPages - 1)}
          disabled={currentPage === totalPages - 1}
        >
          <Ionicons name="play-skip-forward" size={18} color={currentPage === totalPages - 1 ? Colors.textSecondary : Colors.primary} />
        </Pressable>
      </View>

      <View style={styles.bottomBar}>
        <View style={styles.micContainer}>
          <Ionicons name="mic" size={22} color={Colors.primary} />
        </View>
        <Text style={styles.listeningText}>Listening...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.text,
    flex: 1,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 12,
  },
  readerCard: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 300,
  },
  pageContent: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.text,
    lineHeight: 26,
  },
  pageInfo: {
    alignItems: "center",
    paddingVertical: 10,
  },
  pageText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingVertical: 8,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  controlDisabled: {
    opacity: 0.5,
  },
  playButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
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
  errorText: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 100,
  },
});
