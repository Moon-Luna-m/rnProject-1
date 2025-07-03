import { createFontStyle } from "@/utils/typography";
import { LinearGradient } from "expo-linear-gradient";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "react-native-paper";
import { BottomSheet } from "./BottomSheet";

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  visible: boolean;
  onClose: () => void;
  mode?: "date" | "time" | "datetime";
  minimumDate?: Date;
  maximumDate?: Date;
  title?: string;
}

const ITEM_HEIGHT = 44;
const VISIBLE_RANGE = 50; // 上下各25个项目

// 默认最小日期：1970年
const DEFAULT_MIN_DATE = new Date(1970, 0, 1);
// 默认最大日期：当前年份减一年
const DEFAULT_MAX_DATE = new Date(new Date().getFullYear() - 1, 11, 31);

// 滚动视图组件
const PickerScrollView: React.FC<{
  items: number[];
  type: "year" | "month" | "day";
  currentValue: number;
  currentDate: Date;
  onValueChange: (value: number) => void;
}> = ({ items, type, currentValue, currentDate, onValueChange }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollValue, setScrollValue] = useState(currentValue);
  const [isScrolling, setIsScrolling] = useState(false);
  const initialScrollDone = useRef(false);
  const [visibleRange, setVisibleRange] = useState(() => {
    const currentIndex = items.findIndex((item) => item === currentValue);
    const start = Math.max(0, currentIndex - VISIBLE_RANGE);
    const end = Math.min(items.length, currentIndex + VISIBLE_RANGE);
    return { start, end };
  });

  // 滚动到指定索引
  const scrollToIndex = useCallback((index: number, animated = true) => {
    if (index !== -1) {
      const y = index * ITEM_HEIGHT;
      scrollViewRef.current?.scrollTo({
        x: 0,
        y,
        animated: Platform.OS !== "web" && animated,
      });
    }
  }, []);

  // 初始化滚动位置
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!initialScrollDone.current && items.includes(currentValue)) {
        const index = items.findIndex((item) => item === currentValue);
        if (index !== -1) {
          scrollToIndex(index, false);
          initialScrollDone.current = true;
        }
      }
    }, 50); // 给予一个短暂延时确保组件已完全挂载

    return () => clearTimeout(timeoutId);
  }, [currentValue, items, scrollToIndex]);

  // 当外部currentValue改变时，更新scrollValue和滚动位置
  useEffect(() => {
    if (
      !isScrolling &&
      items.includes(currentValue) &&
      initialScrollDone.current
    ) {
      setScrollValue(currentValue);
      const index = items.findIndex((item) => item === currentValue);
      scrollToIndex(index, true);
    }
  }, [currentValue, items, isScrolling, scrollToIndex]);

  // 处理滚动
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;
      const index = Math.round(y / ITEM_HEIGHT);

      if (Platform.OS !== "web") {
        setVisibleRange({
          start: Math.max(0, index - VISIBLE_RANGE),
          end: Math.min(items.length, index + VISIBLE_RANGE),
        });
      }

      if (!isScrolling) {
        const value = items[index];
        if (value !== undefined && value !== scrollValue) {
          setScrollValue(value);
          onValueChange(value);
        }
      }
    },
    [isScrolling, items, onValueChange, scrollValue]
  );

  // 处理滚动开始
  const handleScrollBegin = useCallback(() => {
    setIsScrolling(true);
  }, []);

  // 处理滚动结束
  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      setIsScrolling(false);
      const y = event.nativeEvent.contentOffset.y;
      const index = Math.round(y / ITEM_HEIGHT);
      const value = items[index];

      if (value !== undefined) {
        setScrollValue(value);
        onValueChange(value);
      }
    },
    [items, onValueChange]
  );

  // 渲染列表项
  const renderItems = useCallback(() => {
    return items.map((item, index) => {
      // 在web端全量渲染，在移动端只渲染可见范围内的项
      if (
        Platform.OS !== "web" &&
        (index < visibleRange.start || index > visibleRange.end)
      ) {
        return <View key={item} style={{ height: ITEM_HEIGHT }} />;
      }

      return (
        <TouchableOpacity
          key={item}
          style={[
            styles.pickerItem,
            item === scrollValue && styles.selectedItem,
          ]}
          onPress={() => {
            setScrollValue(item);
            onValueChange(item);
            scrollToIndex(index);
          }}
        >
          <Text
            style={[
              styles.pickerItemText,
              item === scrollValue && styles.selectedText,
            ]}
          >
            {item.toString().padStart(2, "0")}
          </Text>
        </TouchableOpacity>
      );
    });
  }, [items, onValueChange, scrollToIndex, scrollValue, visibleRange]);

  return (
    <View style={styles.pickerColumn}>
      <LinearGradient
        colors={[
          "rgba(245, 247, 250, 1)",
          "rgba(245, 247, 250, 0.8)",
          "rgba(245, 247, 250, 0)",
          "rgba(245, 247, 250, 0.8)",
          "rgba(245, 247, 250, 1)",
        ]}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        style={styles.pickerMaskContainer}
        pointerEvents="none"
      />
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={Platform.OS === "android" ? 0 : ITEM_HEIGHT}
        decelerationRate="fast"
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBegin}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={Platform.OS === "web" ? 0 : 8}
        snapToAlignment="center"
        overScrollMode="never"
      >
        {renderItems()}
      </ScrollView>
    </View>
  );
};

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  visible,
  onClose,
  mode = "date",
  minimumDate = DEFAULT_MIN_DATE,
  maximumDate = DEFAULT_MAX_DATE,
  title,
}) => {
  const { t } = useTranslation();
  const [tempDate, setTempDate] = useState(value || new Date());

  // 在打开选择器时重置临时日期
  useEffect(() => {
    if (visible) {
      const initialDate = value ? new Date(value) : new Date();
      setTempDate(initialDate);
    }
  }, [visible, value]);

  const handleDateChange = useCallback(
    (type: "year" | "month" | "day", value: number) => {
      const newDate = new Date(tempDate);

      if (type === "year") {
        newDate.setFullYear(value);
      } else if (type === "month") {
        const currentDate = newDate.getDate();
        newDate.setDate(1);
        newDate.setMonth(value - 1);
        const maxDays = new Date(
          newDate.getFullYear(),
          newDate.getMonth() + 1,
          0
        ).getDate();
        newDate.setDate(Math.min(currentDate, maxDays));
      } else if (type === "day") {
        newDate.setDate(value);
      }

      if (newDate < minimumDate) {
        setTempDate(new Date(minimumDate));
      } else if (newDate > maximumDate) {
        setTempDate(new Date(maximumDate));
      } else {
        setTempDate(newDate);
      }
    },
    [tempDate, minimumDate, maximumDate]
  );

  const handleConfirm = useCallback(() => {
    onChange(tempDate);
    onClose();
  }, [tempDate, onChange, onClose]);

  const years = useMemo(() => {
    const minYear = minimumDate.getFullYear();
    const maxYear = maximumDate.getFullYear();
    return Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
  }, [minimumDate, maximumDate]);

  const months = useMemo(() => {
    const currentYear = tempDate.getFullYear();
    let startMonth = 1;
    let endMonth = 12;

    if (currentYear === minimumDate.getFullYear()) {
      startMonth = minimumDate.getMonth() + 1;
    }
    if (currentYear === maximumDate.getFullYear()) {
      endMonth = maximumDate.getMonth() + 1;
    }

    return Array.from(
      { length: endMonth - startMonth + 1 },
      (_, i) => startMonth + i
    );
  }, [tempDate.getFullYear(), minimumDate, maximumDate]);

  const days = useMemo(() => {
    const currentYear = tempDate.getFullYear();
    const currentMonth = tempDate.getMonth() + 1;
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    let startDay = 1;
    let endDay = daysInMonth;

    if (
      currentYear === minimumDate.getFullYear() &&
      currentMonth === minimumDate.getMonth() + 1
    ) {
      startDay = minimumDate.getDate();
    }
    if (
      currentYear === maximumDate.getFullYear() &&
      currentMonth === maximumDate.getMonth() + 1
    ) {
      endDay = Math.min(endDay, maximumDate.getDate());
    }

    return Array.from(
      { length: endDay - startDay + 1 },
      (_, i) => startDay + i
    );
  }, [tempDate.getFullYear(), tempDate.getMonth(), minimumDate, maximumDate]);

  return (
    <BottomSheet visible={visible} onClose={onClose} initialY={600}>
      <View style={styles.modalHeader}>
        <View style={styles.headerDivider} />
        <Text style={styles.modalTitle}>{title || t("common.selectDate")}</Text>
      </View>

      <View style={styles.pickerWrapper}>
        <View style={styles.pickerHeader}>
          <View style={styles.pickerHeaderColumn}>
            <Text style={styles.pickerHeaderText}>
              {t("common.datePicker.year")}
            </Text>
          </View>
          <View style={styles.pickerHeaderColumn}>
            <Text style={styles.pickerHeaderText}>
              {t("common.datePicker.month")}
            </Text>
          </View>
          <View style={styles.pickerHeaderColumn}>
            <Text style={styles.pickerHeaderText}>
              {t("common.datePicker.day")}
            </Text>
          </View>
        </View>

        <View style={styles.pickerContainer}>
          <PickerScrollView
            items={years}
            type="year"
            currentValue={tempDate.getFullYear()}
            currentDate={tempDate}
            onValueChange={(value) => handleDateChange("year", value)}
          />
          <View style={styles.pickerDivider} />
          <PickerScrollView
            items={months}
            type="month"
            currentValue={tempDate.getMonth() + 1}
            currentDate={tempDate}
            onValueChange={(value) => handleDateChange("month", value)}
          />
          <View style={styles.pickerDivider} />
          <PickerScrollView
            items={days}
            type="day"
            currentValue={tempDate.getDate()}
            currentDate={tempDate}
            onValueChange={(value) => handleDateChange("day", value)}
          />
        </View>
      </View>

      <View style={styles.modalFooter}>
        <Button
          mode="outlined"
          style={styles.cancelButton}
          onPress={onClose}
          contentStyle={styles.submitButtonContent}
          labelStyle={styles.cancelButtonText}
          rippleColor="rgba(0,0,0,0.03)"
        >
          {t("common.cancel")}
        </Button>
        <Button
          mode="contained"
          style={styles.confirmButton}
          contentStyle={styles.submitButtonContent}
          labelStyle={styles.confirmButtonText}
          onPress={handleConfirm}
        >
          {t("common.confirm")}
        </Button>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  modalHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  headerDivider: {
    width: 48,
    height: 5,
    backgroundColor: "#F3F4F6",
    borderRadius: 50,
    marginBottom: 16,
  },
  modalTitle: {
    ...createFontStyle("700"),
    fontSize: 16,
    lineHeight: 19.2,
    letterSpacing: 0.16,
    color: "#0C0A09",
    textAlign: "center",
  },
  pickerWrapper: {
    backgroundColor: "#F5F7FA",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  pickerContainer: {
    flexDirection: "row",
    height: 220,
    marginBottom: 12,
    overflow: "hidden",
  },
  pickerColumn: {
    flex: 1,
    height: 220,
  },
  scrollView: {
    flex: 1,
    ...(Platform.OS === "web"
      ? {
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch",
        }
      : {}),
  },
  scrollViewContent: {
    paddingBottom: ITEM_HEIGHT * 2,
    paddingTop: ITEM_HEIGHT * 2,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    ...(Platform.OS === "web"
      ? {
          scrollSnapAlign: "center",
          scrollSnapStop: "always",
          cursor: "default",
          WebkitScrollSnapAlign: "center",
          WebkitScrollSnapStop: "always",
        }
      : {}),
  },
  selectedItem: {
    // 移除背景色样式
  },
  pickerItemText: {
    ...createFontStyle("600"),
    fontSize: 20,
    lineHeight: 25.2,
    color: "#0C0A09",
    // opacity: 0.3,
    textAlign: "center",
  },
  selectedText: {
    color: "#19DBF2",
    opacity: 1,
  },
  pickerDivider: {
    width: 1,
    // backgroundColor: "#E5E7EB",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 12,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 78,
    borderColor: "#19DBF2",
  },
  confirmButton: {
    flex: 1,
    height: 48,
    borderRadius: 78,
    backgroundColor: "#19DBF2",
  },
  submitButtonContent: {
    height: 48,
  },
  cancelButtonText: {
    fontSize: 16,
    ...createFontStyle("600"),
    color: "#19DBF2",
  },
  confirmButtonText: {
    fontSize: 16,
    ...createFontStyle("600"),
    color: "white",
  },
  pickerMaskContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  pickerHeader: {
    flexDirection: "row",
    alignSelf: "stretch",
  },
  pickerHeaderColumn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  pickerHeaderText: {
    fontSize: 14,
    ...createFontStyle("500"),
    lineHeight: 17.64,
    color: "#0C0A09",
    textAlign: "center",
  },
});
