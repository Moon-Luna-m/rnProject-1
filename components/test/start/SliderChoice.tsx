import { createFontStyle } from "@/utils/typography";
import React, { useEffect, useRef } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const MARK_WIDTH = 9; // 刻度宽度(1) + 间距(8) = 9
const windowWidth = Dimensions.get("window").width;
const centerOffset = windowWidth / 2;

interface SliderChoiceProps {
  question: string;
  description: string;
  minValue?: number;
  maxValue?: number;
  value: number;
  onValueChange: (value: number) => void;
  minLabel?: string;
  maxLabel?: string;
}

export const SliderChoice: React.FC<SliderChoiceProps> = ({
  question,
  description,
  minValue = 0,
  maxValue = 10,
  value,
  onValueChange,
  minLabel = "Rarely",
  maxLabel = "Often",
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollTimeoutRef = useRef<number>(null);

  // 初始化时滚动到当前值的位置
  useEffect(() => {
    const offset = value * 10 * MARK_WIDTH;
    scrollViewRef.current?.scrollTo({
      x: offset,
      animated: false,
    });
  }, []);

  // 计算滚动位置对应的值
  const getValueFromOffset = (offset: number): number => {
    const value = offset / MARK_WIDTH / 10;
    return Math.min(maxValue, Math.max(minValue, Number(value.toFixed(1))));
  };

  // 处理滚动结束
  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.x;
    const newValue = getValueFromOffset(offset);

    // 计算最接近的刻度位置
    const snappedOffset = Math.round(newValue * 10) * MARK_WIDTH;

    // 滚动到最接近的刻度
    scrollViewRef.current?.scrollTo({
      x: snappedOffset,
      animated: true,
    });

    if (newValue !== value) {
      onValueChange(newValue);
    }
  };

  // 处理滚动事件
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (Platform.OS === "web") {
      // 清除之前的定时器
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // 设置新的定时器，在滚动停止后执行
      scrollTimeoutRef.current = setTimeout(() => {
        handleScrollEnd(event);
      }, 150);
    }
  };

  // 渲染刻度
  const renderScaleMarks = () => {
    return (
      <ScrollView
        ref={scrollViewRef}
        horizontal
        style={styles.scaleMarksContainer}
        contentContainerStyle={[
          styles.scaleMarksContent,
          {
            paddingLeft: centerOffset - 5,
            paddingRight: centerOffset - 5,
          },
        ]}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        onScroll={handleScroll}
        snapToInterval={MARK_WIDTH}
        decelerationRate="fast"
        scrollEventThrottle={16}
      >
        {Array(101)
          .fill(0)
          .map((_, index) => {
            const markValue = index / 10;
            const isMark = index % 10 === 0;
            const isCenter = index % 5 === 0;
            return (
              <View key={index} style={styles.markWrapper}>
                {isMark && (
                  <Text style={styles.scaleMarkText}>{markValue}</Text>
                )}
                <View
                  style={[
                    styles.scaleMark,
                    isMark
                      ? styles.valueMark
                      : isCenter
                      ? styles.centerMark
                      : styles.shortMark,
                  ]}
                />
              </View>
            );
          })}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.question}>{question}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      <View style={styles.sliderContainer}>
        <View style={styles.scaleContainer}>
          <View style={styles.currentValueContainer}>
            <Text
              style={[
                styles.currentValue,
                value !== 0 && {
                  color: "#19DBF2",
                },
              ]}
            >
              {value}
            </Text>
            <Text style={styles.maxValue}>/</Text>
            <Text style={styles.maxValue}>10</Text>
          </View>
          <View style={styles.centerLine} />
          <View style={styles.scaleWrapper}>{renderScaleMarks()}</View>
        </View>

        <View style={styles.labelContainer}>
          <Text style={styles.label}>{minLabel}</Text>
          <Text style={styles.label}>{maxLabel}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    gap: 12,
    paddingHorizontal: 24,
  },
  question: {
    ...createFontStyle("600"),
    fontSize: 18,
    color: "#0C0A09",
    textTransform: "capitalize",
  },
  description: {
    ...createFontStyle("400"),
    fontSize: 14,
    color: "#72818F",
    textTransform: "capitalize",
  },
  sliderContainer: {
    marginTop: 44,
    alignItems: "center",
  },
  currentValue: {
    ...createFontStyle("600"),
    fontSize: 44,
    color: "#0C0A09",
    textAlign: "center",
    lineHeight: 44,
  },
  maxValue: {
    ...createFontStyle("400"),
    fontSize: 12,
    color: "#0C0A09",
    lineHeight: 12,
    marginBottom: 8,
  },
  scaleContainer: {
    height: 140,
    overflow: "hidden",
    width: "100%",
  },
  currentValueContainer: {
    position: "absolute",
    left: centerOffset,
    transform: [{ translateX: "-50%" }],
    bottom: 90,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 4,
  },
  centerLine: {
    position: "absolute",
    left: centerOffset,
    bottom: 0,
    width: 1,
    height: 80,
    backgroundColor: "#0C0A09",
    zIndex: 1,
    transform: [{ translateX: -0.5 }],
  },
  scaleWrapper: {
    flex: 1,
    width: "100%",
  },
  scaleMarksContainer: {
    height: 100,
    width: "100%",
  },
  markWrapper: {
    width: MARK_WIDTH,
    alignItems: "center",
  },
  scaleMarkText: {
    position: "absolute",
    bottom: 56,
    ...createFontStyle("400"),
    fontSize: 16,
    color: "#8C92A3",
  },
  scaleMarksContent: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  scaleMark: {
    width: 1,
    backgroundColor: "#DFE5F1",
  },
  shortMark: {
    height: 8,
  },
  centerMark: {
    height: 12,
  },
  valueMark: {
    height: 20,
  },
  selectedCenterMark: {
    height: 40,
    backgroundColor: "#0C0A09",
  },
  labelContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 12,
  },
  label: {
    ...createFontStyle("400"),
    fontSize: 12,
    color: "#72818F",
    textTransform: "capitalize",
  },
});
