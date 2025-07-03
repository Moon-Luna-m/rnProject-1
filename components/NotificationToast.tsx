import { createFontStyle } from "@/utils/typography";
import { usePathname } from "expo-router";
import React, { useCallback, useEffect, useRef } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import {
  hideNotification,
  selectNotification,
} from "../store/slices/notificationSlice";
import NotificationIcon from "./NotificationIcon";

const { width } = Dimensions.get("window");

interface NotificationToastProps {
  disabledPath?: string[];
}

const NotificationToast: React.FC<NotificationToastProps> = ({ disabledPath = [] }) => {
  const notification = useSelector((state: RootState) =>
    selectNotification(state)
  );
  const dispatch = useDispatch();
  const opacity = useSharedValue(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const pathname = usePathname();

  const isPathDisabled = useCallback(() => {
    return disabledPath.some((path) => pathname.includes(path));
  }, [pathname, disabledPath]);

  const safeHideNotification = useCallback(() => {
    try {
      dispatch(hideNotification());
    } catch (error) {
      console.warn("Error hiding notification:", error);
    }
  }, [dispatch]);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (notification.visible && !isPathDisabled()) {
      // 清除之前的定时器
      cleanup();

      opacity.value = withTiming(1, {
        duration: 200,
      });

      // 只有当 duration 不为 null 时才设置自动隐藏
      if (notification.duration !== null && notification.duration !== 0) {
        timeoutRef.current = setTimeout(() => {
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
        }, notification.duration || 2000);
      }
    } else {
      // 当 visible 变为 false 时，执行隐藏动画
      opacity.value = withTiming(0, {
        duration: 200,
      });
    }

    return cleanup;
  }, [
    notification.visible,
    notification.type,
    notification.duration,
    notification.message,
    cleanup,
    safeHideNotification,
    isPathDisabled,
  ]);

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

  if (!notification.visible || isPathDisabled()) {
    return null;
  }

  const getBackgroundColor = () => {
    switch (notification.type) {
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
    switch (notification.type) {
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
        {notification.type !== "default" ? (
          <View style={styles.iconContainer}>
            <NotificationIcon type={notification.type || "info"} />
          </View>
        ) : null}
        <Text
          style={[styles.message, { color: getTextColor(), textAlign: "center" }]}
          numberOfLines={2}
        >
          {notification.message}
        </Text>
      </Animated.View>
    </View>
  );
};

export default NotificationToast;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99999,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 50,
    marginHorizontal: 16,
    paddingHorizontal: 20,
    maxWidth: Math.min(width - 32, 400),
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
  },
});
