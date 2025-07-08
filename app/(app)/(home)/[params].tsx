import SearchResultCard from "@/components/home/SearchResultCard";
import BackBar from "@/components/ui/BackBar";
import {
  GetTestListByTypeResponse,
  testService,
} from "@/services/testServices";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ListView() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { params } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<GetTestListByTypeResponse["list"]>([]);

  const getList = async () => {
    setLoading(true);
    const res = await testService.getTestListByType({
      popular: params === "popular",
      rec: params === "recommend",
      page: 1,
      size: 30,
    });
    if (res.code === 200) {
      setData(res.data.list);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      getList();
    }, [])
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <BackBar title={t(`home.list.${params}`)} />
      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#19DBF2" />
          </View>
        ) : data.length === 0 ? (
          <EmptySearchResult />
        ) : (
          <View style={styles.listContainer}>
            {data.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.cardWrapper,
                  {
                    paddingRight: index % 2 === 0 ? 6 : 0,
                    paddingLeft: index % 2 === 0 ? 0 : 6,
                    marginBottom: 12,
                  },
                ]}
              >
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
        )}
      </ScrollView>
    </View>
  );
}

const EmptySearchResult = () => {
  const { t } = useTranslation();
  return (
    <View style={styles.emptyContainer}>
      <Image
        source={require("@/assets/images/home/no-data.png")}
        style={styles.emptyImage}
      />
      <Text style={styles.emptyTitle}>{t("home.search.noContent")}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  listContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardWrapper: {
    width: "50%",
    marginBottom: 0,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  emptyImage: {
    width: 140,
    height: 140,
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: "Outfit-Medium",
    fontSize: 14,
    lineHeight: 18,
    color: "#282828",
    marginBottom: 8,
  },
});
