import { icons } from "@/assets/static";
import { GetTestListByTypeResponse } from "@/services/testServices";
import { formatCompact, formatCurrency, imgProxy } from "@/utils/common";
import { createFontStyle } from "@/utils/typography";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import StarIcon from "./StarIcon";

interface RecommendCardProps {
  item: GetTestListByTypeResponse["list"][0];
  onPress?: () => void;
}

const WIDTH = Dimensions.get("window").width;

const RecommendCard: React.FC<RecommendCardProps> = ({ item, onPress }) => {
  const icon = icons[Number(item.image.split("/")[2].split(".")[0]) - 1];
  const { t } = useTranslation();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={[icon.bg.from, icon.bg.to]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Image
        source={icon.icon}
        style={[
          styles.cardIcon,
          {
            transform: [{ rotate: `${icon.rotate}deg` }],
          },
        ]}
        resizeMode="contain"
      />
      <View style={styles.cardContent}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.cardSubtitle} numberOfLines={1}>
            {item.desc}
          </Text>
          <View style={styles.participants}>
            <View style={styles.avatars}>
              {item.user_avatars?.slice(0, 3).map((avatar, index) => (
                <Image
                  key={index}
                  source={{ uri: imgProxy(avatar) }}
                  style={[
                    styles.avatar,
                    {
                      marginLeft: index > 0 ? -6 : 0,
                      zIndex: 3 - index,
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.participantsCount}>
              {item.total ? formatCompact(item.total) : ""}
            </Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.priceContainer}>
            <Text
              style={[
                styles.price,
                item.discount_price === 0 && {
                  color: "#42B969",
                },
              ]}
            >
              {item.discount_price === 0
                ? t("home.recommend.free")
                : `${formatCurrency(item.discount_price)}`}
            </Text>
            {item.discount_price !== 0 && (
              <Text style={styles.originalPrice}>
                {formatCurrency(item.price)}
              </Text>
            )}
          </View>
          <View style={styles.rating}>
            <StarIcon />
            <Text style={styles.ratingText}>{item.star}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function TodayRecommend({
  data,
}: {
  data: GetTestListByTypeResponse["list"];
}) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/home/well.png")}
          style={styles.headerIcon}
        />
        <Text style={styles.headerTitle}>{t("home.recommend.title")}</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            router.push({
              pathname: "/(app)/(home)/[params]",
              params: {
                params: "recommend",
              },
            });
          }}
          style={styles.headerMoreWrapper}
        >
          <Text style={styles.headerMore}>{t("common.more")}</Text>
          <Image
            source={require("@/assets/images/common/arrow-right.png")}
            style={{
              width: 20,
              height: 20,
            }}
          />
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {data.map((item, index) => (
          <RecommendCard
            key={index}
            item={item}
            onPress={() => {
              router.push({
                pathname: "/test/[id]",
                params: {
                  id: item.id.toString(),
                },
              });
            }}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // marginTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 12,
  },
  headerIcon: {
    width: 20,
    height: 20,
  },
  headerTitle: {
    fontSize: 16,
    lineHeight: 20,
    ...createFontStyle("600"),
    color: "#0C0A09",
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 12,
  },
  card: {
    width: (WIDTH - 44) / 2,
    height: 180,
    borderRadius: 20,
    overflow: "hidden",
  },
  cardIcon: {
    position: "absolute",
    top: 59,
    left: 56,
    width: 120,
    height: 120,
  },
  cardContent: {
    flex: 1,
    paddingTop: 16,
    justifyContent: "space-between",
  },
  cardInfo: {
    gap: 6,
    paddingHorizontal: 12,
  },
  cardTitle: {
    fontSize: 14,
    lineHeight: 18,
    color: "#FFFFFF",
    ...createFontStyle("500"),
  },
  cardSubtitle: {
    fontSize: 10,
    lineHeight: 13,
    color: "rgba(255, 255, 255, 0.6)",
    letterSpacing: 0.2,
    ...createFontStyle("400"),
  },
  participants: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  avatars: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 16,
    height: 16,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: "#FFFFFF",
  },
  participantsCount: {
    fontSize: 12,
    lineHeight: 15,
    color: "#FFFFFF",
    letterSpacing: 0.06,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    paddingHorizontal: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  price: {
    fontSize: 16,
    lineHeight: 20,
    color: "#FF6F00",
    ...createFontStyle("700"),
  },
  originalPrice: {
    fontSize: 10,
    lineHeight: 13,
    color: "#A9AEB8",
    textDecorationLine: "line-through",
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    lineHeight: 15,
    ...createFontStyle("400"),
    color: "#0C0A09",
  },
  headerMoreWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },
  headerMore: {
    color: "#515C66",
    fontSize: 12,
    lineHeight: 15,
    ...createFontStyle("500"),
  },
});
