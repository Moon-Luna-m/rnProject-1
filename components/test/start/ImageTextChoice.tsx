import { createFontStyle } from "@/utils/typography";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ImageTextChoiceProps {
  question: string;
  description: string;
  options: Array<{
    key: string;
    text: string;
    imageUrl: string;
  }>;
  selectedOption: string | null;
  onSelect: (key: string) => void;
}

export function ImageTextChoice({
  question,
  description,
  options,
  selectedOption,
  onSelect,
}: ImageTextChoiceProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}

      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.key}
            activeOpacity={0.7}
            style={[
              styles.optionCard,
              // {
              //   backgroundColor: option.color,
              //   shadowColor: option.shadowColor,
              // }
            ]}
            onPress={() => onSelect(option.key)}
          >
            <Text style={styles.optionKey}>{option.key}</Text>
            <Image
              source={{ uri: option.imageUrl }}
              style={styles.optionImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  question: {
    fontSize: 18,
    ...createFontStyle("700"),
    color: "#0C0A09",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#72818F",
    marginBottom: 32,
    ...createFontStyle("400"),
  },
  optionsContainer: {
    marginTop: 32,
    gap: 24,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  optionCard: {
    width: 158,
    height: 100,
    borderRadius: 12,
  },
  optionKey: {
    position: "absolute",
    left: 8,
    top: 8,
    fontSize: 20,
    ...createFontStyle("700"),
    color: "#FFFFFF",
    textTransform: "uppercase",
    lineHeight: 25,
    zIndex: 1,
  },
  optionImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    left: 0,
    top: 0,
    borderRadius: 12,
  },
});
