import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, Text, View } from "react-native";
import PagerView from "react-native-pager-view";

const InspirationSlide = ({ text }: { text: string }) => (
  <View style={styles.slide}>
    <View style={styles.iconArea}>
      <Image
        source={require("@/assets/images/test/inspiration.png")}
        style={styles.icon}
        resizeMode="contain"
      />
    </View>
    <View style={{ paddingTop: 22, flex: 1 }}>
      <View style={styles.contentArea}>
        <LinearGradient
          colors={["#E1FCFF", "rgba(225, 252, 255, 0)"]}
          style={styles.gradientContainer}
        >
          <Text style={styles.description} numberOfLines={5}>
            {text}
          </Text>
        </LinearGradient>
      </View>
    </View>
  </View>
);

export const SpiritualInspiration = ({
  inspirations = [],
}: {
  inspirations?: Array<{
    text: string;
    id: number;
  }>;
}) => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);

  const defaultInspirations = [
    {
      id: "1",
      text: t("test.components.spiritual.inspirations.leadership"),
    },
    {
      id: "2",
      text: t("test.components.spiritual.inspirations.empathy"),
    },
    {
      id: "3",
      text: t("test.components.spiritual.inspirations.potential"),
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("test.components.spiritual.title")}</Text>
      <View style={styles.contentContainer}>
        <PagerView
          style={styles.pagerView}
          initialPage={0}
          onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        >
          {(inspirations.length > 0 ? inspirations : defaultInspirations).map(
            (item) => (
              <View key={item.id} style={styles.pageContainer}>
                <InspirationSlide text={item.text} />
              </View>
            )
          )}
        </PagerView>
        <View style={styles.indicators}>
          {(inspirations.length > 0 ? inspirations : defaultInspirations).map(
            (_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === activeIndex && styles.indicatorActive,
                ]}
              />
            )
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 24,
  },
  title: {
    fontFamily: "Outfit-SemiBold",
    fontSize: 16,
    lineHeight: 20,
    color: "#0C0A09",
    textAlign: "center",
  },
  contentContainer: {
    alignSelf: "stretch",
  },
  pagerView: {
    height: 140,
  },
  pageContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  slide: {
    flex: 1,
  },
  iconArea: {
    position: "absolute",
    left: 0,
    top: 0,
    zIndex: 10,
  },
  icon: {
    width: 48,
    height: 48,
  },
  contentArea: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  gradientContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 24,
    paddingBottom: 12,
  },
  description: {
    fontFamily: "Outfit-Regular",
    fontSize: 14,
    lineHeight: 18,
    color: "#72818F",
  },
  indicators: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  indicatorActive: {
    width: 16,
    height: 8,
    backgroundColor: "#19DBF2",
    borderRadius: 12,
  },
  indicator: {
    width: 8,
    height: 8,
    backgroundColor: "rgba(25, 219, 242, 0.16)",
    borderRadius: 12,
  },
});

export default SpiritualInspiration;
