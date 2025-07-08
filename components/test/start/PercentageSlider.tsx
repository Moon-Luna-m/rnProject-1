import {
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
} from "@/components/ui/slider";
import { createFontStyle } from "@/utils/typography";
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
  const [initValues, setInitValues] = useState<Record<string, number>>(values);
  // 用于跟踪滑动过程中的临时值
  const [tempValues, setTempValues] = useState<Record<string, number>>(
    getInitialValues()
  );

  // 当 values 或 options 变化时更新 tempValues
  useEffect(() => {
    if (JSON.stringify(initValues) !== "{}") {
      setTempValues(getInitialValues());
    }
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
            <Slider
              minValue={0}
              maxValue={100}
              value={values[option.id] || 0}
              onChange={(value) => {
                handleValueChange(option.id, value);
                handleSlidingComplete(option.id, value);
              }}
              step={1}
            >
              <SliderTrack
                style={{
                  backgroundColor: "#fff",
                  height: 12,
                  borderRadius: 100,
                }}
              >
                <SliderFilledTrack
                  style={{ backgroundColor: "#19DBF2", height: "100%" }}
                />
              </SliderTrack>
              <SliderThumb
                style={{
                  width: 24,
                  height: 24,
                  backgroundColor: "#19DBF2",
                  borderWidth: 1,
                  borderRadius: 100,
                  borderColor: "#fff",
                  filter: "drop-shadow(0px 4px 17px rgba(0, 0, 0, 0.06))",
                }}
              />
            </Slider>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  question: {
    fontSize: 18,
    ...createFontStyle("700"),
    color: "#0C0A09",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#515C66",
    marginBottom: 16,
    ...createFontStyle("400"),
  },
  sliderCard: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
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
    justifyContent: "center",
    height: 40,
    paddingHorizontal: 0,
  },
});
