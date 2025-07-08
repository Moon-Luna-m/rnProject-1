import BackBar from "@/components/ui/BackBar";
import { Tabs } from "@/components/ui/Tabs";
import {
  GetUserTestHistoryResponse,
  testService,
} from "@/services/testServices";
import { formatDate, formatDateTime, setLocalCache } from "@/utils/common";
import { createFontStyle } from "@/utils/typography";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
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
import { Button } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 自定义 hook 用于管理列表数据和加载状态
const useReviewList = (
  type: "completed" | "incomplete",
  onCountChange: (count: number) => void
) => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reloadLoading, setReloadLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<GetUserTestHistoryResponse["list"]>([]);

  // 重置状态
  const resetState = useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    setLoading(false);
    setRefreshing(false);
    setReloadLoading(false);
  }, []);

  // 刷新数据
  const onRefresh = useCallback(
    async (loading?: boolean) => {
      if (loading) return;
      setRefreshing(loading ?? true);
      setReloadLoading(true);
      try {
        const res = await testService.getUserTestHistory({
          status: type === "completed" ? 1 : 0,
          page: 1,
          size: 20,
        });
        if (res.code === 200) {
          setData(res.data.list);
          setPage(1);
          setHasMore(res.data.list.length < res.data.count);
          onCountChange(res.data.count);
        }
      } catch (error) {
        console.error(`Refresh error for ${type}:`, error);
      } finally {
        setRefreshing(false);
        setReloadLoading(false);
      }
    },
    [type, loading, onCountChange]
  );

  // 加载更多
  const onLoadMore = useCallback(async () => {
    if (loading || !hasMore || refreshing) return;

    setLoading(true);
    try {
      const res = await testService.getUserTestHistory({
        status: type === "completed" ? 1 : 0,
        page: page + 1,
        size: 20,
      });

      if (res.code === 200) {
        const newData = res.data.list || [];
        setData((prev) => [...prev, ...newData]);
        setPage((prev) => prev + 1);
        setHasMore(data.length + newData.length < res.data.count);
        onCountChange(res.data.count);
      }
    } catch (error) {
      console.error(`Load more error for ${type}:`, error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, type, refreshing, data.length, onCountChange]);

  return {
    data,
    refreshing,
    loading,
    hasMore,
    onRefresh,
    onLoadMore,
    resetState,
    reloadLoading,
  };
};

export default function Review() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeTab, setActiveTab] = useState<"completed" | "incomplete">(
    "completed"
  );
  const [completedCount, setCompletedCount] = useState(0);
  const [incompleteCount, setIncompleteCount] = useState(0);
  const isFirstLoad = useRef(true);

  // 使用自定义 hook 管理不同 tab 的数据
  const completedList = useReviewList("completed", setCompletedCount);
  const incompleteList = useReviewList("incomplete", setIncompleteCount);

  // 初始化数据
  useFocusEffect(
    useCallback(() => {
      async function initData() {
        await completedList.onRefresh(false);
        await incompleteList.onRefresh(false);
        isFirstLoad.current = false;
      }
      initData();
    }, [])
  );

  const tabs = useMemo(
    () => [
      {
        key: "completed",
        title: t("review.tabs.completed", { count: completedCount }),
      },
      {
        key: "incomplete",
        title: t("review.tabs.incomplete", { count: incompleteCount }),
      },
    ],
    [t, completedCount, incompleteCount]
  );

  // 根据当前激活的 tab 获取对应的数据和方法
  const currentList =
    activeTab === "completed" ? completedList : incompleteList;

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

      if (
        distanceFromBottom < 50 &&
        !currentList.loading &&
        currentList.hasMore
      ) {
        currentList.onLoadMore();
      }
    },
    [currentList]
  );

  // 处理 tab 切换
  const handleTabChange = useCallback(
    (key: string) => {
      if (key === activeTab) return;
      // 重置当前列表状态
      currentList.resetState();
      // 切换标签
      setActiveTab(key as "completed" | "incomplete");
      // 立即滚动到顶部，不需要动画
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });
    },
    [currentList]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      const res = await testService.deleteUserTest({ test_id: id });
      if (res.code === 200) {
        currentList.onRefresh(false);
      }
    },
    [currentList]
  );

  const handleContinue = useCallback(
    async (item: GetUserTestHistoryResponse["list"][0]) => {
      await setLocalCache("user_test_way", "user");
      await setLocalCache("user_test_id", String(item.id));
      router.push(`/test/start/${item.test_id}`);
    },
    []
  );

  // 监听标签变化，重新请求数据（仅在非首次加载时执行）
  useEffect(() => {
    if (!isFirstLoad.current) {
      currentList.onRefresh(false);
    }
  }, [activeTab]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#B7E8FF", "#F5F7FA"]} style={styles.gradient} />
      <View style={[styles.content, { paddingTop: insets.top }]}>
        <BackBar title={t("review.title")} />
        <Tabs
          tabs={tabs}
          activeKey={activeTab}
          onChange={handleTabChange}
          containerStyle={styles.typeSwitch}
        />
        <ScrollView
          ref={scrollViewRef}
          style={[
            styles.scrollView,
            Platform.OS === "web" && styles.webScrollView,
          ]}
          refreshControl={
            Platform.OS !== "web" ? (
              <RefreshControl
                refreshing={currentList.refreshing}
                onRefresh={currentList.onRefresh}
                colors={["#19DBF2"]}
                tintColor="#19DBF2"
                titleColor="#19DBF2"
              />
            ) : undefined
          }
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          {currentList.data.length <= 0 && !currentList.reloadLoading ? (
            <EmptySearchResult />
          ) : (
            currentList.data.map((item) => (
              <ReviewCard
                key={item.id}
                item={item}
                type={activeTab}
                onDelete={() => {
                  handleDelete(item.test_id);
                }}
                onContinue={() => {
                  handleContinue(item);
                }}
              />
            ))
          )}
          {currentList.loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#19DBF2" />
              <Text style={styles.loadingText}>{t("common.loading")}</Text>
            </View>
          )}
          {!currentList.hasMore && currentList.data.length > 0 && (
            <Text style={styles.noMoreText}>{t("common.noMoreData")}</Text>
          )}
          <View style={{ height: insets.bottom + 0 }} />
        </ScrollView>
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

function ReviewCard({
  item,
  type,
  onDelete,
  onContinue,
}: {
  item: GetUserTestHistoryResponse["list"][0];
  type: "completed" | "incomplete";
  onDelete: () => void;
  onContinue: () => void;
}) {
  const { t } = useTranslation();

  const date = formatDate(item.start_time);
  const time = formatDateTime(item.start_time, "HH:mm:ss");

  if (type === "incomplete") {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.test_name}
            </Text>
            <Text style={styles.cardDescription} numberOfLines={2}>
              {item.test_desc}
            </Text>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{date}</Text>
              <Text style={styles.timeText}>{time}</Text>
            </View>
          </View>
          <TouchableOpacity activeOpacity={0.5} onPress={onDelete}>
            <View style={styles.warningIcon}>
              <MaterialIcons name="delete-outline" size={24} color="#EB5735" />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.progressSection}>
          <LinearGradient
            colors={["#FAFEFF", "#E2FBFF"]}
            style={styles.progressGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <View style={styles.progressWrapper}>
              <View style={styles.progressHeader}>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressLabel}>
                    {t("review.card.progress")}:
                  </Text>
                  <View style={styles.progressNumbers}>
                    <Text style={styles.progressCurrent}>
                      {item.progress || 0}
                    </Text>
                    <Text style={styles.progressSeparator}>/</Text>
                    <Text style={styles.progressTotal}>
                      {item.question_count || 0}
                    </Text>
                  </View>
                </View>
                <Text style={styles.progressPercentage}>
                  {Math.round(
                    ((item.progress || 0) / (item.question_count || 0)) * 100
                  )}
                  %
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.round(
                        ((item.progress || 0) / (item.question_count || 0)) *
                          100
                      )}%`,
                    },
                  ]}
                />
              </View>
            </View>
            <Button
              mode="contained"
              style={styles.continueButton}
              contentStyle={styles.continueButtonContent}
              labelStyle={styles.continueButtonText}
              onPress={onContinue}
            >
              {t("review.card.continue")}
            </Button>
          </LinearGradient>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.test_name}
          </Text>
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.test_desc}
          </Text>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{date}</Text>
            <Text style={styles.timeText}>{time}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.detailsButton}
          activeOpacity={0.5}
          onPress={() => {
            router.push(`/test/${item.test_id}`);
          }}
        >
          <Text style={styles.detailsText}>{t("review.card.details")}</Text>
          <AntDesign name="arrowright" size={16} color="#19DBF2" />
        </TouchableOpacity>
      </View>
      <View style={styles.cardActions}>
        <Button
          mode="outlined"
          style={styles.generateButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.generateButtonText}
          rippleColor="rgba(0, 0, 0, 0.03)"
          onPress={() => {
            router.push(`/test/result/${item.test_id}`);
          }}
        >
          {t("review.card.generateReport")}
        </Button>
        {/* <Button
          mode="contained"
          style={styles.testAgainButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.testAgainButtonText}
          onPress={async () => {
            await setLocalCache("user_test_way", "system");
            router.push(`/test/start/${item.test_id}`);
          }}
        >
          {t("review.card.testAgain")}
        </Button> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  gradient: {
    position: "absolute",
    width: "100%",
    height: 375,
    left: 0,
    top: 0,
  },
  content: {
    flex: 1,
  },
  typeSwitch: {
    marginHorizontal: 24,
    marginTop: 12,
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
    gap: 20,
    paddingHorizontal: 16,
  },
  card: {
    height: 161,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 12,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 14,
    lineHeight: 18,
    ...createFontStyle("600"),
    color: "#0C0A09",
  },
  cardDescription: {
    height: 32,
    ...createFontStyle("400"),
    fontSize: 12,
    lineHeight: 15,
    color: "#515C66",
  },
  timeContainer: {
    flexDirection: "row",
    gap: 8,
  },
  timeText: {
    ...createFontStyle("400"),
    fontSize: 10,
    lineHeight: 13,
    color: "#A9AEB8",
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    borderRadius: 100,
    paddingVertical: 8,
    paddingLeft: 12,
    paddingRight: 6,
    gap: 2,
  },
  detailsText: {
    fontSize: 12,
    lineHeight: 16,
    ...createFontStyle("700"),
    color: "#19DBF2",
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  generateButton: {
    flex: 1,
    borderRadius: 78,
    borderColor: "#19DBF2",
  },
  testAgainButton: {
    flex: 1,
    borderRadius: 78,
    backgroundColor: "#19DBF2",
  },
  buttonContent: {
    height: 40,
  },
  generateButtonText: {
    ...createFontStyle("600"),
    fontSize: 14,
    lineHeight: 18,
    color: "#19DBF2",
    textTransform: "capitalize",
  },
  testAgainButtonText: {
    ...createFontStyle("600"),
    fontSize: 14,
    lineHeight: 18,
    color: "#FFFFFF",
    textTransform: "capitalize",
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
    color: "#515C66",
    ...createFontStyle("400"),
  },
  noMoreText: {
    textAlign: "center",
    fontSize: 14,
    color: "#515C66",
    ...createFontStyle("400"),
    padding: 12,
  },
  webScrollView: {
    paddingTop: 0,
    marginTop: 0,
  },
  progressSection: {
    flexDirection: "row",
    alignContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F5F7FA",
  },
  progressGradient: {
    flex: 1,
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    gap: 24,
  },
  progressWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  progressInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  progressLabel: {
    ...createFontStyle("700"),
    fontSize: 12,
    lineHeight: 15,
    color: "#0C0A09",
  },
  progressNumbers: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  progressCurrent: {
    ...createFontStyle("600"),
    fontSize: 12,
    lineHeight: 15,
    color: "#0C0A09",
  },
  progressSeparator: {
    fontSize: 12,
    lineHeight: 15,
    ...createFontStyle("500"),
    color: "#A9AEB8",
  },
  progressTotal: {
    ...createFontStyle("400"),
    fontSize: 12,
    lineHeight: 15,
    color: "#A9AEB8",
  },
  progressPercentage: {
    ...createFontStyle("400"),
    fontSize: 12,
    lineHeight: 15,
    color: "#19DBF2",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#19DBF2",
    borderRadius: 8,
  },
  continueButton: {
    height: 32,
    borderRadius: 100,
    backgroundColor: "#19DBF2",
  },
  continueButtonContent: {
    margin: 0,
  },
  continueButtonText: {
    ...createFontStyle("700"),
    color: "#FFFFFF",
    lineHeight: 14,
    marginHorizontal: 10,
  },
  warningIcon: {
    width: 32,
    height: 32,
    borderRadius: 100,
    backgroundColor: "#F5F7FA",
    justifyContent: "center",
    alignItems: "center",
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
