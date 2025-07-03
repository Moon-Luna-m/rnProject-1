import { createFontStyle } from "@/utils/typography";
import React, { useCallback, useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import NotificationIcon from "../NotificationIcon";

const BottomSheetToast: React.FC<{
  visible: boolean;
  message?: string;
  type: "success" | "error" | "warning" | "info" | "loading";
  duration: number | null;
  onDismiss?: () => void;
}> = ({ visible, message, type, duration, onDismiss }) => {
  const opacity = useSharedValue(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const safeHideNotification = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const hide = useCallback(() => {
    opacity.value = withTiming(
      0,
      {
        duration: 200,
      },
      (finished) => {
        if (finished) {
          runOnJS(safeHideNotification)();
        }
      }
    );
  }, [opacity, safeHideNotification]);

  useEffect(() => {
    if (visible) {
      // 清除之前的定时器
      cleanup();

      // 直接显示通知，不需要重置状态
      opacity.value = withTiming(1, {
        duration: 200,
      });

      // 只有当 duration 不为 null 时才设置自动隐藏
      if (duration !== null && duration !== 0) {
        timeoutRef.current = setTimeout(hide, duration || 3000);
      }
    } else {
      // 当 visible 变为 false 时，执行隐藏动画并触发回调
      hide();
    }

    return cleanup;
  }, [visible, type, duration, message, cleanup, hide]);

  const animatedStyle = useAnimatedStyle(() => {
    try {
      return {
        opacity: opacity.value,
      };
    } catch (error) {
      return {
        opacity: 0,
      };
    }
  }, []);

  if (!visible) {
    return null;
  }

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "rgba(0, 0, 0, 0.8)";
      case "error":
        return "rgba(0, 0, 0, 0.8)";
      case "warning":
        return "#ff9800";
      case "info":
        return "#2196f3";
      case "loading":
        return "rgba(0, 0, 0, 0.8)";
      default:
        return "rgba(0, 0, 0, 0.8)";
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "error":
        return "#EB5735";
      case "success":
        return "#42B969";
      case "loading":
        return "#FFFFFF";
      default:
        return "#FFFFFF";
    }
  };

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Animated.View
        style={[
          styles.container,
          animatedStyle,
          { backgroundColor: getBackgroundColor() },
        ]}
      >
        <View style={styles.iconContainer}>
          <NotificationIcon type={type || "info"} />
        </View>
        <Text
          style={[styles.message, { color: getTextColor() }]}
          numberOfLines={2}
        >
          {message}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    marginBottom: 32,
    width: "90%",
    alignSelf: "center",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 50,
    marginHorizontal: 16,
  },
  iconContainer: {
    width: 24,
    height: 24,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0C0A09",
    borderRadius: 100,
  },
  message: {
    fontSize: 14,
    ...createFontStyle("500"),
    lineHeight: 18,
    flex: 1,
  },
});

export default BottomSheetToast;
