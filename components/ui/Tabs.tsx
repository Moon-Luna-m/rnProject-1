import { createFontStyle } from "@/utils/typography";
import React, { useCallback, useEffect, useState } from "react";
import {
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export interface TabItem {
  key: string;
  title: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  containerStyle?: StyleProp<ViewStyle>;
  tabStyle?: StyleProp<ViewStyle>;
  activeTabStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  activeTextStyle?: StyleProp<TextStyle>;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeKey,
  onChange,
  containerStyle,
  tabStyle,
  activeTabStyle,
  textStyle,
  activeTextStyle,
}) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [delayedActiveKey, setDelayedActiveKey] = useState(activeKey);
  const activeIndex = useSharedValue(0);
  const targetIndex = useSharedValue(0);
  const isAnimating = useSharedValue(false);
  const gap = 2;

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  }, []);

  const tabWidth = containerWidth / tabs.length;

  // 监听动画进度
  useDerivedValue(() => {
    if (!isAnimating.value) return;

    const diff = targetIndex.value - activeIndex.value;
    const progress = Math.abs(diff);
    const direction = Math.sign(diff);
    
    if (progress <= 0.51 && direction !== 0) {
      isAnimating.value = false;
      runOnJS(setDelayedActiveKey)(activeKey);
    }
  });

  // 更新活动索引
  useEffect(() => {
    const index = tabs.findIndex((tab) => tab.key === activeKey);
    if (index !== -1) {
      targetIndex.value = index;
      isAnimating.value = true;
      activeIndex.value = withSpring(index, {
        damping: 15,
        stiffness: 120,
      });
    }
  }, [activeKey, tabs]);

  // 计算指示器的动画样式
  const indicatorStyle = useAnimatedStyle(() => {
    if (tabWidth === 0) return {};
    
    return {
      transform: [
        {
          translateX: interpolate(
            activeIndex.value,
            tabs.map((_, i) => i),
            tabs.map((_, i) => i * tabWidth + gap)
          ),
        },
      ],
      width: tabWidth - (gap * 2),
    };
  });

  // 处理标签点击
  const handleTabPress = useCallback(
    (key: string) => {
      onChange(key);
    },
    [onChange]
  );

  return (
    <View 
      style={[styles.container, containerStyle]}
      onLayout={handleLayout}
    >
      {containerWidth > 0 && (
        <>
          <Animated.View style={[styles.indicator, indicatorStyle]} />
          {tabs.map((tab) => {
            const isActive = tab.key === delayedActiveKey;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tab,
                  { width: tabWidth },
                  tabStyle,
                  isActive && styles.activeTab,
                  isActive && activeTabStyle,
                ]}
                onPress={() => handleTabPress(tab.key)}
                activeOpacity={1}
              >
                <Text
                  style={[
                    styles.text,
                    textStyle,
                    isActive && styles.activeText,
                    isActive && activeTextStyle,
                  ]}
                >
                  {tab.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: (50),
    paddingHorizontal: 2,
    height: (44),
    position: "relative",
    overflow: "hidden",
  },
  indicator: {
    position: "absolute",
    height: (40),
    top: (2),
    left: 0,
    backgroundColor: "#0C0A09",
    borderRadius: (20),
    zIndex: 0,
  },
  tab: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  activeTab: {},
  text: {
    fontSize: 14,
    ...createFontStyle("500"),
    color: "#A9AEB8",
  },
  activeText: {
    color: "#FFFFFF",
    ...createFontStyle("600"),
  },
});
