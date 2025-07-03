import { createFontStyle } from "@/utils/typography";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface Dimension {
  icon?: ImageSourcePropType;
  label: string;
  value: number;
  color: string;
  trend: "up" | "down" | "stable";
}

interface AnalysisCardProps {
  dimensions: Dimension[];
}

export default function AnalysisCard({ dimensions }: AnalysisCardProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("test.components.radar.title")}</Text>
        <Text style={styles.subtitle}>
          {t("test.components.radar.subtitle")}
        </Text>
      </View>
      <View style={styles.dimensionsContainer}>
        {dimensions.map((dimension, index) => (
          <View key={index} style={styles.dimensionItem}>
            <View style={styles.dimensionHeader}>
              <Text style={styles.label}>{dimension.label}</Text>
              <Image
                source={
                  dimension.trend === "up"
                    ? require("@/assets/images/test/trend-up.png")
                    : dimension.trend === "down"
                    ? require("@/assets/images/test/trend-down.png")
                    : require("@/assets/images/test/trend.png")
                }
                style={styles.trendIcon}
              />
            </View>
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${dimension.value}%`,
                    backgroundColor: dimension.color,
                  },
                ]}
              />
            </View>
            <View style={styles.scaleContainer}>
              {[20, 40, 60, 80, 100].map((value, idx) => (
                <View key={idx} style={styles.scaleItem}>
                  <View style={styles.scaleLine} />
                  <Text style={styles.scaleText}>{value}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
  },
  header: {
    gap: 4,
    marginBottom: 30,
  },
  title: {
    fontSize: 14,
    ...createFontStyle("600"),
    color: "#0C0A09",
    letterSpacing: 0.14,
  },
  subtitle: {
    fontSize: 12,
    ...createFontStyle("400"),
    color: "#72818F",
  },
  dimensionsContainer: {
    gap: 12,
  },
  dimensionItem: {
    gap: 12,
  },
  dimensionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  trendIcon: {
    width: 20,
    height: 20,
  },
  label: {
    fontSize: 12,
    ...createFontStyle("400"),
    color: "#8C92A3",
    flex: 1,
  },
  progressContainer: {
    height: 16,
    backgroundColor: "#F7F7F9",
    borderRadius: 100,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 100,
  },
  scaleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: -2,
  },
  scaleItem: {
    alignItems: "center",
    width: 24,
  },
  scaleLine: {
    width: 1,
    height: 10,
    backgroundColor: "#DFE5F1",
  },
  scaleText: {
    fontSize: 12,
    ...createFontStyle("400"),
    color: "#8C92A3",
    marginTop: 2,
  },
});
