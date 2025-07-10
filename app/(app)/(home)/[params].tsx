import SearchResultCard from "@/components/home/SearchResultCard";
import BackBar from "@/components/ui/BackBar";
import {
  GetTestListByTypeResponse,
  testService,
} from "@/services/testServices";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ListView() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { params } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<GetTestListByTypeResponse["list"]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const resetState = useCallback(() => {
    if (!isMounted.current) return;
    setData([]);
    setCurrentPage(1);
    setHasMore(true);
    setIsLoadingMore(false);
    setRefreshing(false);
    setLoading(false);
  }, []);

  const getList = async (page: number, isRefresh = false) => {
    if (!isRefresh && (isLoadingMore || !hasMore)) return;
    if (!isMounted.current) return;

    try {
      !isRefresh && setIsLoadingMore(true);
      isRefresh && setLoading(true);

      const res = await testService.getTestListByType({
        popular: params === "popular",
        rec: params === "recommend",
        page,
        size: 20,
      });

      if (res.code === 200 && isMounted.current) {
        const newData = res.data.list || [];
        if (isRefresh) {
          setData(newData);
        } else {
          setData((prev) => [...prev, ...newData]);
        }
        setHasMore(page * 20 < res.data.count);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Failed to fetch list:", error);
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
        setIsLoadingMore(false);
      }
    }
  };

  const onRefresh = useCallback(() => {
    if (loading || refreshing) return;
    setRefreshing(true);
    getList(1, true);
  }, [loading, refreshing]);

  const loadMore = useCallback(() => {
    if (loading || isLoadingMore || !hasMore || refreshing) return;
    getList(currentPage + 1);
  }, [loading, isLoadingMore, hasMore, refreshing, currentPage]);

  useFocusEffect(
    useCallback(() => {
      resetState();
      getList(1, true);
      return () => {
        resetState();
      };
    }, [resetState])
  );

  const renderItem = useCallback(
    ({
      item,
      index,
    }: {
      item: GetTestListByTypeResponse["list"][0];
      index: number;
    }) => (
      <View
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
    ),
    []
  );

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator color="#19DBF2" />
      </View>
    );
  }, [isLoadingMore]);

  const keyExtractor = useCallback((item: any) => item.id.toString(), []);

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <BackBar title={t(`home.list.${params}`)} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#19DBF2" />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <BackBar title={t(`home.list.${params}`)} />
      <View style={styles.content}>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          onEndReached={loadMore}
          onEndReachedThreshold={0.2}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            !loading && data.length === 0 && <EmptySearchResult />
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          removeClippedSubviews={true}
          maxToRenderPerBatch={20}
          windowSize={6}
        />
      </View>
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
    paddingBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardWrapper: {
    width: "50%",
  },
  emptyContainer: {
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
  footer: {
    paddingVertical: 16,
    alignItems: "center",
  },
});
