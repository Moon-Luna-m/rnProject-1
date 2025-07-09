import SearchResultCard from "@/components/home/SearchResultCard";
import {
  GetTestListByTypeResponse,
  testService,
} from "@/services/testServices";

import { createFontStyle } from "@/utils/typography";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Route, TabBar, TabView } from "react-native-tab-view";
import { useCategoryModal } from "../../../../components/providers/CategoryModalProvider";

interface TabRoute extends Route {
  title: string;
}

const initialLayout = {
  width: Dimensions.get("window").width,
};

const TabContent = ({ route }: { route: TabRoute }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<GetTestListByTypeResponse["list"]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const resetState = useCallback(() => {
    setData([]);
    setCurrentPage(1);
    setHasMore(true);
    setIsLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      resetState();
      fetchData(1, true);
      return () => {
        // 页面失焦时清理状态
        resetState();
      };
    }, [resetState])
  );

  const fetchData = async (page: number, isRefresh = false) => {
    if (isLoading) return;

    !isRefresh && setIsLoading(true);
    try {
      const res = await testService.getTestListByType({
        type_id: Number(route.key),
        page,
        size: 20,
      });
      if (res.code === 200) {
        const newData = res.data.list || [];
        if (isRefresh) {
          setData(newData);
        } else {
          setData((prev) => [...prev, ...newData]);
        }
      }
      setHasMore(page * 20 < res.data.count);
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    if (isLoading) return;
    setRefreshing(true);
    fetchData(1, true);
  }, [isLoading, resetState]);

  const loadMore = () => {
    if (isLoading || !hasMore || refreshing) return;
    fetchData(currentPage + 1);
  };

  useEffect(() => {
    resetState();
    fetchData(1, true);
  }, [route.key, resetState]);

  const renderItem = ({
    item,
  }: {
    item: GetTestListByTypeResponse["list"][0];
  }) => (
    <View style={[styles.cardContainer, { width: "48%" }]}>
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
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator color="#0C0A09" />
      </View>
    );
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.resultList}
      showsVerticalScrollIndicator={false}
      onEndReached={loadMore}
      onEndReachedThreshold={0.2}
      ListFooterComponent={renderFooter}
      numColumns={2}
      columnWrapperStyle={styles.row}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
};

const renderScene = ({ route }: { route: TabRoute }) => (
  <TabContent route={route} />
);

export default function Category() {
  const [index, setIndex] = useState(0);
  const [routes, setRoutes] = useState<TabRoute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showModal, setOnSelect } = useCategoryModal();
  const insets = useSafeAreaInsets();

  const getTestTypeList = async () => {
    setIsLoading(true);
    setIndex(0);
    const res = await testService.getTestTypeList({
      page: 1,
      size: 20,
    });
    if (res.code === 200) {
      setRoutes(
        res.data.list.map((item) => ({
          key: item.id.toString(),
          title: item.name,
        }))
      );
    }
    setIsLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      getTestTypeList();
    }, [])
  );
  const arrowStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${180}deg`,
      },
    ],
  }));

  const handleCategoryPress = useCallback(
    (key: string) => {
      const newIndex = routes.findIndex((route) => route.key === key);
      if (newIndex !== -1) {
        setIndex(newIndex);
      }
    },
    [routes, index]
  );

  useEffect(() => {
    setOnSelect((index: string) => {
      setTimeout(() => {
        handleCategoryPress(index);
      }, 100);
    });
  }, [handleCategoryPress]);

  const handleExpandPress = useCallback(() => {
    showModal(routes, index);
  }, [routes, index, showModal]);

  const renderTabBar = useCallback(
    (props: any) => (
      <View style={styles.tabBarContainer}>
        <TabBar
          {...props}
          scrollEnabled
          style={styles.tabBar}
          tabStyle={styles.tab}
          activeColor="#0C0A09"
          inactiveColor="#515C66"
          indicatorStyle={styles.indicator}
          renderLabel={({
            route,
            focused,
          }: {
            route: TabRoute;
            focused: boolean;
          }) => (
            <Text style={[styles.label, focused && styles.labelActive]}>
              {route.title}
            </Text>
          )}
          pressColor="transparent"
          pressOpacity={1}
          gap={16}
          onTabPress={({ route }) => {
            const newIndex = routes.findIndex((r) => r.key === route.key);
            if (newIndex !== -1) {
              setIndex(newIndex);
            }
          }}
        />
        <LinearGradient
          colors={["rgba(245, 247, 250, 0)", "rgba(245, 247, 250, 1)"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 0.5, y: 0.5 }}
          style={styles.gradient}
          pointerEvents="none"
        />
        <TouchableOpacity
          style={styles.expandButton}
          onPress={handleExpandPress}
          activeOpacity={0.7}
        >
          <Animated.View style={arrowStyle}>
            <Image
              source={require("@/assets/images/login/icon-arrow.png")}
              style={{ width: 24, height: 24 }}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>
    ),
    [routes, index, handleExpandPress, arrowStyle]
  );

  return (
    <View style={styles.container}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.tabViewContainer}>
          {isLoading ? (
            <ActivityIndicator color="#0C0A09" style={{ marginTop: "20%" }} />
          ) : (
            routes.length > 0 && (
              <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                renderTabBar={renderTabBar}
                onIndexChange={setIndex}
                initialLayout={initialLayout}
              />
            )
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  tabViewContainer: {
    flex: 1,
  },
  scene: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBarContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  tabBar: {
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
    height: 44,
    backgroundColor: "#F5F7FA",
    flex: 1,
  },
  tab: {
    width: "auto",
    padding: 0,
    minHeight: 44,
  },
  indicator: {
    bottom: 10,
    backgroundColor: "#19DBF2",
  },
  label: {
    fontSize: 16,
    lineHeight: 20,
    textTransform: "none",
    textAlign: "center",
    ...createFontStyle("400"),
  },
  labelActive: {
    ...createFontStyle("600"),
  },
  gradient: {
    position: "absolute",
    right: 0,
    width: 44,
    height: "100%",
    zIndex: 100,
  },
  expandButton: {
    zIndex: 101,
  },
  modalWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: -100, // 确保覆盖住底部 TabBar
    zIndex: 1000,
    elevation: 1000,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
    elevation: 1000,
  },
  overlayTouch: {
    width: "100%",
    height: "100%",
  },
  expandPanel: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#F5F7FA",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    maxHeight: "80%",
    zIndex: 1001,
  },
  expandHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 44,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  expandTitle: {
    flex: 1,
    fontSize: 18,
    lineHeight: 22.68,
    ...createFontStyle("600"),
    color: "#0C0A09",
  },
  categoryListWrapper: {
    maxHeight: Dimensions.get("window").height * 0.6,
  },
  categoryList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    padding: 16,
    paddingVertical: 20,
  },
  categoryItem: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 44,
  },
  categoryItemActive: {
    backgroundColor: "#19DBF2",
  },
  categoryText: {
    fontSize: 14,
    lineHeight: 17.64,
    ...createFontStyle("500"),
    color: "#515C66",
  },
  categoryTextActive: {
    color: "#FFFFFF",
    ...createFontStyle("600"),
  },
  cardContainer: {
    marginBottom: 12,
  },
  resultList: {
    // paddingTop: (12),
    paddingHorizontal: 16,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 0,
  },
  footer: {
    paddingVertical: 16,
    alignItems: "center",
  },
});
