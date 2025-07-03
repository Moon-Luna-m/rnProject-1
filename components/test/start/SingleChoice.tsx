import { createFontStyle } from "@/utils/typography";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Option {
  key: string;
  text: string;
}

interface SingleChoiceProps {
  question: string;
  options: Option[];
  selectedOption?: string | null;
  selectedOptions?: string[];
  onSelect: (value: string) => void;
  multiple?: boolean;
  maxSelect?: number;
}

const getOptionLetter = (index: number): string => {
  if (index < 0 || index > 25) return "";
  return String.fromCharCode(65 + index); // 65 是 'A' 的 ASCII 码
};

export const SingleChoice: React.FC<SingleChoiceProps> = ({
  question,
  options,
  selectedOption,
  selectedOptions = [],
  onSelect,
  multiple = false,
  maxSelect,
}) => {
  const isSelected = (key: string) => {
    return multiple ? selectedOptions.includes(key) : selectedOption === key;
  };

  return (
    <View style={styles.container}>
      <View style={styles.questionContainer}>
        <Text style={styles.question}>{question}</Text>
      </View>
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.optionItem,
              isSelected(option.key) && styles.optionItemSelected,
            ]}
            onPress={() => onSelect(option.key)}
            activeOpacity={0.7}
          >
            <View style={[styles.optionCircle]}>
              <Text
                style={[
                  styles.optionLetter,
                  isSelected(option.key) && styles.optionLetterSelected,
                ]}
              >
                {getOptionLetter(index)}
              </Text>
            </View>
            <Text
              style={[
                styles.optionText,
                isSelected(option.key) && styles.optionTextSelected,
              ]}
            >
              {option.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  questionContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  question: {
    ...createFontStyle("600"),
    fontSize: 18,
    color: "#0C0A09",
    textTransform: "capitalize",
  },
  maxSelectHint: {
    marginTop: 8,
    fontSize: 14,
    color: "#72818F",
  },
  optionsContainer: {
    paddingHorizontal: 24,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
  },
  optionItemSelected: {
    backgroundColor: "#19DBF2",
  },
  optionCircle: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  optionLetter: {
    fontSize: 16,
    ...createFontStyle("700"),
    color: "#0C0A09",
  },
  optionLetterSelected: {
    color: "#FFFFFF",
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: "#0C0A09",
  },
  optionTextSelected: {
    color: "#FFFFFF",
  },
});
