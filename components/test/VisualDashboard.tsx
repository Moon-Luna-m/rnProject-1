import CircleProgress from "@/utils/circleProgress";
import { createFontStyle } from "@/utils/typography";
import React from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, Text, View } from "react-native";

interface VisualDashboardProps {
  value: number;
  level: string;
  // completionRate: number;
  title?: string;
}

interface CenterCoordinate {
  x: number;
  y: number;
}

const VisualDashboard: React.FC<VisualDashboardProps> = ({
  value,
  level,
  // completionRate,
  title = "",
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {/* <Text style={styles.subtitle}>
          {t("test.components.visualDashboard.subtitle")}
        </Text> */}
      </View>

      <View style={[styles.dashboardContainer]}>
        <Image
          source={require("@/assets/images/test/bg-circle.png")}
          style={styles.circleImage}
        />
        <View style={styles.circleContainer}>
          <Image
            source={require("@/assets/images/test/circle.png")}
            style={styles.circleImage}
          />
        </View>
        <View style={styles.progressContainer}>
          <CircleProgress
            size={240}
            width={50}
            rotation={205}
            arcSweepAngle={300}
            fill={value}
            backgroundColor="transparent"
            tintColor="url(#progressGradient)"
            childrenContainerStyle={styles.childrenContainer}
            renderCap={() => <></>}
          >
            {() => (
              <View style={styles.centerContent}>
                <Text style={styles.valueText}>{value}</Text>
                <Text style={styles.levelText}>{level}</Text>
              </View>
            )}
          </CircleProgress>
          <CircleProgress
            size={240}
            width={8}
            rotation={205}
            arcSweepAngle={300}
            fill={value}
            tintTransparency={false}
            backgroundColor="transparent"
            tintColor="url(#gradient)"
            lineCap="round"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>
            {t("test.components.visualDashboard.info.currentValue")}
          </Text>
          <Text style={styles.infoValue}>{value}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>
            {t("test.components.visualDashboard.info.level")}
          </Text>
          <Text style={[styles.infoValue, styles.levelValue]}>{level}</Text>
        </View>
        {/* <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>
            {t("test.components.visualDashboard.info.completionRate")}
          </Text>
          <Text style={styles.infoValue}>{completionRate}%</Text>
        </View> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    gap: 30,
    alignItems: "center",
  },
  header: {
    alignSelf: "stretch",
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
    color: "#72818F",
  },
  dashboardContainer: {
    width: 240,
    height: 240,
    position: "relative",
  },
  circleContainer: {
    position: "absolute",
    top: 31.5,
    left: -0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  circleImage: {
    width: 240,
    height: 240,
  },
  centerContent: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  valueText: {
    fontSize: 40,
    ...createFontStyle("500"),
    color: "#0D0D12",
    lineHeight: 44,
  },
  levelText: {
    ...createFontStyle("400"),
    fontSize: 16,
    color: "#ADB5C2",
    letterSpacing: 0.2,
  },
  infoContainer: {
    flexDirection: "row",
    alignSelf: "stretch",
    justifyContent: "space-between",
    gap: 12,
  },
  infoItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  infoLabel: {
    fontSize: 12,
    ...createFontStyle("500"),
    color: "#72818F",
  },
  infoValue: {
    ...createFontStyle("600"),
    fontSize: 24,
    color: "#0C0A09",
    lineHeight: 30,
  },
  levelValue: {
    fontSize: 15,
  },
  dot: {
    width: 100,
    height: 100,
    backgroundColor: "#1862FE",
  },
  backgroundProgress: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  childrenContainer: {
    backgroundColor: "transparent",
  },
  progressContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default VisualDashboard;
