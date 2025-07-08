import { icons } from "@/assets/static";
import { GetTestListByTypeResponse } from "@/services/testServices";
import { formatCompact, formatCurrency, imgProxy } from "@/utils/common";
import { createFontStyle } from "@/utils/typography";
import React from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import StarIcon from "./StarIcon";

interface SearchResultCardProps {
  item: GetTestListByTypeResponse["list"][0];
  onPress?: () => void;
  showIcon?: boolean;
  disabled?: boolean;
}

export default function SearchResultCard({
  item,
  onPress,
  showIcon = true,
  disabled = false,
}: SearchResultCardProps) {
  const icon = icons[Number(item.image.split("/")[2].split(".")[0]) - 1];
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      style={[styles.container, !showIcon && { paddingTop: 16 }]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View style={styles.content}>
        <View style={[styles.header]}>
          {showIcon && (
            <View style={styles.iconContainer}>
              <Image source={icon.icon} style={styles.icon} />
            </View>
          )}
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.description} numberOfLines={1}>
              {item.desc}
            </Text>
          </View>
        </View>
        <View style={styles.footer}>
          <View style={styles.avatarGroup}>
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
            <Text style={styles.participants}>
              {item.total ? formatCompact(item.total) : ""}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.priceContainer}>
        <View style={styles.priceGroup}>
          <Text style={styles.price}>
            {item.discount_price === 0
              ? t("home.recommend.free")
              : formatCurrency(item.discount_price)}
          </Text>
          {item.discount_price !== 0 && (
            <Text style={styles.originalPrice}>
              {formatCurrency(item.price)}
            </Text>
          )}
        </View>
        <View style={styles.ratingContainer}>
          <StarIcon />
          <Text style={styles.rating}>{item.star}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 12,
    gap: 16,
    flex: 1,
  },
  content: {
    gap: 8,
  },
  header: {
    alignItems: "flex-start",
    gap: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 44.44,
    backgroundColor: "#C6F6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 26.67,
    height: 26.67,
  },
  titleContainer: {
    flex: 1,
    width: "100%",
    gap: 6,
  },
  title: {
    fontSize: 14,
    ...createFontStyle("500"),
    color: "#0C0A09",
  },
  description: {
    fontFamily: "Outfit",
    fontSize: 12,
    color: "#515C66",
  },
  footer: {
    height: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  avatarGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: -6,
  },
  avatar: {
    width: 16,
    height: 16,
    borderRadius: 19.2,
    borderWidth: 0.5,
    borderColor: "#FFFFFF",
  },
  participants: {
    marginLeft: 4,
    fontFamily: "Outfit",
    fontSize: 12,
    color: "#0C0A09",
    letterSpacing: 0.5,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  price: {
    fontSize: 16,
    ...createFontStyle("600"),
    color: "#FF6F00",
  },
  originalPrice: {
    fontFamily: "Outfit",
    fontSize: 10,
    color: "#A9AEB8",
    textDecorationLine: "line-through",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    fontSize: 12,
    ...createFontStyle("500"),
    color: "#0C0A09",
  },
});
