import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { sampleArticles, type Article } from "@/constants/data";

function ArticleCard({ article }: { article: Article }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.articleCard,
        { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
      onPress={() =>
        router.push({ pathname: "/article/[id]", params: { id: article.id } })
      }
      accessibilityRole="button"
      accessibilityLabel={`Article: ${article.title}`}
    >
      <View style={styles.articleHeader}>
        <Text style={styles.articleTitle}>{article.title}</Text>
        <Text style={styles.articleBadge}>HTML</Text>
      </View>
      <Text style={styles.articleSource}>{article.source}</Text>
      <Text style={styles.articleSnippet} numberOfLines={3}>
        {article.snippet}
      </Text>
      <View style={styles.articleMeta}>
        <Text style={styles.metaText}>
          Cited by {article.citations}
        </Text>
        <Text style={styles.metaDot}>·</Text>
        <Text style={styles.metaText}>
          Related articles: {article.relatedArticles}
        </Text>
      </View>
    </Pressable>
  );
}

export default function ExplorerScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;

  const [searchQuery, setSearchQuery] = useState("Covid 19");
  const [results, setResults] = useState<Article[]>(sampleArticles);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    const filtered = sampleArticles.filter(
      (a) =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.snippet.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setResults(filtered.length > 0 ? filtered : sampleArticles);
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Go back">
          <Feather name="arrow-left" size={32} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{searchQuery || "Explorer"}</Text>
      </View>

      <View style={styles.searchContainer}>
        <Feather name="search" size={24} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search articles..."
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          accessibilityLabel="Search articles"
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ArticleCard article={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={results.length > 0}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>No articles found</Text>
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
    alignItems: "center",
    paddingVertical: 10,
    gap: 14,
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
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    color: Colors.primary,
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 14,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_600SemiBold",
    fontSize: 20,
    color: Colors.text,
    padding: 0,
  },
  listContent: {
    paddingBottom: 12,
    gap: 16,
  },
  articleCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: 10,
    minHeight: 120,
  },
  articleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  articleTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 19,
    color: Colors.primary,
    flex: 1,
    lineHeight: 26,
  },
  articleBadge: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: Colors.primary,
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    overflow: "hidden",
  },
  articleSource: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  articleSnippet: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  articleMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  metaText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.textSecondary,
  },
  metaDot: {
    color: Colors.textSecondary,
    fontSize: 14,
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
