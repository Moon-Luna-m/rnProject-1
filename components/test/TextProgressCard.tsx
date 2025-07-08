import { createFontStyle } from "@/utils/typography";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ProgressItem {
  text: string;
  color: string;
}

interface TextProgressCardProps {
  title: string;
  subtitle?: string;
  items: ProgressItem[];
}

export default function TextProgressCard({
  title,
  subtitle,
  items,
}: TextProgressCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      <View style={styles.progressList}>
        {items.map((item, index) => (
          <View key={index} style={styles.progressItem}>
            <View
              style={[styles.progressBar, { backgroundColor: item.color }]}
            />
            <Text style={styles.progressText}>{item.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    gap: 30,
  },
  header: {
    gap: 4,
  },
  title: {
    ...createFontStyle("600"),
    fontSize: 14,
    letterSpacing: 0.14,
    color: "#0C0A09",
  },
  subtitle: {
    ...createFontStyle("400"),
    fontSize: 12,
    color: "#515C66",
  },
  progressList: {
    gap: 30,
  },
  progressItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBar: {
    width: 2,
    height: 32,
    borderRadius: 1,
  },
  progressText: {
    flex: 1,
    fontFamily: "Inter",
    fontSize: 14,
    lineHeight: 17,
    color: "#8C92A3",
  },
});
