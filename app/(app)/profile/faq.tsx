import BackBar from "@/components/ui/BackBar";
import { createFontStyle } from "@/utils/typography";
import { AntDesign } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";

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

const TabContent = ({ items }: { items: FaqItem[] }) => {
  return (
    <View style={styles.content}>
      {items.map((item) => (
        <AccordionItem key={item.id} item={item} />
      ))}
    </View>
  );
};

export default function Faq() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "reviews", title: t("faq.tabs.reviews") },
    { key: "privacy", title: t("faq.tabs.privacy") },
    { key: "account", title: t("faq.tabs.account") },
    { key: "payments", title: t("faq.tabs.payments") },
    { key: "others", title: t("faq.tabs.others") },
    { key: "attachment", title: t("faq.tabs.attachment") },
  ]);

  const renderScene = SceneMap({
    reviews: () => <TabContent items={mockFaqData.reviews} />,
    privacy: () => <TabContent items={mockFaqData.privacy} />,
    account: () => <TabContent items={mockFaqData.account} />,
    payments: () => <TabContent items={mockFaqData.payments} />,
    others: () => <TabContent items={mockFaqData.others} />,
    attachment: () => <TabContent items={mockFaqData.attachment} />,
  });

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      scrollEnabled
      style={styles.tabBar}
      tabStyle={styles.tab}
      indicatorStyle={styles.indicator}
      labelStyle={styles.label}
      activeColor="#0C0A09"
      inactiveColor="#515C66"
      pressColor="transparent"
      pressOpacity={0.7}
    />
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <BackBar title={t("faq.title")} />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        style={styles.tabView}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  tabView: {
    flex: 1,
  },
  tabBar: {
    height: 44,
    backgroundColor: "#F5F7FA",
    shadowOpacity: 0,
    marginHorizontal: 16,
  },
  tab: {
    width: "auto",
    padding: 0,
    marginHorizontal: 8,
  },
  indicator: {
    bottom: 10,
    backgroundColor: "#19DBF2",
  },
  label: {
    textTransform: "none",
    fontSize: 16,
    lineHeight: 20,
    ...createFontStyle("600"),
  },
  content: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  accordionItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    marginBottom: 10,
    overflow: "hidden",
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    gap: 12,
  },
  accordionTitle: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    ...createFontStyle("600"),
    color: "#0C0A09",
    marginRight: 12,
  },
  accordionContent: {
    overflow: "hidden",
  },
  accordionContentInner: {
    padding: 12,
    paddingTop: 0,
    paddingRight: 36,
  },
  accordionText: {
    fontSize: 12,
    lineHeight: 15,
    color: "#515C66",
  },
  measureContainer: {
    position: "absolute",
    opacity: 0,
    zIndex: -1,
  },
});
