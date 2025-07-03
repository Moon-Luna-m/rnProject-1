import { createFontStyle } from "@/utils/typography";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  ColorValue,
  Dimensions,
  Image,
  ImageSourcePropType,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import Collect from "./icons/CollectIcon";

const { width } = Dimensions.get("window");
const HEADER_HEIGHT = 240;
const IMAGE_HEIGHT = HEADER_HEIGHT * 1.085; // 260.54/240

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedSvg = Animated.createAnimatedComponent(Svg);

const BackArrow = ({ animatedProps }: { animatedProps: { color: string } }) => {
  return (
    <AnimatedSvg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      animatedProps={animatedProps}
    >
      <AnimatedPath
        d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
        fill="currentColor"
      />
    </AnimatedSvg>
  );
};

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

interface HeaderProps {
  insetTop: number;
  bg?: ImageSourcePropType;
  color?: readonly [ColorValue, ColorValue];
  onPress?: (type: "share" | "collect") => void;
  headerBackgroundAnimatedStyle: {
    backgroundColor: string;
  };
  headerColorAnimatedStyle: {
    color: string;
  };
  isCollect?: boolean;
  headerSlot?: React.ReactNode;
  showCollect?: boolean;
  title: string;
}

export default function Header({
  insetTop,
  bg,
  color,
  onPress,
  headerColorAnimatedStyle,
  headerBackgroundAnimatedStyle,
  isCollect,
  headerSlot,
  showCollect = true,
  title,
}: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ position: "absolute", inset: 0 }}>
      {headerSlot ?? (
        <LinearGradient
          colors={color ?? ["#00A1FF", "#00CEB6"]}
          locations={[0, 1]}
          style={styles.gradient}
          start={{ x: 0, y: 0.1053 }}
          end={{ x: 0, y: 1 }}
        >
          <Image source={bg} style={styles.image} resizeMode="cover" />
        </LinearGradient>
      )}
      <Animated.View
        style={[
          styles.header,
          { paddingTop: insetTop, height: 44 + insetTop },
          headerBackgroundAnimatedStyle,
        ]}
      >
        <TouchableOpacity
          style={styles.backContainer}
          onPress={() => router.back()}
          activeOpacity={0.5}
        >
          {Platform.OS === "web" ? (
            <BackArrow animatedProps={headerColorAnimatedStyle} />
          ) : (
            <AnimatedIonicons
              style={headerColorAnimatedStyle}
              name="arrow-back-outline"
              size={24}
            />
          )}
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Animated.Text style={[styles.titleText, headerColorAnimatedStyle]}>
            {title}
          </Animated.Text>
        </View>
        <View style={styles.right}>
          {showCollect && (
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => onPress?.("collect")}
            >
              {!isCollect ? (
                <Image
                  source={require("@/assets/images/test/collect.png")}
                  style={styles.icon}
                />
              ) : (
                <View
                  style={{
                    width: 24,
                    height: 24,
                    backgroundColor: "#fff",
                    borderRadius: 44,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Collect />
                </View>
              )}
            </TouchableOpacity>
          )}
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => onPress?.("share")}
          >
            <Image
              source={require("@/assets/images/test/share.png")}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    height: HEADER_HEIGHT,
    width: "100%",
    alignItems: "center",
  },
  image: {
    width: 375,
    height: IMAGE_HEIGHT,
    marginTop: -HEADER_HEIGHT * 0.0856,
  },
  header: {
    flexDirection: "row",
    width: "100%",
    position: "absolute",
    left: 0,
    justifyContent: "space-between",
    alignItems: "center",
  },
  backContainer: {
    position: "absolute",
    left: 16,
    bottom: 0,
    height: 44,
    justifyContent: "center",
    zIndex: 10,
  },
  titleContainer: {
    position: "absolute",
    width: "100%",
    height: 44,
    bottom: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  titleText: {
    fontSize: 18,
    ...createFontStyle("600"),
    color: "#fff",
  },
  right: {
    position: "absolute",
    height: 44,
    right: 16,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  icon: {
    width: 24,
    height: 24,
  },
});
