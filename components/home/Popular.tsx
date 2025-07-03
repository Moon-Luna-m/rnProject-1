import { avatars, icons } from "@/assets/static";
import { GetTestListByTypeResponse } from "@/services/testServices";
import { randomPick } from "@/utils/common";
import { createFontStyle } from "@/utils/typography";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import SearchResultCard from "./SearchResultCard";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  icon: string;
  price: number;
  originalPrice: number;
  rating: number;
  participants: number;
  avatars: string[];
}

const PAGE_SIZE = 10;

const generateMockData = (page: number): SearchResult[] => {
  const startIndex = (page - 1) * PAGE_SIZE;
  return Array.from({ length: PAGE_SIZE }, (_, index) => ({
    id: `${startIndex + index + 1}`,
    title: "Five Elements Personality Test",
    description:
      "Which personality do you belong to: Metal, Wood, Water, Fire, or Earth?",
    icon: randomPick(icons).icon,
    price: 32,
    originalPrice: 42,
    rating: 4.5,
    participants: 1200,
    avatars: [randomPick(avatars), randomPick(avatars), randomPick(avatars)],
  }));
};

const mockData = generateMockData(1);

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_GAP = 12;
const HORIZONTAL_PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

export default function Popular({
  data,
}: {
  data: GetTestListByTypeResponse["list"];
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/home/fire.png")}
          style={styles.headerIcon}
        />
        <Text style={styles.headerTitle}>{t("home.popular.title")}</Text>
      </View>
      <View style={styles.content}>
        {data.map((item, index) => (
          <View key={index} style={styles.cardWrapper}>
            <SearchResultCard
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
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
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
    color: "#0C0A09",
    ...createFontStyle("600"),
  },
  content: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: HORIZONTAL_PADDING,
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardWrapper: {
    width: "48%",
    marginBottom: 0,
  },
});
