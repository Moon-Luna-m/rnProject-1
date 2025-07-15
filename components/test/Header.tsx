import { createFontStyle } from "@/utils/typography";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  ColorValue,
  Image,
  ImageSourcePropType,
  Platform,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Animated from "react-native-reanimated";
import Svg, { ClipPath, Defs, G, Path, Rect } from "react-native-svg";

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
      <G clipPath="url(#clip0_1229_45536)">
        <AnimatedPath
          d="M3.63599 11.2932C3.44852 11.4807 3.3432 11.735 3.3432 12.0002C3.3432 12.2653 3.44852 12.5197 3.63599 12.7072L9.29299 18.3642C9.48159 18.5463 9.73419 18.6471 9.99639 18.6449C10.2586 18.6426 10.5094 18.5374 10.6948 18.352C10.8802 18.1666 10.9854 17.9158 10.9877 17.6536C10.9899 17.3914 10.8891 17.1388 10.707 16.9502L6.75699 13.0002H20C20.2652 13.0002 20.5196 12.8948 20.7071 12.7073C20.8946 12.5198 21 12.2654 21 12.0002C21 11.735 20.8946 11.4806 20.7071 11.2931C20.5196 11.1055 20.2652 11.0002 20 11.0002H6.75699L10.707 7.05018C10.8891 6.86158 10.9899 6.60898 10.9877 6.34678C10.9854 6.08458 10.8802 5.83377 10.6948 5.64836C10.5094 5.46295 10.2586 5.35778 9.99639 5.35551C9.73419 5.35323 9.48159 5.45402 9.29299 5.63618L3.63599 11.2932Z"
          fill="currentColor"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_1229_45536">
          <Rect width="24" height="24" fill="white" />
        </ClipPath>
      </Defs>
    </AnimatedSvg>
  );
};

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
  style?: StyleProp<ViewStyle>;
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
  style,
}: HeaderProps) {
  return (
    <View style={[{ position: "absolute", inset: 0 }, style]}>
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
            <BackArrow animatedProps={headerColorAnimatedStyle} />
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
                <Image
                  source={require("@/assets/images/test/isCollect.png")}
                  style={styles.icon}
                />
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
    width: 32,
    height: 32,
  },
});
