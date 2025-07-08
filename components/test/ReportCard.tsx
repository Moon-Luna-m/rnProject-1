import { createFontStyle } from "@/utils/typography";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import LineChart from "./LineChart";

interface Statistic {
  value: string;
  label: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

interface ReportCardProps {
  chartData: {
    labels: string[];
    data: number[];
  };
}

export default function ReportCard({ chartData }: ReportCardProps) {
  // 转换数据格式以适配新的 LineChart 组件
  const lineChartData = chartData.labels.map((label, index) => ({
    label,
    value: chartData.data[index],
    color: "#00A1FF",
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>XXXXXX</Text>
          <Text style={styles.subtitle}>XXXX</Text>
        </View>
        <View style={styles.trendContainer}>
          <Text style={styles.trendTitle}>XXX</Text>
          <Text style={styles.trend}>+XXX%</Text>
        </View>
      </View>
      <View style={styles.chartContainer}>
        <LineChart data={lineChartData} />
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerTitle}>Visual report</Text>
        <Text style={styles.footerSubtitle}>
          Professional chart analysis and visual results display
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    gap: 30,
  },
  header: {
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleContainer: {
    gap: 4,
  },
  title: {
    fontSize: 16,
    ...createFontStyle("600"),
    color: "#111C2D",
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 12,
    color: "#515C66",
    textTransform: "uppercase",
  },
  trendTitle: {
    color: "#111C2D",
    fontSize: 16,
    ...createFontStyle("600"),
    letterSpacing: -0.32,
    lineHeight: 22.4,
  },
  trendContainer: {
    alignItems: "flex-end",
    gap: 4,
  },
  trend: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 100,
    backgroundColor: "#BAFAF2",
    fontSize: 12,
    ...createFontStyle("600"),
    color: "#00CEB6",
    letterSpacing: -0.12,
    lineHeight: 16.8,
  },
  chartContainer: {
    width: "100%",
    height: 104.54,
    overflow: "hidden",
    position: "relative",
  },
  footer: {
    gap: 8,
    alignItems: "center",
  },
  footerTitle: {
    color: "#0C0A09",
    fontSize: 16,
    ...createFontStyle("600"),
  },
  footerSubtitle: {
    color: "#515C66",
    fontSize: 12,
    ...createFontStyle("400"),
  },
});
