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
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import VoiceCommandBar from "@/components/VoiceCommandBar";
import { sampleBooks, sampleStudents, voiceCommands, type Student } from "@/constants/data";

interface StudentRowProps {
  student: Student;
  assignments: string[];
  onToggle: (bookId: string) => void;
}

function StudentRow({ student, assignments, onToggle }: StudentRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.studentSection}>
      <Pressable
        style={({ pressed }) => [styles.studentRow, { opacity: pressed ? 0.9 : 1 }]}
        onPress={() => setExpanded(!expanded)}
        accessibilityRole="button"
        accessibilityLabel={`${student.name}, Student ID: ${student.studentId}. ${assignments.length} books assigned. ${expanded ? "Tap to collapse" : "Tap to expand"}`}
        accessibilityHint={expanded ? "Double tap to collapse the book list" : "Double tap to expand and see assigned books"}
      >
        <View style={styles.studentAvatar}>
          <Ionicons name="person" size={28} color={Colors.institutionPrimary} />
        </View>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{student.name}</Text>
          <Text style={styles.studentId}>ID: {student.studentId}</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{assignments.length}</Text>
        </View>
        <Feather name={expanded ? "chevron-up" : "chevron-down"} size={24} color={Colors.textSecondary} />
      </Pressable>

      {expanded && (
        <View style={styles.booksList}>
          {sampleBooks.map((book) => {
            const isAssigned = assignments.includes(book.id);
            return (
              <Pressable
                key={book.id}
                style={[styles.bookToggle, isAssigned && styles.bookToggleActive]}
                onPress={() => onToggle(book.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isAssigned }}
                accessibilityLabel={`${book.title}. ${isAssigned ? "Assigned. Tap to unassign" : "Not assigned. Tap to assign"}`}
                accessibilityHint={isAssigned ? "Double tap to remove this book assignment" : "Double tap to assign this book"}
              >
                <Ionicons
                  name={isAssigned ? "checkmark-circle" : "ellipse-outline"}
                  size={28}
                  color={isAssigned ? Colors.success : Colors.borderStrong}
                />
                <Text style={[styles.bookToggleTitle, isAssigned && styles.bookToggleTitleActive]} numberOfLines={1}>
                  {book.title}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

export default function InstitutionAssignScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;

  const [assignmentMap, setAssignmentMap] = useState<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {};
    sampleStudents.forEach(s => {
      map[s.id] = [...s.assignedBooks];
    });
    return map;
  });

  const handleToggle = (studentId: string, bookId: string) => {
    setAssignmentMap(prev => {
      const current = prev[studentId] || [];
      const isAssigned = current.includes(bookId);
      return {
        ...prev,
        [studentId]: isAssigned
          ? current.filter(id => id !== bookId)
          : [...current, bookId],
      };
    });
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back to dashboard" accessibilityHint="Double tap to return to institution dashboard">
          <Feather name="arrow-left" size={32} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} accessibilityRole="header">Assign Books</Text>
        <View style={{ width: 56 }} />
      </View>

      <Text style={styles.description}>
        Tap a student to expand and toggle book assignments.
      </Text>

      <FlatList
        data={sampleStudents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <StudentRow
            student={item}
            assignments={assignmentMap[item.id] || []}
            onToggle={(bookId) => handleToggle(item.id, bookId)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={sampleStudents.length > 0}
      />

      <VoiceCommandBar
        hints={[
          { command: "Assign [book] to [student]", description: "to assign a book" },
          { command: "Go back", description: "to return to dashboard" },
        ]}
        showHelpButton={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 18,
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
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: Colors.text,
    flex: 1,
    textAlign: "center",
  },
  description: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 14,
    lineHeight: 24,
  },
  listContent: {
    paddingBottom: 8,
    gap: 12,
  },
  studentSection: {
    gap: 0,
  },
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    minHeight: 80,
  },
  studentAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.voiceBarBg,
    borderWidth: 2,
    borderColor: Colors.institutionPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  studentInfo: {
    flex: 1,
    gap: 2,
  },
  studentName: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.text,
  },
  studentId: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
  },
  countBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.institutionPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#FFFFFF",
  },
  booksList: {
    paddingLeft: 20,
    paddingTop: 8,
    gap: 6,
  },
  bookToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 56,
  },
  bookToggleActive: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.success,
  },
  bookToggleTitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: Colors.textSecondary,
    flex: 1,
  },
  bookToggleTitleActive: {
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
});
