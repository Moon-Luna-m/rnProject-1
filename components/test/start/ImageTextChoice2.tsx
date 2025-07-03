import { createFontStyle } from "@/utils/typography";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ImageTextChoice2Props {
  question: string;
  description: string;
  options: Array<{
    key: string;
    title: string;
    subtitle: string;
    imageUrl: string;
  }>;
  selectedOption: string | null;
  onSelect: (key: string) => void;
}

export function ImageTextChoice2({
  question,
  description,
  options,
  selectedOption,
  onSelect,
}: ImageTextChoice2Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>
      <Text style={styles.description}>{description}</Text>

      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.key}
            activeOpacity={0.7}
            style={[
              styles.optionCard,
              {
                borderColor:
                  selectedOption === option.key ? "#19DBF2" : "#F3F4F6",
                backgroundColor: "#FFFFFF",
              },
            ]}
            onPress={() => onSelect(option.key)}
          >
            <View style={[styles.iconContainer]}>
              <Image
                source={{ uri: option.imageUrl }}
                style={styles.icon}
                resizeMode="cover"
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.subtitle}>{option.title}</Text>
            </View>
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
    gap: 12,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 43,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  icon: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#72818F",
    ...createFontStyle("400"),
  },
});
