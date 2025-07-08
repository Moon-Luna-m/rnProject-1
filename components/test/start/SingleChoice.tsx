import { getOptionLetter } from "@/utils/common";
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
    marginBottom: 16,
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
    color: "#515C66",
  },
  optionsContainer: {
    // paddingHorizontal: 24,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionItemSelected: {
    backgroundColor: "rgba(25, 219, 242, 0.12)",
    borderColor: "#19DBF2",
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
    color: "#0C0A09",
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: "#0C0A09",
    ...createFontStyle("400"),
  },
  optionTextSelected: {
    color: "#0C0A09",
  },
});
