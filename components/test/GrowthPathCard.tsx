import { createFontStyle } from "@/utils/typography";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, { G, Path } from "react-native-svg";

interface Stage {
  stage: number;
  title: string;
  description: string;
  color: string;
}

interface GrowthPathCardProps {
  stages: Stage[];
  currentStage: number;
}

// 垂直方向刻度SVG路径
const MARK_PATH =
  "M0.395558 6.8477C0.255274 4.61893 0.185119 3.50455 0.588619 2.60361C0.933884 1.8327 1.5663 1.14524 2.30578 0.736975C3.16999 0.259852 4.24249 0.237853 6.38747 0.193854C8.45932 0.151355 10.5318 0.151422 12.6037 0.194052C14.7486 0.238187 15.8211 0.260255 16.6854 0.737429C17.4249 1.14573 18.0573 1.83323 18.4026 2.60416C18.8062 3.50512 18.7361 4.61949 18.596 6.84824L17.1199 30.3229C16.9792 32.5607 16.9088 33.6797 16.4513 34.4837C16.0335 35.2178 15.4668 35.7462 14.7052 36.1116C13.8712 36.5117 12.6884 36.5032 10.3229 36.4861C9.77207 36.4821 9.22125 36.4821 8.67043 36.4861C6.30494 36.503 5.12218 36.5115 4.28813 36.1112C3.52652 35.7458 2.95978 35.2174 2.54196 34.4832C2.08439 33.6792 2.01396 32.5603 1.87311 30.3225L0.395558 6.8477Z";

// 未完成状态的颜色
const INACTIVE_COLOR = "#ECF2FC";

// 固定总刻度数
const TOTAL_MARKS = 25;

const GrowthPathCard: React.FC<GrowthPathCardProps> = ({
  stages,
  currentStage,
}) => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();

  // 仪表盘配置
  const DASHBOARD_CONFIG = {
    width: width - 32,
    height: 220,
    radius: 140,
    markWidth: 19,
    markHeight: 37,
    gapAngle: 2,
  };

  // 计算每个阶段的刻度数
  const marksPerStage = Math.floor(TOTAL_MARKS / stages.length);
  const remainingMarks = TOTAL_MARKS % stages.length;

  // 计算当前激活的刻度数
  const getActiveMarks = () => {
    if (currentStage === 0) return 0;

    let activeMarks = 0;
    for (let i = 0; i < currentStage; i++) {
      activeMarks += marksPerStage;
      if (i < remainingMarks) activeMarks += 1;
    }
    return activeMarks;
  };

  // 获取某个刻度所属的阶段索引
  const getStageIndexForMark = (markIndex: number) => {
    let accumulatedMarks = 0;
    for (let i = 0; i < stages.length; i++) {
      const stageMarks = marksPerStage + (i < remainingMarks ? 1 : 0);
      accumulatedMarks += stageMarks;
      if (markIndex < accumulatedMarks) return i;
    }
    return stages.length - 1;
  };

  // 计算刻度位置和旋转角度
  const calculateMarkPosition = (index: number) => {
    const angleStep = 180 / (TOTAL_MARKS - 1);
    const currentAngle = (index - (TOTAL_MARKS - 1) / 2) * angleStep;
    const radians = (currentAngle * Math.PI) / 180;

    const x = DASHBOARD_CONFIG.radius * Math.sin(radians);
    const y = -DASHBOARD_CONFIG.radius * Math.cos(radians);

    const centerX = DASHBOARD_CONFIG.width / 2;
    const centerY = DASHBOARD_CONFIG.radius + 40;

    return {
      x: centerX + x,
      y: centerY + y,
      rotation: currentAngle,
    };
  };

  // 获取刻度颜色
  const getMarkColor = (index: number) => {
    const activeMarks = getActiveMarks();
    if (index >= activeMarks) return INACTIVE_COLOR;
    const stageIndex = getStageIndexForMark(index);
    return stages[stageIndex].color;
  };

  return (
    <LinearGradient colors={["#E5FFFB", "#FFFFFF"]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {t("test.components.growthPath.title")}
        </Text>
        <Text style={styles.subtitle}>
          {t("test.components.growthPath.subtitle")}
        </Text>
      </View>

      <View
        style={[styles.dashboardContainer, { height: DASHBOARD_CONFIG.height }]}
      >
        <Svg width={DASHBOARD_CONFIG.width} height={DASHBOARD_CONFIG.height}>
          <G>
            {Array.from({ length: TOTAL_MARKS }).map((_, index) => {
              const { x, y, rotation } = calculateMarkPosition(index);
              return (
                <Path
                  key={index}
                  d={MARK_PATH}
                  fill={getMarkColor(index)}
                  transform={`translate(${x - DASHBOARD_CONFIG.markWidth / 2} ${
                    y - DASHBOARD_CONFIG.markHeight / 2
                  }) rotate(${rotation}, ${DASHBOARD_CONFIG.markWidth / 2}, ${
                    DASHBOARD_CONFIG.markHeight / 2
                  })`}
                />
              );
            })}
          </G>
        </Svg>
        <View style={styles.centerContent}>
          <Text style={styles.currentStageTitle}>
            {stages[currentStage - 1].title}
          </Text>
          <Text style={styles.currentStageText}>
            {t("test.components.growthPath.currentStage", {
              stage: currentStage,
            })}
          </Text>
        </View>
      </View>

      <View style={styles.stagesContainer}>
        <View style={styles.stagesGrid}>
          {stages.map((stage) => (
            <View key={stage.stage} style={styles.stageItem}>
              <Text style={styles.stageTitle} numberOfLines={1}>
                {stage.title}
              </Text>
              <View style={styles.stageInfo}>
                <View
                  style={[styles.stageDot, { backgroundColor: stage.color }]}
                />
                <Text style={styles.stageText}>Stage {stage.stage}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 16,
    overflow: "hidden",
  },
  header: {
    gap: 4,
    marginBottom: 24,
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
  dashboardContainer: {
    width: "100%",
    position: "relative",
    alignItems: "center",
  },
  centerContent: {
    position: "absolute",
    top: "65%",
    alignItems: "center",
    gap: 4,
  },
  currentStageTitle: {
    ...createFontStyle("700"),
    fontSize: 18,
    color: "#0D0D12",
    textAlign: "center",
  },
  currentStageText: {
    ...createFontStyle("400"),
    fontSize: 12,
    color: "#ADB5C2",
    textAlign: "center",
  },
  stagesContainer: {
    marginTop: 24,
    width: 311,
  },
  stagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 24,
    alignSelf: "stretch",
  },
  stageItem: {
    flex: 1,
    minWidth: "46%",
    gap: 8,
  },
  stageTitle: {
    ...createFontStyle("600"),
    fontSize: 12,
    letterSpacing: 0.125,
    color: "#515C66",
    lineHeight: 16,
  },
  stageInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "stretch",
  },
  stageDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  stageText: {
    ...createFontStyle("700"),
    fontSize: 18,
    color: "#0D0D12",
  },
});

export default GrowthPathCard;
