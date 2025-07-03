import { createFontStyle } from "@/utils/typography";
import Slider from "@react-native-community/slider";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

interface Option {
  id: string;
  title: string;
}

interface PercentageSliderProps {
  question: string;
  description: string;
  options: Option[];
  values: Record<string, number>;
  onValuesChange: (values: Record<string, number>) => void;
}

export function PercentageSlider({
  question,
  description,
  options,
  values,
  onValuesChange,
}: PercentageSliderProps) {
  // 初始化默认值，确保每个选项都有对应的值
  const getInitialValues = () => {
    const initialValues = { ...values };
    options.forEach((option) => {
      if (!(option.id in initialValues)) {
        initialValues[option.id] = 0;
      }
    });
    return initialValues;
  };

  // 用于跟踪滑动过程中的临时值
  const [tempValues, setTempValues] = useState<Record<string, number>>(
    getInitialValues()
  );

  // 当 values 或 options 变化时更新 tempValues
  useEffect(() => {
    setTempValues(getInitialValues());
  }, [values, options]);

  // 处理滑动过程中的值变化
  const handleValueChange = (id: string, newValue: number) => {
    setTempValues((prev) => ({
      ...prev,
      [id]: newValue,
    }));
  };

  // 处理滑动完成时的值变化
  const handleSlidingComplete = (id: string, finalValue: number) => {
    const newValues = {
      ...values,
      [id]: finalValue,
    };
    // 确保所有选项都有值
    options.forEach((option) => {
      if (!(option.id in newValues)) {
        newValues[option.id] = 0;
      }
    });
    onValuesChange(newValues);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>
      <Text style={styles.description}>{description}</Text>

      {options.map((option, index) => (
        <View key={index} style={styles.sliderCard}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{option.title}</Text>
            <Text style={styles.percentage}>
              {Math.round(tempValues[option.id] || 0)}%
            </Text>
          </View>

          <View style={styles.sliderContainer}>
            <View style={styles.sliderTrack}>
              <View
                style={[
                  styles.sliderProgress,
                  { width: `${tempValues[option.id] || 0}%` },
                ]}
              />
            </View>
            <Slider
              style={[styles.slider, { zIndex: 1 }]}
              minimumValue={0}
              maximumValue={100}
              value={values[option.id] || 0}
              onValueChange={(value) => handleValueChange(option.id, value)}
              onSlidingComplete={(value) =>
                handleSlidingComplete(option.id, value)
              }
              minimumTrackTintColor="transparent"
              maximumTrackTintColor="transparent"
              thumbTintColor="transparent"
              step={1}
              thumbImage={require("@/assets/images/test/slider-thumb.png")}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  question: {
    fontSize: 18,
    ...createFontStyle("700"),
    color: "#0C0A09",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#72818F",
    marginBottom: 32,
    ...createFontStyle("400"),
  },
  sliderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 14,
    marginBottom: 24,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    ...createFontStyle("600"),
    color: "#0C0A09",
    textTransform: "uppercase",
  },
  percentage: {
    fontSize: 14,
    ...createFontStyle("600"),
    color: "#686D76",
  },
  sliderContainer: {
    height: 22,
    justifyContent: "center",
  },
  sliderTrack: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 100,
    overflow: "hidden",
  },
  sliderProgress: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#19DBF2",
    borderRadius: 100,
  },
  slider: {
    width: "100%",
    height: 22,
  },
});
