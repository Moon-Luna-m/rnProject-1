import SearchBar from "@/components/home/SearchBar";
import SearchHistory from "@/components/home/SearchHistory";
import SearchResultCard from "@/components/home/SearchResultCard";
import {
  GetTestListByTypeResponse,
  testService,
} from "@/services/testServices";
import { createFontStyle } from "@/utils/typography";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SEARCH_HISTORY_KEY = "search_history";
const MAX_HISTORY_LENGTH = 10;

const EmptySearchResult = () => {
  const { t } = useTranslation();
  return (
    <View style={styles.emptyContainer}>
      <Image
        source={require("@/assets/images/home/no-result.png")}
        style={styles.emptyImage}
      />
      <Text style={styles.emptyTitle}>{t("home.search.noContent")}</Text>
      <Text style={styles.emptySubtitle}>
        {t("home.search.tryDifferentTerm")}
      </Text>
    </View>
  );
};

export default function Search() {
  const { t } = useTranslation();
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<
    GetTestListByTypeResponse["list"]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentKeyword, setCurrentKeyword] = useState("");

  // 加载历史记录
  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error("Failed to load search history:", error);
    }
  };

  // 保存历史记录
  const saveSearchHistory = async (keyword: string) => {
    try {
      let history = [...searchHistory];
      // 如果已存在，先移除
      history = history.filter((item) => item !== keyword);
      // 添加到开头
      history.unshift(keyword);
      // 保持最大长度
      if (history.length > MAX_HISTORY_LENGTH) {
        history = history.slice(0, MAX_HISTORY_LENGTH);
      }
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
      setSearchHistory(history);
    } catch (error) {
      console.error("Failed to save search history:", error);
    }
  };

  // 清除历史记录
  const clearSearchHistory = async () => {
    try {
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
      setSearchHistory([]);
    } catch (error) {
      console.error("Failed to clear search history:", error);
    }
  };

  // 删除单个历史记录
  const deleteSearchHistory = async (keyword: string) => {
    try {
      const history = searchHistory.filter((item) => item !== keyword);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
      setSearchHistory(history);
    } catch (error) {
      console.error("Failed to delete search history:", error);
    }
  };

  // 模拟搜索请求
  const fetchSearchResults = async (keyword: string, page: number) => {
    const results = await testService.searchTest({
      keyword,
      page,
      size: 30,
    });
    return {
      data: results.data?.list || [],
      hasMore: page * 30 < results.data?.count,
    };
  };

  // 处理搜索
  const handleSearch = useCallback(
    async (text: string) => {
      const keyword = text.trim();
      if (keyword) {
        await saveSearchHistory(keyword);
        setIsSearching(true);
        setCurrentPage(1);
        setSearchResults([]);
        setHasMore(true);
        setCurrentKeyword(keyword);
        setIsLoading(true);

        try {
          const { data, hasMore } = await fetchSearchResults(keyword, 1);

          setSearchResults(data);
          setHasMore(hasMore);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsLoading(false);
        }
      }
    },
    [searchHistory]
  );

  // 加载更多
  const loadMore = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const nextPage = currentPage + 1;
      const { data, hasMore: more } = await fetchSearchResults(
        currentKeyword,
        nextPage
      );
      setSearchResults((prev: GetTestListByTypeResponse["list"]) => [
        ...prev,
        ...data,
      ]);
      setCurrentPage(nextPage);
      setHasMore(more);
    } catch (error) {
      console.error("Load more failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 选择历史记录
  const handleSelectHistory = (keyword: string) => {
    setSearchText(keyword);
    handleSearch(keyword);
    handlePressOutside();
  };

  const handlePressOutside = () => {
    if (Platform.OS !== "web") {
      Keyboard.dismiss();
    }
  };

  const renderSearchResult = ({
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
    if (!isSearching) return null;
    if (isLoading) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator color="#19DBF2" />
        </View>
      );
    }
    if (!hasMore) {
      return (
        <View style={[styles.footer, styles.noMoreFooter]}>
          <Text style={styles.footerText}>{t("common.noMoreData")}</Text>
        </View>
      );
    }
    return null;
  };

  const renderContent = () => {
    if (!isSearching) {
      return (
        <SearchHistory
          history={searchHistory}
          onClear={clearSearchHistory}
          onSelect={handleSelectHistory}
          onDelete={deleteSearchHistory}
        />
      );
    }

    if (searchResults.length === 0 && !isLoading) {
      return <EmptySearchResult />;
    }

    return (
      <FlatList
        data={searchResults}
        renderItem={renderSearchResult}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.resultList}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.2}
        ListFooterComponent={renderFooter}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />
    );
  };

  return (
    <TouchableWithoutFeedback onPress={handlePressOutside}>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              router.back();
            }}
          >
            <Image
              source={require("@/assets/images/common/icon-back.png")}
              style={{ width: 24, height: 24 }}
            />
          </TouchableOpacity>
          <View style={styles.searchContainer}>
            <SearchBar
              onSearch={handleSearch}
              autoFocus
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
          <TouchableOpacity onPress={() => handleSearch(searchText)}>
            <Text style={styles.searchText}>{t("home.search.button")}</Text>
          </TouchableOpacity>
        </View>

        {renderContent()}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchContainer: {
    flex: 1,
  },
  searchText: {
    fontSize: 14,
    ...createFontStyle("500"),
    color: "#0C0A09",
  },
  resultList: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardContainer: {
    marginBottom: 0,
  },
  footer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  noMoreFooter: {
    paddingBottom: 32,
  },
  footerText: {
    fontFamily: "Outfit",
    fontSize: 12,
    color: "#A9AEB8",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 100,
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
  emptySubtitle: {
    fontFamily: "Outfit",
    fontSize: 12,
    lineHeight: 15,
    color: "#B7B7B7",
  },
});
