import BackBar from "@/components/ui/BackBar";
import { createFontStyle } from "@/utils/typography";
import { AntDesign } from "@expo/vector-icons";
import { TFunction } from "i18next";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
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

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const mockFaqData = (t: TFunction) => {
  return {
    reviews: [
      {
        id: "1",
        question: t("faq.questions.question1"),
        answer: t("faq.questions.answer1"),
      },
      {
        id: "2",
        question: t("faq.questions.question2"),
        answer: t("faq.questions.answer2"),
      },
      // {
      //   id: "3",
      //   question: t("faq.questions.question3"),
      //   answer: t("faq.questions.answer3"),
      // },
      {
        id: "4",
        question: t("faq.questions.question4"),
        answer: t("faq.questions.answer4"),
      },
      {
        id: "5",
        question: t("faq.questions.question5"),
        answer: t("faq.questions.answer5"),
      },
    ],
    privacy: [
      {
        id: "1",
        question: t("faq.questions.question6"),
        answer: t("faq.questions.answer6"),
      },
      {
        id: "2",
        question: t("faq.questions.question7"),
        answer: t("faq.questions.answer7"),
      },
      {
        id: "3",
        question: t("faq.questions.question8"),
        answer: t("faq.questions.answer8"),
      },
      {
        id: "4",
        question: t("faq.questions.question9"),
        answer: t("faq.questions.answer9"),
      },
    ],
    account: [
      {
        id: "1",
        question: t("faq.questions.question10"),
        answer: t("faq.questions.answer10"),
      },
      {
        id: "2",
        question: t("faq.questions.question11"),
        answer: t("faq.questions.answer11"),
      },
      {
        id: "3",
        question: t("faq.questions.question12"),
        answer: t("faq.questions.answer12"),
      },
      {
        id: "4",
        question: t("faq.questions.question13"),
        answer: t("faq.questions.answer13"),
      },
    ],
    payments: [
      {
        id: "1",
        question: t("faq.questions.question14"),
        answer: t("faq.questions.answer14"),
      },
      {
        id: "2",
        question: t("faq.questions.question15"),
        answer: t("faq.questions.answer15"),
      },
      {
        id: "3",
        question: t("faq.questions.question16"),
        answer: t("faq.questions.answer16"),
      },
      // {
      //   id: "4",
      //   question: t("faq.questions.question17"),
      //   answer: t("faq.questions.answer17"),
      // },
    ],
    others: [
      {
        id: "1",
        question: t("faq.questions.question18"),
        answer: t("faq.questions.answer18"),
      },
      {
        id: "2",
        question: t("faq.questions.question19"),
        answer: t("faq.questions.answer19"),
      },
      {
        id: "3",
        question: t("faq.questions.question20"),
        answer: t("faq.questions.answer20"),
      },
      {
        id: "4",
        question: t("faq.questions.question21"),
        answer: t("faq.questions.answer21"),
      },
    ],
  };
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
  ]);

  const renderScene = SceneMap({
    reviews: () => <TabContent items={mockFaqData(t).reviews} />,
    privacy: () => <TabContent items={mockFaqData(t).privacy} />,
    account: () => <TabContent items={mockFaqData(t).account} />,
    payments: () => <TabContent items={mockFaqData(t).payments} />,
    others: () => <TabContent items={mockFaqData(t).others} />,
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
    marginHorizontal: 16,
    shadowColor: "transparent",
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
