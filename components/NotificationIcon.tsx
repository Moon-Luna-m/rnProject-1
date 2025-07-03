import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface NotificationIconProps {
  type: "success" | "error" | "warning" | "info" | "loading";
}

const NotificationIcon: React.FC<NotificationIconProps> = ({ type }) => {
  const rotation = useSharedValue(0);
  const mounted = useSharedValue(true);

  useEffect(() => {
    mounted.value = true;
    
    // 先取消之前的动画
    cancelAnimation(rotation);
    // 重置旋转值
    rotation.value = 0;

    if (type === "loading" && mounted.value) {
      rotation.value = withSequence(
        withTiming(0, { duration: 0 }),
        withRepeat(
          withTiming(360, {
            duration: 1000,
            easing: Easing.linear,
          }),
          -1,
          false
        )
      );
    }

    // 组件卸载时取消动画
    return () => {
      mounted.value = false;
      cancelAnimation(rotation);
    };
  }, [type]);

  const getIconConfig = () => {
    switch (type) {
      case "success":
        return {
          name: "check" as const,
          color: "#42B969",
          size: 14,
        };
      case "error":
        return {
          name: "close-outline" as const,
          color: "#EB5735",
          size: 20,
        };
      case "warning":
        return {
          name: "information-sharp" as const,
          color: "#ff9800",
          size: 20,
        };
      case "info":
        return {
          name: "information-sharp" as const,
          color: "#2196f3",
          size: 20,
        };
      case "loading":
        return {
          name: "loader" as const,
          color: "#19DBF2",
          size: 16,
        };
      default:
        return {
          name: "information-sharp" as const,
          color: "#FFFFFF",
          size: 20,
        };
    }
  };

  const spinningStyle = useAnimatedStyle(() => {
    return {
      transform: type === "loading" ? [
        {
          rotate: `${rotation.value}deg`,
        },
      ] : []
    };
  }, [type]);

  const { name, color, size } = getIconConfig();

  return (
    <View style={styles.container}>
      <Animated.View style={spinningStyle}>
        {name === "check" ? (
          <FontAwesome5 name="check" size={size} color={color} />
        ) : name === "loader" ? (
          <Feather name={name} size={size} color={color} />
        ) : (
          <Ionicons name={name} size={size} color={color} />
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default NotificationIcon;
