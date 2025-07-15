import { BlockType, TestReportResponse } from "@/services/testServices";
import { getTransformedReport } from "@/utils/reportTransformer";
import { createFontStyle } from "@/utils/typography";
import Constants from "expo-constants";
import { Image } from "expo-image";
import html2canvas from "html2canvas";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import AnalysisCard from "./test/AnalysisCard";
import AvatarCard from "./test/AvatarCard";
import BadgeCard from "./test/BadgeCard";
import GrowthPathCard from "./test/GrowthPathCard";
import PersonalizedAdvice from "./test/PersonalizedAdvice";
import RadarCard from "./test/RadarCard";
import SpiritualInspiration from "./test/SpiritualInspiration.web";
import TextProgressCard from "./test/TextProgressCard";
import TraitCard from "./test/TraitCard";
import VisualDashboard from "./test/VisualDashboard";

interface PosterImageProps {
  width: number;
  height: number;
  avatar?: ImageSourcePropType;
  testData?: TestReportResponse;
  onClose?: () => void;
}

export default function PosterImageWeb({
  width,
  height,
  avatar,
  testData,
  onClose,
}: PosterImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 获取应用商店链接
  const getStoreUrl = (platform: "android" | "ios") => {
    if (platform === "android") {
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

  // 生成海报图片
  const generatePoster = async () => {
    if (!containerRef.current) return;
    try {
      // 使用 html2canvas 生成图片
      const canvas = await html2canvas(containerRef.current, {
        useCORS: true,
        scale: 10,
        logging: false,
        backgroundColor: null,
      });

      // 调用回调，返回图片 URI
      const imageUri = canvas.toDataURL("image/png");
      setImageUri(imageUri);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
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

  useEffect(() => {
    // 添加一个小延时确保组件完全渲染
    const timer = setTimeout(() => {
      generatePoster();
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
      }}
    >
      <div
        style={{ position: "absolute", top: 28, right: 24 }}
        onClick={() => {
          onClose?.();
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
          {t("common.close")}
        </Text>
      </div>
      <div
        ref={containerRef}
        style={{
          width,
          height,
          overflow: "hidden",
          position: "absolute",
          left: "100%",
          top: "100%",
          zIndex: 100,
        }}
      >
        {/* 背景渐变 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(180deg, #19DBF2 0%, #FFFFFF 50%, #FFFFFF 100%)",
          }}
        />

        <div style={{ padding: "20px 16px" }}>
          {/* 顶部Logo和标题 */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require("@/assets/images/logo.png")}
                style={styles.logoIcon}
                contentFit="cover"
              />
              <Text style={styles.logoText}>{Constants.expoConfig?.name} </Text>
              <Text style={{ marginLeft: "auto", marginBottom: 14 }}>
                ({t("common.longPressToShare")})
              </Text>
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
        </div>

        {/* 底部二维码区域 */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            padding: "12px 16px",
            background: "linear-gradient(180deg, #D2FEFF 0%, #FFFFFF 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <View style={styles.qrContainer}>
                <QRCode
                  value={getStoreUrl("android")}
                  size={72}
                  backgroundColor="#FFFFFF"
                  color="#000000"
                />
              </View>
              <Text style={styles.downloadTitle}>Android</Text>
            </View>
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <View style={styles.qrContainer}>
                <QRCode
                  value={getStoreUrl("ios")}
                  size={72}
                  backgroundColor="#FFFFFF"
                  color="#000000"
                />
              </View>
              <Text style={styles.downloadTitle}>iOS</Text>
            </View>
          </View>
          <View style={styles.downloadInfo}>
            <Text style={styles.downloadTitle}>{t("common.goToDownload")}</Text>
            <Text style={styles.downloadSubtitle}>
              {t("common.testYourMentalHealth")}
            </Text>
          </View>
        </div>
      </div>
      {isLoading && (
        <div
          style={{
            width,
            height: height,
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)  scale(0.8)",
            backgroundColor: "#fff",
            zIndex: 100,
          }}
        >
          <ActivityIndicator
            size="large"
            color="#19DBF2"
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>
      )}
      {imageUri && (
        <div
          style={{
            width,
            maxHeight: height,
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)   scale(0.8)",
            zIndex: 100,
          }}
        >
          <Image source={{ uri: imageUri }} style={{ width, height: 700 }} />
        </div>
      )}
    </div>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 18,
    color: "#0C0A09",
    marginBottom: 14,
    textTransform: "capitalize",
    ...createFontStyle("500"),
  },
  content: {
    alignItems: "center",
    overflow: "hidden",
  },
  titleContainer: {
    alignSelf: "stretch",
    gap: 6,
    padding: 16,
    paddingTop: 0,
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
