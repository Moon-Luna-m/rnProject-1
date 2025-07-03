import Collect from "@/components/test/icons/CollectIcon";
import {
  GetTestListByTypeResponse,
  testService,
} from "@/services/testServices";
import { showNotification } from "@/store/slices/notificationSlice";
import { formatCurrency, formatDuration } from "@/utils/common";
import { createFontStyle } from "@/utils/typography";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";

type FavoriteItem = GetTestListByTypeResponse["list"][0];

// 自定义 hook 用于管理列表数据和加载状态
const useFavoritesList = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<FavoriteItem[]>([]);

  // 刷新数据
  const onRefresh = useCallback(async (loading?: boolean) => {
    setRefreshing(loading ?? true);
    try {
      const res = await testService.getUserFavorite({
        page: 1,
        size: 20,
      });
      if (res.code === 200) {
        setData(res.data.list || []);
        setPage(1);
        setHasMore(res.data.list?.length < res.data.count);
      }
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // 加载更多
  const onLoadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await testService.getUserFavorite({
        page: page + 1,
        size: 20,
      });
      if (res.code === 200) {
        const newData = res.data.list || [];
        setData((prev) => [...prev, ...newData]);
        setPage((prev) => prev + 1);
        setHasMore(data.length + newData.length < res.data.count);
      }
    } catch (error) {
      console.error("Load more error:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, data.length]);

  // 初始化加载
  useEffect(() => {
    onRefresh(false);
  }, []);

  return {
    data,
    refreshing,
    loading,
    hasMore,
    onRefresh,
    onLoadMore,
  };
};

function FavoriteCard({
  item,
  onRefresh,
}: {
  item: FavoriteItem;
  onRefresh: (loading?: boolean) => void;
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const handleDelete = useCallback(() => {
    testService.deleteTestFromFavorite({ test_id: item.id }).then((res) => {
      if (res.code === 200) {
        dispatch(
          showNotification({
            message: t("favorites.card.deleteSuccess"),
            type: "default",
          })
        );
        onRefresh(false);
      }
    });
  }, [item.id, onRefresh]);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.desc}
          </Text>
          <View style={styles.cardStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>
                {t("favorites.card.questionCount")}:
              </Text>
              <Text style={styles.statValue}>{item.question_count}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>
                {t("favorites.card.timeTaken")}:
              </Text>
              <Text style={styles.statValue}>
                {formatDuration(item.answer_time, "minutes")}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          activeOpacity={0.5}
          onPress={handleDelete}
        >
          <Collect />
        </TouchableOpacity>
      </View>
      <View style={styles.cardFooter}>
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>
            {item.discount_price
              ? formatCurrency(item.discount_price)
              : t("home.recommend.free")}
          </Text>
          {item.discount_price !== 0 && (
            <Text style={styles.originalPrice}>
              {formatCurrency(item.price)}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.startButton}
          activeOpacity={0.5}
          onPress={() => {
            router.push({
              pathname: "/test/[id]",
              params: {
                id: item.id.toString(),
              },
            });
          }}
        >
          <AntDesign name="arrowright" size={16} color="#19DBF2" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function Favorites() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { data, refreshing, loading, hasMore, onRefresh, onLoadMore } =
    useFavoritesList();

  // 处理滚动事件
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } =
        event.nativeEvent;

      // 只有当内容高度大于视图高度时才检查是否需要加载更多
      if (contentSize.height <= layoutMeasurement.height) {
        return;
      }

      const distanceFromBottom =
        contentSize.height - layoutMeasurement.height - contentOffset.y;

      if (distanceFromBottom < 50 && !loading && hasMore) {
        onLoadMore();
      }
    },
    [loading, hasMore, onLoadMore]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TouchableOpacity
        style={styles.backContainer}
        onPress={() => {
          router.back();
        }}
      >
        <Ionicons name="arrow-back-outline" size={24} color="black" />
        <Text style={styles.backText}>{t("favorites.title")}</Text>
      </TouchableOpacity>
      <View style={styles.content}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            Platform.OS !== "web" ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#19DBF2"]}
                tintColor="#19DBF2"
                titleColor="#19DBF2"
              />
            ) : undefined
          }
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {data.map((item) => (
            <FavoriteCard key={item.id} item={item} onRefresh={onRefresh} />
          ))}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#19DBF2" />
              <Text style={styles.loadingText}>{t("common.loading")}</Text>
            </View>
          )}
          {!hasMore && data.length > 0 && (
            <Text style={styles.noMoreText}>{t("common.noMoreData")}</Text>
          )}
          <View style={{ height: insets.bottom + 0 }} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  backContainer: {
    position: "relative",
    height: 44,
    width: "100%",
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  backText: {
    position: "absolute",
    inset: 0,
    textAlign: "center",
    paddingVertical: 10,
    fontSize: 18,
    color: "#0C0A09",
    ...createFontStyle("700"),
  },
  content: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 12,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    gap: 12,
  },
  cardInfo: {
    flex: 1,
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    lineHeight: 18,
    ...createFontStyle("600"),
    color: "#0C0A09",
  },
  cardDescription: {
    height: 30,
    fontSize: 12,
    lineHeight: 15,
    color: "#72818F",
  },
  cardStats: {
    flexDirection: "row",
    gap: 24,
    marginTop: 8,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statLabel: {
    fontSize: 10,
    lineHeight: 13,
    color: "#A9AEB8",
    ...createFontStyle("500"),
  },
  statValue: {
    fontSize: 12,
    lineHeight: 15,
    color: "#72818F",
    ...createFontStyle("500"),
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 100,
    backgroundColor: "#F5F7FA",
    justifyContent: "center",
    alignItems: "center",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  currentPrice: {
    fontSize: 18,
    lineHeight: 23,
    color: "#FF6F00",
    ...createFontStyle("700"),
  },
  originalPrice: {
    fontSize: 10,
    lineHeight: 13,
    color: "#A9AEB8",
    ...createFontStyle("400"),
    textDecorationLine: "line-through",
  },
  startButton: {
    width: 24,
    height: 24,
    borderRadius: 100,
    backgroundColor: "#F5F7FA",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: "#72818F",
    ...createFontStyle("400"),
  },
  noMoreText: {
    textAlign: "center",
    fontSize: 14,
    color: "#72818F",
    ...createFontStyle("400"),
    padding: 12,
  },
});
