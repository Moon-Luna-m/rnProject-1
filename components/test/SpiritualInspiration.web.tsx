import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, Text, View } from "react-native";
import Swiper from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import "./SpiritualInspiration.css";

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
  const swiperRef = useRef<HTMLDivElement>(null);
  const [swiper, setSwiper] = useState<Swiper | null>(null);

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

  useEffect(() => {
    if (swiperRef.current && !swiper) {
      const newSwiper = new Swiper(swiperRef.current, {
        modules: [Pagination],
        slidesPerView: 1,
        spaceBetween: 30,
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
        },
      });
      setSwiper(newSwiper);
    }

    return () => {
      if (swiper) {
        swiper.destroy();
      }
    };
  }, [swiperRef, swiper]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("test.components.spiritual.title")}</Text>
      <View style={styles.contentContainer}>
        <div ref={swiperRef} className="swiper">
          <div className="swiper-wrapper">
            {(inspirations.length > 0 ? inspirations : defaultInspirations).map(
              (item) => (
                <div key={item.id} className="swiper-slide">
                  <InspirationSlide text={item.text} />
                </div>
              )
            )}
          </div>
          <div className="swiper-pagination" />
        </div>
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
    paddingHorizontal: 16,
    height: 150,
  },
  slide: {
    flex: 1,
    height: "100%",
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
});

export default SpiritualInspiration;
