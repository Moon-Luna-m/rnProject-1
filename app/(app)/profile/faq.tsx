
import { createFontStyle } from "@/utils/typography";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutChangeEvent,
  LayoutRectangle,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabKey =
  | "reviews"
  | "privacy"
  | "account"
  | "payments"
  | "others"
  | "attachment";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const mockFaqData: Record<TabKey, FaqItem[]> = {
  reviews: [
    {
      id: "1",
      question: "这个测试科学吗？结果准确吗？",
      answer:
        "基于心理学理论，经过实证验证；问题中立且明确，有预测筛选；确保信度（内部一致性、重测稳定性）和效度（内容、构念、效标）；建立常模参照群体数据；标准化测试程序，保护隐私伦理；动态纠正文化偏差。目标：客观准确测量，避免主观标签。",
    },
    {
      id: "2",
      question: "如何解读测试结果？",
      answer:
        "测试结果包含详细的解释说明，帮助您理解各个维度的含义。我们提供专业的分析报告，包括个性特征、行为倾向等多个方面。",
    },
  ],
  privacy: [],
  account: [],
  payments: [],
  others: [],
  attachment: [],
};

function AccordionItem({ item }: { item: FaqItem }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const progress = useSharedValue(0);

  const measureView = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0) {
      setContentHeight(height);
    }
  }, []);

  const toggleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);
    progress.value = withTiming(isExpanded ? 0 : 1, {
      duration: 300,
    });
  }, [isExpanded, progress]);

  const arrowStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      progress.value,
      [0, 1],
      [0, 180],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  const contentStyle = useAnimatedStyle(() => {
    return {
      height: progress.value * contentHeight,
    };
  });

  return (
    <View style={styles.accordionItem}>
      <View style={styles.measureContainer} onLayout={measureView}>
        <View style={styles.accordionContentInner}>
          <Text style={styles.accordionText}>{item.answer}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <Text style={styles.accordionTitle}>{item.question}</Text>
        <Animated.View style={arrowStyle}>
          <AntDesign name="down" size={16} color="#333333" />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={[styles.accordionContent, contentStyle]}>
        <View
          style={[
            styles.accordionContentInner,
            { position: "absolute", left: 0, right: 0 },
          ]}
        >
          <Text style={styles.accordionText}>{item.answer}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

export default function Faq() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const scrollViewRef = useRef<ScrollView>(null);
  const contentScrollViewRef = useRef<ScrollView>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("reviews");
  const [tabLayouts, setTabLayouts] = useState<Record<TabKey, LayoutRectangle>>(
    {} as Record<TabKey, LayoutRectangle>
  );
  const [scrollViewLayout, setScrollViewLayout] =
    useState<LayoutRectangle | null>(null);

  const tabs = [
    { key: "reviews", title: t("faq.tabs.reviews") },
    { key: "privacy", title: t("faq.tabs.privacy") },
    { key: "account", title: t("faq.tabs.account") },
    { key: "payments", title: t("faq.tabs.payments") },
    { key: "others", title: t("faq.tabs.others") },
    { key: "attachment", title: t("faq.tabs.attachment") },
  ] as const;

  const handleTabPress = useCallback(
    (key: TabKey) => {
      setActiveTab(key);
      // 内容区域直接滚动到顶部
      contentScrollViewRef.current?.scrollTo({ y: 0, animated: false });

      // 如果没有布局信息，不执行滚动
      if (!scrollViewLayout || !tabLayouts[key]) return;

      // 计算目标滚动位置
      const tabLayout = tabLayouts[key];
      const scrollViewWidth = scrollViewLayout.width;
      const targetX = tabLayout.x + tabLayout.width / 2 - scrollViewWidth / 2;

      // 确保不会滚动出边界
      const maxScrollX =
        Object.values(tabLayouts).reduce(
          (max, layout) => Math.max(max, layout.x + layout.width),
          0
        ) - scrollViewWidth;
      const finalX = Math.max(0, Math.min(targetX, maxScrollX));

      // 执行滚动
      scrollViewRef.current?.scrollTo({
        x: finalX,
        animated: true,
      });
    },
    [scrollViewLayout, tabLayouts]
  );

  const handleTabLayout = useCallback(
    (key: TabKey, event: LayoutChangeEvent) => {
      const layout = event.nativeEvent.layout;
      setTabLayouts((prev) => ({
        ...prev,
        [key]: layout,
      }));
    },
    []
  );

  const handleScrollViewLayout = useCallback((event: LayoutChangeEvent) => {
    setScrollViewLayout(event.nativeEvent.layout);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TouchableOpacity
        style={styles.backContainer}
        onPress={() => {
          router.back();
        }}
      >
        <Ionicons name="arrow-back-outline" size={24} color="black" />
        <Text style={styles.backText}>{t("faq.title")}</Text>
      </TouchableOpacity>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
        onLayout={handleScrollViewLayout}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            onPress={() => handleTabPress(tab.key)}
            onLayout={(event) => handleTabLayout(tab.key, event)}
            activeOpacity={0.5}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.title}
            </Text>
            {activeTab === tab.key && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView
        ref={contentScrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {mockFaqData[activeTab].map((item) => (
          <AccordionItem key={item.id} item={item} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  backContainer: {
    position: "relative",
    height: (44),
    width: "100%",
    paddingHorizontal: (16),
    justifyContent: "center",
  },
  backText: {
    position: "absolute",
    inset: 0,
    textAlign: "center",
    paddingVertical: (10),
    fontSize: 18,
    color: "#0C0A09",
    ...createFontStyle("700"),
  },
  tabsContainer: {
    flexGrow: 0,
    height: (44),
  },
  tabsContent: {
    paddingHorizontal: (16),
    gap: (16),
    alignItems: "center",
  },
  tabButton: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: 16,
    lineHeight: 20,
    color: "#72818F",
    ...createFontStyle("400"),
  },
  activeTabText: {
    color: "#0C0A09",
    ...createFontStyle("600"),
  },
  activeIndicator: {
    position: "absolute",
    bottom: 10,
    width: (24),
    height: (2),
    backgroundColor: "#19DBF2",
    borderRadius: (26),
  },
  content: {
    flex: 1,
    marginHorizontal: (16),
    marginTop: (12),
  },
  contentContainer: {
    paddingVertical: (12),
  },
  accordionItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: (12),
    borderWidth: 1,
    borderColor: "#F3F4F6",
    marginBottom: (10),
    overflow: "hidden",
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: (12),
    gap: (12),
  },
  accordionTitle: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    ...createFontStyle("600"),
    color: "#0C0A09",
    marginRight: (12),
  },
  accordionContent: {
    overflow: "hidden",
  },
  accordionContentInner: {
    padding: (12),
    paddingTop: 0,
    paddingRight: (36),
  },
  accordionText: {
    fontSize: 12,
    lineHeight: 15,
    color: "#72818F",
  },
  measureContainer: {
    position: "absolute",
    opacity: 0,
    zIndex: -1,
  },
});
