import AnalysisCard from "@/components/test/AnalysisCard";
import AvatarCard from "@/components/test/AvatarCard";
import BadgeCard from "@/components/test/BadgeCard";
import FAQCard from "@/components/test/FAQCard";
import GrowthPathCard from "@/components/test/GrowthPathCard";
import Header from "@/components/test/Header";
import PersonalizedAdvice from "@/components/test/PersonalizedAdvice";
import PurchaseSheet from "@/components/test/PurchaseSheet";
import RadarCard from "@/components/test/RadarCard";
import ShareSheet from "@/components/test/ShareSheet";
import SpiritualInspiration from "@/components/test/SpiritualInspiration";
import TextProgressCard from "@/components/test/TextProgressCard";
import TraitCard from "@/components/test/TraitCard";
import VisualDashboard from "@/components/test/VisualDashboard";
import { mockDataFn } from "@/constants/MockData";
import { paymentService } from "@/services/paymentServices";
import { shareService } from "@/services/shareServices";
import {
  BlockType,
  TestReportResponse,
  testService,
} from "@/services/testServices";
import { setLocalCache } from "@/utils/common";
import { getTransformedReport } from "@/utils/reportTransformer";
import { createFontStyle } from "@/utils/typography";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  ImageSourcePropType,
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const SCROLL_THRESHOLD = Platform.OS === "web" ? 180 : 120;

export default function TestResultPage() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [showPurchase, setShowPurchase] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const scrollY = useSharedValue(0);
  const [testData, setTestData] = useState<TestReportResponse | null>(null);
  const { id } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [toastInfo, setToastInfo] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error" | "warning" | "info" | "loading";
    duration: number | null;
    onDismiss: () => void;
  }>();
  const [headerBg, setHeaderBg] = useState<{
    normal: ImageSourcePropType;
    high: ImageSourcePropType;
  }>({
    normal: require("@/assets/images/test/result/normal.png"),
    high: require("@/assets/images/test/result/high.png"),
  });
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerBackgroundAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      ["transparent", "#FFFFFF"]
    );

    return {
      backgroundColor: backgroundColor,
    };
  });

  const headerColorAnimatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      ["#FFFFFF", "#0D120E"]
    );

    return {
      color: color,
    };
  });

  const mockData = mockDataFn(t);

  const renderComponent = (type: BlockType, data?: any) => {
    switch (type) {
      case "MatchingResultBlock":
        return <AvatarCard avatar={data?.imageUrl} result={data} />;
      case "KeywordTagBlock":
        return <TraitCard traits={data.tags || []} />;
      case "RadarChartBlock":
        return <RadarCard data={data.dimensions || []} />;
      case "QuoteImageBlock":
        return <SpiritualInspiration inspirations={data?.list || []} />;
      case "RecommendationBox":
        return (
          <PersonalizedAdvice
            title={data.title}
            adviceItems={data?.suggestions || []}
          />
        );
      case "BadgeBlock":
        return <BadgeCard badges={data?.badges || []} />;
      case "GrowthPathBlock":
        return (
          <GrowthPathCard
            currentStage={data?.currentStage}
            stages={data?.stages ?? []}
          />
        );
      case "TextProgressBlock":
        return (
          <TextProgressCard title={data?.title} items={data?.sections ?? []} />
        );
      case "VisualMeterBlock":
        return (
          <VisualDashboard
            title={data?.title}
            value={data?.meters[0]?.value}
            level={data?.meters[0]?.level}
          />
        );
      case "MultiDimensionalBlock":
        return <AnalysisCard dimensions={data?.dimensions || []} />;
    }
  };

  const handlePurchase = async (method: string) => {
    if (paymentLoading) return;
    setPaymentLoading(true);
    if (method === "coin") {
      setToastInfo({
        visible: true,
        message: t("payment.paying"),
        type: "loading",
        duration: null,
        onDismiss: () => {},
      });
      const res = await paymentService.createPaymentOrder({
        payment_gateway: "BALANCE",
        payment_method: Platform.OS === "web" ? "WEB" : "APP",
        product_id: Number(id),
        product_type: 2,
        desc: "purchase",
      });
      if (res.code === 200) {
        getTestData();
        setToastInfo(undefined);
        setShowPurchase(false);
      } else {
        setToastInfo({
          visible: true,
          message: res.message,
          type: "error",
          duration: 3000,
          onDismiss: () => {
            setToastInfo(undefined);
          },
        });
      }
    } else {
      setShowPurchase(false);
      const res = await paymentService.createPaymentOrder({
        payment_gateway: "STRIPE",
        payment_method: Platform.OS === "web" ? "WEB" : "APP",
        product_id: Number(id),
        product_type: 2,
        desc: "purchase",
      });
      await setLocalCache("success_callback", location.href);
      location.href = res.data.pay_url;
    }
    setPaymentLoading(false);
  };

  const handleShare = async (method: string) => {
    try {
      // 先关闭分享面板，避免界面卡住
      setShowShare(false);

      // 生成分享链接
      const shareRes = await shareService.generateShareLink({
        platform: method.toUpperCase(),
        target_id: testData?.test_id || 0,
        target_type: "TEST",
        title: testData?.test_name || "",
      });

      if (shareRes.code !== 200) {
        throw new Error(shareRes.message);
      }

      // 执行系统分享
      const result = await Share.share({
        message: t("test.share.message"),
        url: shareRes.data.share_link,
        title: testData?.test_name || t("test.share.title"),
      });

      // 处理分享结果
      if (result.action === Share.sharedAction) {
        // 记录分享点击
        await shareService.clickShare({
          share_code: Number(shareRes.data.share_code),
        });
      }
    } catch (error: any) {
      console.error("Share failed:", error.message);
    }
  };

  const handleHeaderPress = async (type: "share" | "collect") => {
    if (type === "share") {
      setShowShare(true);
    } else if (type === "collect") {
      if (!testData) return;
      const res = await testService.addTestToFavorite({
        test_id: testData.test_id,
      });
      if (res.code === 200) {
      }
    }
  };
  const getTestData = async () => {
    setIsLoading(true);
    const response = await testService.getUserTestReport({
      test_id: Number(id),
    });
    if (response.code === 200) {
      setTestData(response.data);
    } else {
      router.replace("/");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getTestData();
  }, []);

  return (
    <View style={styles.container}>
      {!testData ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#19DBF2" />
        </View>
      ) : (
        <>
          <Header
            insetTop={insets.top}
            onPress={handleHeaderPress}
            headerBackgroundAnimatedStyle={headerBackgroundAnimatedStyle}
            headerColorAnimatedStyle={headerColorAnimatedStyle}
            showCollect={false}
            title={t("test.testReport")}
            headerSlot={
              <>
                <ImageBackground
                  source={headerBg.normal}
                  style={styles.gradient}
                >
                  <View style={styles.headerContainer}>
                    <Text style={styles.title}>{t("test.result.title")}</Text>
                    <Text style={styles.subtitle}>
                      {t("test.result.subtitle")}
                    </Text>
                  </View>
                </ImageBackground>
              </>
            }
          />
          <Animated.ScrollView
            style={[styles.scrollView, { marginTop: insets.top + 44 }]}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.content,
              {
                paddingBottom:
                  insets.bottom +
                  (!testData?.has_access
                    ? Platform.OS === "android"
                      ? 224
                      : 120
                    : 40),
              },
            ]}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
          >
            {testData && (
              <>
                {getTransformedReport(testData).components.map(
                  (item: { type: BlockType; data: any }) => (
                    <Fragment key={item.type}>
                      {renderComponent(item.type, item.data)}
                    </Fragment>
                  )
                )}
                <FAQCard faqs={mockData.faqs} />
              </>
            )}
          </Animated.ScrollView>
          {!testData?.has_access ? (
            <LinearGradient
              colors={["rgba(255,255,255,1)", "#FFFFFF"]}
              style={styles.buttonContainer}
              locations={[0, 0.7]}
            >
              {/* <TouchableOpacity
              style={[styles.button, styles.testAgainButton]}
              activeOpacity={0.7}
              onPress={async () => {
                await setLocalCache("user_test_way", "system");
                router.push(`/test/start/${id}`);
              }}
            >
              <Text style={styles.buyButtonText}>{t("test.testAgain")}</Text>
            </TouchableOpacity> */}
              {!testData?.has_access ? (
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.buyButton,
                    { opacity: paymentLoading ? 0.5 : 1 },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handlePurchase("stripe")}
                  disabled={paymentLoading}
                >
                  <Text style={styles.buyButtonText}>
                    {paymentLoading
                      ? t("common.camera.processing")
                      : t("test.result.advancedReport")}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </LinearGradient>
          ) : null}
        </>
      )}

      <PurchaseSheet
        toastInfo={toastInfo}
        isVisible={showPurchase}
        testName={testData?.test_name || ""}
        onClose={() => setShowPurchase(false)}
        price={testData?.discount_price || 0}
        onConfirm={handlePurchase}
      />

      <ShareSheet
        isVisible={showShare}
        onClose={() => setShowShare(false)}
        onShare={handleShare}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gradient: {
    height: 375,
    width: "100%",
    alignItems: "center",
  },
  headerContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    paddingHorizontal: 16,
    paddingBottom: 192,
    justifyContent: "flex-end",
    gap: 6,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    ...createFontStyle("700"),
  },
  subtitle: {
    color: "#fff",
    fontSize: 12,
    ...createFontStyle("400"),
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS !== "web" ? 120 : 180,
  },
  content: {
    gap: 20,
    // paddingBottom: 90, // 为底部按钮留出空间
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 34, // 适配底部安全区域
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  shareButton: {
    flex: 1,
    height: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 78,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#19DBF2",
  },
  shareButtonText: {
    color: "#19DBF2",
    fontSize: 16,
    ...createFontStyle("600"),
    textTransform: "uppercase",
  },
  button: {
    height: 48,
    borderRadius: 78,
    alignItems: "center",
    justifyContent: "center",
  },
  testAgainButton: {
    flex: 1,
    backgroundColor: "#19DBF2",
  },
  buyButton: {
    flex: 1,
    backgroundColor: "#0C0A09",
  },
  buyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    ...createFontStyle("600"),
    textTransform: "capitalize",
  },
});
