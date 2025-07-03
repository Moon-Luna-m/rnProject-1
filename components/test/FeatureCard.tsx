import { createFontStyle } from "@/utils/typography";
import React from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, Text, View } from "react-native";

export default function FeatureCard() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Image
          source={require("@/assets/images/test/emoj.png")}
          style={styles.icon}
        />
      </View>
      <View style={styles.header}>
        <Text style={styles.title}>{t("test.components.feature.title")}</Text>
        <Text style={styles.subtitle}>
          {t("test.components.feature.subtitle")}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 16,
    alignItems: "center",
    gap: 16,
  },
  header: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 16,
    ...createFontStyle("600"),
    color: "#0C0A09",
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 12,
    ...createFontStyle("400"),
    color: "#72818F",
    textTransform: "uppercase",
    textAlign: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: "#FAFAF9",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 32,
    height: 32,
  },
  textContainer: {
    alignItems: "center",
    gap: 4,
  },
  label: {
    fontSize: 14,
    ...createFontStyle("600"),
    color: "#0C0A09",
    letterSpacing: 0.14,
    textAlign: "center",
  },
  description: {
    fontSize: 12,
    ...createFontStyle("400"),
    color: "#72818F",
    textTransform: "capitalize",
    textAlign: "center",
  },
});
