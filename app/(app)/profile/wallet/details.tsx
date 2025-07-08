import { icons } from "@/assets/static";
import BackBar from "@/components/ui/BackBar";
import { TabItem, Tabs } from "@/components/ui/Tabs";
import { createFontStyle } from "@/utils/typography";

import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 消费记录接口
interface ConsumptionRecord {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  date: string;
  time: string;
  amount: number;
  icon: any;
}

// 充值记录接口
interface RechargeRecord {
  id: string;
  type: "mastercard" | "paypal";
  paymentMethod: string;
  date: string;
  time: string;
  amount: number;
}

const PAGE_SIZE = 10;

// 消费记录列表组件
const ConsumptionList: React.FC<{
  onLoadData: (page: number, refresh?: boolean) => Promise<ConsumptionRecord[]>;
}> = ({ onLoadData }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<ConsumptionRecord[]>([]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setCurrentPage(1);
      setHasMore(true);
      const data = await onLoadData(1, true);
      setRecords(data);
    } finally {
      setRefreshing(false);
    }
  }, [onLoadData]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || refreshing) return;
    setLoading(true);
    try {
      const nextPage = currentPage + 1;
      const data = await onLoadData(nextPage);
      if (data.length > 0) {
        setRecords((prev) => [...prev, ...data]);
        setCurrentPage(nextPage);
      }
      setHasMore(data.length === PAGE_SIZE);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, currentPage, refreshing, onLoadData]);

  const renderFooter = useCallback(() => {
    const { t } = useTranslation();

    if (!hasMore)
      return (
        <View style={styles.footerContainer}>
          <Text style={styles.noMoreText}>{t("common.noMoreData")}</Text>
        </View>
      );
    if (!loading) return <View style={{ height: 40 }}></View>;
    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator color="#19DBF2" />
      </View>
    );
  }, [loading, hasMore]);

  const renderItem: ListRenderItem<ConsumptionRecord> = useCallback(
    ({ item }) => (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.cardLeft}>
            <View style={styles.iconRow}>
              <View style={styles.iconContainer}>
                <Image source={item.icon} style={styles.icon} />
              </View>
              <Text style={styles.title}>{item.title}</Text>
            </View>
            <View style={styles.subtitleContainer}>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
            <View style={styles.contentContainer}>
              <Text style={styles.testContent} numberOfLines={2}>
                {item.content}
              </Text>
            </View>
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>{item.date}</Text>
              <Text style={styles.dateText}>{item.time}</Text>
            </View>
          </View>
          <View style={styles.amountContainer}>
            <Text style={styles.operator}>-</Text>
            <Image
              source={require("@/assets/images/wallet/coin.png")}
              style={styles.coinIcon}
            />
            <Text style={styles.amount}>{item.amount}</Text>
          </View>
        </View>
      </View>
    ),
    []
  );

  return (
    <FlatList
      data={records}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      onEndReached={loadMore}
      onEndReachedThreshold={0.2}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ListFooterComponent={renderFooter}
      windowSize={5}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={8}
      style={styles.list}
    />
  );
};

// 充值记录列表组件
const RechargeList: React.FC<{
  onLoadData: (page: number, refresh?: boolean) => Promise<RechargeRecord[]>;
}> = ({ onLoadData }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<RechargeRecord[]>([]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setCurrentPage(1);
      setHasMore(true);
      const data = await onLoadData(1, true);
      setRecords(data);
    } finally {
      setRefreshing(false);
    }
  }, [onLoadData]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || refreshing) return;
    setLoading(true);
    try {
      const nextPage = currentPage + 1;
      const data = await onLoadData(nextPage);
      if (data.length > 0) {
        setRecords((prev) => [...prev, ...data]);
        setCurrentPage(nextPage);
      }
      setHasMore(data.length === PAGE_SIZE);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, currentPage, refreshing, onLoadData]);

  const renderFooter = useCallback(() => {
    const { t } = useTranslation();
    if (!hasMore)
      return (
        <View style={styles.footerContainer}>
          <Text style={styles.noMoreText}>{t("common.noMoreData")}</Text>
        </View>
      );
    if (!loading) return <View style={{ height: 40 }}></View>;
    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator color="#19DBF2" />
      </View>
    );
  }, [loading, hasMore]);

  const renderPaymentIcon = useCallback(
    (paymentType: RechargeRecord["type"]) => {
      switch (paymentType) {
        case "mastercard":
          return (
            <Image
              source={require("@/assets/images/wallet/mastercard.png")}
              style={styles.paymentIcon}
            />
          );
        case "paypal":
          return (
            <Image
              source={require("@/assets/images/wallet/paypal.png")}
              style={styles.paymentIcon}
            />
          );
      }
    },
    []
  );

  const renderItem: ListRenderItem<RechargeRecord> = useCallback(
    ({ item }) => (
      <View style={styles.rechargeCard}>
        <View style={styles.rechargeCardContent}>
          <View style={styles.cardLeft}>
            <View style={styles.iconRow}>
              <View style={styles.paymentIconContainer}>
                {renderPaymentIcon(item.type)}
              </View>
              <View style={{ gap: 8 }}>
                <Text style={styles.paymentMethod}>{item.paymentMethod}</Text>
                <View style={styles.dateContainer}>
                  <Text style={styles.dateText}>{item.date}</Text>
                  <Text style={styles.dateText}>{item.time}</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.amountContainer}>
            <Text style={styles.operator}>+</Text>
            <Image
              source={require("@/assets/images/wallet/coin.png")}
              style={styles.coinIcon}
            />
            <Text style={[styles.amount]}>{item.amount}</Text>
          </View>
        </View>
      </View>
    ),
    [renderPaymentIcon]
  );

  return (
    <FlatList
      data={records}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      onEndReached={loadMore}
      onEndReachedThreshold={0.2}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ListFooterComponent={renderFooter}
      windowSize={5}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={8}
      style={styles.list}
    />
  );
};

export default function Details() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"recharge" | "consumption">(
    "recharge"
  );

  const tabs: TabItem[] = [
    { key: "recharge", title: "充值记录" },
    { key: "consumption", title: "消费记录" },
  ];

  const handleTabChange = useCallback((key: string) => {
    setActiveTab(key as "recharge" | "consumption");
  }, []);

  const handleLoadConsumptionData = useCallback(
    async (page: number, refresh?: boolean) => {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 模拟消费记录数据
      const data = Array.from({ length: page < 4 ? PAGE_SIZE : 5 }).map(
        (_, index) => ({
          id: `consumption-${page}-${Date.now()}-${index}`,
          title: "MBTI Test",
          subtitle: "Five Elements Personality Test",
          content:
            "Gold, Wood, Water, Fire, Earth - which personality do you belong to?",
          date: "2027.02.23",
          time: "12:32:32",
          amount: 1232,
          icon: icons[0].icon,
        })
      );

      return data;
    },
    []
  );

  const handleLoadRechargeData = useCallback(
    async (page: number, refresh?: boolean) => {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 模拟充值记录数据
      const data: RechargeRecord[] = Array.from({
        length: page < 4 ? PAGE_SIZE : 5,
      }).map((_, index) => {
        const type =
          index % 2 === 0 ? ("mastercard" as const) : ("paypal" as const);
        return {
          id: `recharge-${page}-${Date.now()}-${index}`,
          type,
          paymentMethod: type === "mastercard" ? "Mastercard" : "PayPal",
          date: "2027.02.23",
          time: "12:32:32",
          amount: 100,
        };
      });

      return data;
    },
    []
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <BackBar title={t("coinDetail.title")} />
      <View style={styles.content}>
        <Tabs
          tabs={tabs}
          activeKey={activeTab}
          onChange={handleTabChange}
          containerStyle={styles.tabsContainer}
          tabStyle={styles.tab}
          textStyle={styles.tabText}
        />
        {activeTab === "consumption" ? (
          <ConsumptionList onLoadData={handleLoadConsumptionData} />
        ) : (
          <RechargeList onLoadData={handleLoadRechargeData} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  tabsContainer: {
    width: "100%",
    height: 44,
    marginBottom: 12,
  },
  tab: {
    height: 40,
  },
  tabText: {
    fontSize: 12,
    ...createFontStyle("400"),
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 20,
    minHeight: Dimensions.get("window").height - 200,
  },
  list: {
    flex: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 12,
    marginBottom: 10,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  cardLeft: {
    flex: 1,
    gap: 8,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 40,
    backgroundColor: "#DDF9FF",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 24,
    height: 24,
  },
  title: {
    fontSize: 14,
    ...createFontStyle("500"),
    color: "#0C0A09",
  },
  subtitleContainer: {
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    ...createFontStyle("700"),
    color: "#0C0A09",
  },
  contentContainer: {
    marginTop: 4,
    marginBottom: 8,
  },
  testContent: {
    fontSize: 12,
    ...createFontStyle("400"),
    color: "#A9AEB8",
  },
  dateContainer: {
    flexDirection: "row",
    gap: 8,
  },
  dateText: {
    fontSize: 10,
    ...createFontStyle("400"),
    color: "#A9AEB8",
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  operator: {
    fontSize: 16,
    ...createFontStyle("500"),
    color: "#0C0A09",
  },
  coinIcon: {
    width: 20,
    height: 20,
  },
  amount: {
    fontSize: 16,
    ...createFontStyle("500"),
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    gap: 8,
  },
  noMoreText: {
    fontSize: 12,
    ...createFontStyle("400"),
    color: "rgba(12, 10, 9, 0.4)",
  },
  rechargeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  rechargeCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 11,
  },
  paymentIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 36,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    padding: 10.8,
  },
  paymentIcon: {
    width: 36,
    height: 36,
  },
  paymentMethod: {
    fontSize: 16,
    ...createFontStyle("500"),
    lineHeight: 22.4,
    letterSpacing: 0.2,
    color: "#0D0D12",
  },
});
