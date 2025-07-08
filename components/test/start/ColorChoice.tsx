import { createFontStyle } from "@/utils/typography";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface ColorGroup {
  colors: string[];
  label?: string;
}

interface ColorChoiceProps {
  question: string;
  description: string;
  colorGroups: ColorGroup[];
  selectedColor: number | null;
  onSelect: (index: number) => void;
  lowStrengthLabel?: string;
  highStrengthLabel?: string;
}

export function ColorChoice({
  question,
  description,
  colorGroups,
  selectedColor,
  onSelect,
  lowStrengthLabel = "Low strength",
  highStrengthLabel = "High strength",
}: ColorChoiceProps) {
  // 将所有颜色展平为一个数组
  const allColors = colorGroups.reduce((acc, group, groupIndex) => {
    return acc.concat(
      group.colors.map((color, strengthIndex) => ({
        color,
        groupIndex,
        strengthIndex,
      }))
    );
  }, [] as Array<{ color: string; groupIndex: number; strengthIndex: number }>);

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>
      <Text style={styles.description}>{description}</Text>

      <View style={styles.colorGrid}>
        {allColors.map((item, index) => (
          <View
            style={[
              styles.colorBoxContainer,
              {
                zIndex: selectedColor
                  ? selectedColor - 1 === index
                    ? 10
                    : 0
                  : 0,
              },
            ]}
            key={`${item.groupIndex}-${item.strengthIndex}`}
          >
            <TouchableOpacity
              style={[
                styles.colorBox,
                { backgroundColor: item.color },
                selectedColor
                  ? selectedColor - 1 === index && styles.selectedColorBox
                  : null,
              ]}
              activeOpacity={0.7}
              onPress={() => onSelect(index + 1)}
            />
          </View>
        ))}
      </View>

      <View style={styles.labelContainer}>
        <Text style={styles.label}>{lowStrengthLabel}</Text>
        <Text style={styles.label}>{highStrengthLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  question: {
    fontSize: 18,
    ...createFontStyle("700"),
    color: "#0C0A09",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#515C66",
    marginBottom: 16,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  colorBoxContainer: {
    width: "12.5%",
    aspectRatio: 1,
    padding: 1.5,
  },
  colorBox: {
    width: "100%",
    height: "100%",
  },
  selectedColorBox: {
    transform: [{ scale: 1.5 }],
    zIndex: 10,
    borderWidth: 1,
    borderColor: "#0C0A09",
    boxShadow: "0px 8px 22px 0px rgba(36, 164, 179, 0.32)",
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  label: {
    fontSize: 12,
    ...createFontStyle("400"),
    color: "#515C66",
    textTransform: "uppercase",
  },
});
