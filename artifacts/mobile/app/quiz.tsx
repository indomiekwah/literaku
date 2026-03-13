import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { questions } from "@/constants/questions";

export default function QuizScreen() {
  const insets = useSafeAreaInsets();
  const { name, npm } = useLocalSearchParams<{ name: string; npm: string }>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);

  const isWeb = Platform.OS === "web";
  const topPadding = isWeb ? 67 : insets.top;
  const bottomPadding = isWeb ? 34 : insets.bottom;

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  const handleNext = () => {
    if (selectedOption === null) return;

    const newAnswers = [...answers, selectedOption];

    if (currentIndex < totalQuestions - 1) {
      setAnswers(newAnswers);
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
    } else {
      let score = 0;
      newAnswers.forEach((answer, index) => {
        if (answer === questions[index].correctAnswer) {
          score += 20;
        }
      });

      router.replace({
        pathname: "/result",
        params: {
          name: name || "",
          npm: npm || "",
          score: score.toString(),
        },
      });
    }
  };

  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.questionCounter}>
          Pertanyaan {currentIndex + 1}/{totalQuestions}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedOption === index;
            return (
              <Pressable
                key={index}
                style={[
                  styles.optionButton,
                  isSelected && styles.optionButtonSelected,
                ]}
                onPress={() => setSelectedOption(index)}
              >
                <View
                  style={[
                    styles.radioOuter,
                    isSelected && styles.radioOuterSelected,
                  ]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.bottomSection}>
        <Pressable
          style={[
            styles.nextButton,
            selectedOption === null && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={selectedOption === null}
        >
          <Text style={styles.nextButtonText}>
            {isLastQuestion ? "Selesaikan Quiz" : "Lanjut"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
  },
  header: {
    paddingVertical: 16,
  },
  questionCounter: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.text,
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  questionText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 32,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.optionBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.optionBorder,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  optionButtonSelected: {
    backgroundColor: Colors.optionSelectedBackground,
    borderColor: Colors.optionSelectedBorder,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.inputBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: Colors.text,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.text,
  },
  optionText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: Colors.text,
    flex: 1,
  },
  optionTextSelected: {
    color: Colors.text,
  },
  bottomSection: {
    paddingBottom: 16,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: "center",
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.text,
  },
});
