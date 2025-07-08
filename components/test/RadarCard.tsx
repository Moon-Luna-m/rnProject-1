import { createFontStyle } from "@/utils/typography";
import React from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Path, Text as SvgText } from "react-native-svg";

const { width } = Dimensions.get("window");
const CHART_SIZE = width - 72; // 16px padding on each side + 20px card padding
const CENTER_X = CHART_SIZE / 2;
const CENTER_Y = CHART_SIZE / 2;
const RADIUS = Math.min(CENTER_X, CENTER_Y) * 0.8;

// 获取标签简写
const getAbbreviation = (label: string): string => {
  // 处理特殊情况
  const specialCases: Record<string, string> = {
    Leadership: "LS",
    "Role Perception": "RP",
    Communication: "CM",
    "Problem Solving": "PS",
    "Team Work": "TW",
    "Decision Making": "DM",
    "Emotional Intelligence": "EI",
    "Critical Thinking": "CT",
  };

  if (specialCases[label]) {
    return specialCases[label];
  }

  // 默认处理：取每个单词的首字母
  return label
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

interface RadarCardProps {
  data: {
    label: string;
    value: number;
    color: string;
  }[];
}

export default function RadarCard({ data }: RadarCardProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = React.useState<"radar" | "heatmap">(
    "radar"
  );

  const points = data.map((_, i) => {
    const angle = (i / data.length) * 2 * Math.PI - Math.PI / 2;
    const value = data[i].value / 100;
    return {
      x: CENTER_X + RADIUS * value * Math.cos(angle),
      y: CENTER_Y + RADIUS * value * Math.sin(angle),
    };
  });

  const pathData =
    points.reduce((path, point, i) => {
      return (
        path + (i === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`)
      );
    }, "") + "Z";

  const axisPoints = data.map((_, i) => {
    const angle = (i / data.length) * 2 * Math.PI - Math.PI / 2;
    return {
      x: CENTER_X + RADIUS * Math.cos(angle),
      y: CENTER_Y + RADIUS * Math.sin(angle),
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("test.components.radar.title")}</Text>
        <Text style={styles.subtitle}>
          {t("test.components.radar.subtitle")}
        </Text>
      </View>

      <View style={styles.chartContainer}>
        <Svg width={CHART_SIZE} height={CHART_SIZE}>
          {/* 绘制背景网格 */}
          {[0.2, 0.4, 0.6, 0.8, 1].map((scale, i) => (
            <G key={`grid-${i}`}>
              {axisPoints.map((point, j) => {
                const nextPoint = axisPoints[(j + 1) % axisPoints.length];
                const scaledPoint1 = {
                  x: CENTER_X + (point.x - CENTER_X) * scale,
                  y: CENTER_Y + (point.y - CENTER_Y) * scale,
                };
                const scaledPoint2 = {
                  x: CENTER_X + (nextPoint.x - CENTER_X) * scale,
                  y: CENTER_Y + (nextPoint.y - CENTER_Y) * scale,
                };
                return (
                  <Path
                    key={`grid-line-${j}`}
                    d={`M ${scaledPoint1.x} ${scaledPoint1.y} L ${scaledPoint2.x} ${scaledPoint2.y}`}
                    stroke="#E4EBF0"
                    strokeWidth="1"
                  />
                );
              })}
            </G>
          ))}

          {/* 绘制轴线 */}
          {axisPoints.map((point, i) => {
            const innerPoint = {
              x: CENTER_X + (point.x - CENTER_X) * 0.2,
              y: CENTER_Y + (point.y - CENTER_Y) * 0.2,
            };
            return (
              <Path
                key={`axis-${i}`}
                d={`M ${innerPoint.x} ${innerPoint.y} L ${point.x} ${point.y}`}
                stroke="#E4EBF0"
                strokeWidth="1"
              />
            );
          })}

          {/* 绘制数据区域 */}
          <Path
            d={pathData}
            fill="rgba(140, 200, 239, 0.12)"
            stroke="#8CC8EF"
            strokeWidth="1"
          />

          {/* 绘制数据点 */}
          {points.map((point, i) => (
            <Circle
              key={`point-${i}`}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="white"
              stroke={data[i].color}
              strokeWidth="1.5"
            />
          ))}

          {/* 绘制标签 */}
          {data.map((item, i) => {
            const angle = (i / data.length) * 2 * Math.PI - Math.PI / 2;
            const labelRadius = RADIUS + 20;
            const x = CENTER_X + labelRadius * Math.cos(angle);
            const y = CENTER_Y + labelRadius * Math.sin(angle);
            return (
              <SvgText
                key={`label-${i}`}
                x={x}
                y={y}
                fill="#8C92A3"
                fontSize="12"
                textAnchor="middle"
                alignmentBaseline="middle"
                fontFamily="Outfit"
              >
                {getAbbreviation(item.label)}
              </SvgText>
            );
          })}
        </Svg>
      </View>

      <View style={styles.legend}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.colorDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendValue}>{item.value}%</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.legendLabel} numberOfLines={1}>
                {item.label}
              </Text>
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
    gap: 30,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 14,
    ...createFontStyle("600"),
    color: "#0C0A09",
    letterSpacing: 0.14,
  },
  subtitle: {
    fontSize: 12,
    color: "#515C66",
    ...createFontStyle("400"),
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#EFF4FA",
    borderRadius: 8,
    padding: 2,
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  legend: {
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  colorDot: {
    width: 14,
    height: 8,
    borderRadius: 20,
  },
  legendValue: {
    fontSize: 16,
    color: "#0C0A09",
    letterSpacing: -0.32,
    ...createFontStyle("600"),
  },
  legendLabel: {
    fontSize: 14,
    color: "#8C92A3",
    ...createFontStyle("400"),
  },
});
