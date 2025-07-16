import { BlockType, TestReportResponse } from "@/services/testServices";
import { getTransformedReport } from "@/utils/reportTransformer";
import { createFontStyle } from "@/utils/typography";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { Fragment, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  ImageSourcePropType,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot";
import AnalysisCard from "./test/AnalysisCard";
import AvatarCard from "./test/AvatarCard";
import BadgeCard from "./test/BadgeCard";
import GrowthPathCard from "./test/GrowthPathCard";
import PersonalizedAdvice from "./test/PersonalizedAdvice";
import RadarCard from "./test/RadarCard";
import SpiritualInspiration from "./test/SpiritualInspiration.native";
import TextProgressCard from "./test/TextProgressCard";
import TraitCard from "./test/TraitCard";
import VisualDashboard from "./test/VisualDashboard";

interface PosterImageProps {
  width: number;
  height: number;
  avatar?: ImageSourcePropType;
  testData?: TestReportResponse;
  onReady?: (imageUri: string) => void;
}

export default function PosterImage({
  width,
  height,
  avatar,
  testData,
  onReady,
}: PosterImageProps) {
  const viewRef = useRef<any>(null);
  const { t } = useTranslation();

  // 获取应用商店链接
  const getStoreUrl = () => {
    if (Platform.OS === "android") {
      return (
        "https://play.google.com/store/apps/details?id=" +
        Constants.expoConfig?.android?.package
      );
    }
    return (
      "https://apps.apple.com/app/id" +
      Constants.expoConfig?.ios?.bundleIdentifier
    );
  };

  // 生成图片的函数
  const generateImage = async () => {
    if (!viewRef.current) return;

    try {
      // 使用 react-native-view-shot 生成图片
      const imageUri = await viewRef.current.capture({
        format: "png",
        quality: 1,
        result: "base64",
      });

      // 调用回调
      if (onReady) {
        onReady(`data:image/png;base64,${imageUri}`);
      }
    } catch (error) {
      console.error("生成图片失败:", error);
    }
  };

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

  // 当组件挂载完成后生成图片
  useEffect(() => {
    setTimeout(() => {
      generateImage();
    }, 200);
  }, []);

  return (
    <ViewShot
      ref={viewRef}
      options={{
        format: "png",
        quality: 1,
        result: "base64",
      }}
      style={[
        styles.container,
        {
          width,
          maxHeight: height,
          overflow: "hidden",
        },
      ]}
    >
      {/* 背景渐变 */}
      <LinearGradient
        colors={["#19DBF2", "#FFFFFF", "#FFFFFF"]}
        locations={[0, 0.5, 1]}
        style={styles.background}
      />

      <View style={{ paddingVertical: 20, paddingHorizontal: 16 }}>
        {/* 顶部Logo和标题 */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logoIcon}
              contentFit="cover"
            />
            <Text style={styles.logoText}>{Constants.expoConfig?.name} </Text>
          </View>
        </View>

        {/* 内容区域 */}
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{t("test.result.title")}</Text>
            <Text style={styles.subtitle}>{t("test.result.subtitle")}</Text>
          </View>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerLine} />
          </View>
          {/* 使用 AvatarCard 组件 */}
          <View style={styles.cardContainer}>
            {testData && (
              <>
                {getTransformedReport(testData).components.map(
                  (item: { type: BlockType; data: any }, index) =>
                    index === 0 ? (
                      <Fragment key={item.type}>
                        {renderComponent(item.type, item.data)}
                      </Fragment>
                    ) : null
                )}
              </>
            )}
          </View>
        </View>
      </View>
      <View style={styles.footerEmpty}></View>
      {/* 底部二维码区域 */}
      <LinearGradient colors={["#D2FEFF", "#FFFFFF"]} style={styles.footer}>
        <View style={styles.qrContainer}>
          <QRCode
            value={getStoreUrl()}
            size={72}
            backgroundColor="#FFFFFF"
            color="#000000"
          />
        </View>
        <View style={styles.downloadInfo}>
          <Text style={styles.downloadTitle}>{t("common.goToDownload")}</Text>
          <Text style={styles.downloadSubtitle}>
            {t("common.testYourMentalHealth")}
          </Text>
        </View>
      </LinearGradient>
    </ViewShot>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: -99999999,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    marginBottom: 12,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  logoIcon: {
    width: 24,
    height: 24,
  },
  logoText: {
    fontFamily: "Outfit-Medium",
    fontSize: 18,
    color: "#0C0A09",
    textTransform: "capitalize",
    ...createFontStyle("500"),
  },
  content: {
    alignItems: "center",
  },
  titleContainer: {
    alignSelf: "stretch",
    gap: 6,
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    boxShadow: "0px 7.98px 33.059px 0px rgba(100, 100, 111, 0.10)",
  },
  title: {
    fontSize: 28,
    color: "#0C0A09",
    ...createFontStyle("700"),
  },
  subtitle: {
    fontSize: 14,
    color: "#515C66",
    ...createFontStyle("400"),
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 124,
  },
  dividerLine: {
    width: 8,
    height: 16,
    backgroundColor: "#ffffff",
  },
  cardContainer: {
    width: "100%",
  },
  footerEmpty: {
    marginTop: -24,
    width: "100%",
    height: 170,
  },
  footer: {
    position: "absolute",
    width: "100%",
    bottom: 0,
    left: 0,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 12,
  },
  qrContainer: {
    width: 88,
    height: 88,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    padding: 8,
    boxShadow: "0px 2px 8px 0px rgba(126, 242, 242, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  downloadInfo: {
    alignItems: "center",
    gap: 8,
  },
  downloadTitle: {
    fontSize: 16,
    color: "#0C0A09",
    ...createFontStyle("600"),
  },
  downloadSubtitle: {
    fontSize: 12,
    color: "#515C66",
    ...createFontStyle("400"),
  },
});
