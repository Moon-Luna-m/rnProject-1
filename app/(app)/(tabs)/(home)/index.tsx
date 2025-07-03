import DigitalAssistant from "@/components/home/DigitalAssistant";
import Popular from "@/components/home/Popular";
import TodayRecommend from "@/components/home/TodayRecommend";
import {
  GetTestListByTypeResponse,
  testService,
} from "@/services/testServices";
import { LinearGradient } from "expo-linear-gradient";

import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function () {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [recommendList, setRecommendList] = useState<
    GetTestListByTypeResponse["list"]
  >([]);
  const [popularList, setPopularList] = useState<
    GetTestListByTypeResponse["list"]
  >([]);
  const [loading, setLoading] = useState(false);

  const getRecommendList = async () => {
    const res = await testService.getTestListByType({
      rec: true,
      page: 1,
      size: 15,
    });
    if (res.code === 200) {
      setRecommendList(res.data.list);
    }
  };

  const getPopularList = async () => {
    const res = await testService.getTestListByType({
      popular: true,
      page: 1,
      size: 30,
    });
    if (res.code === 200) {
      setPopularList(res.data.list);
    }
  };

  const getList = async () => {
    setLoading(true);
    await Promise.all([getRecommendList(), getPopularList()]);
    setLoading(false);
  };

  const handleSearchPress = () => {
    router.push("/search");
  };
  const handleAiPress = () => {
    router.push("/chat");
  };

  useFocusEffect(
    useCallback(() => {
      getList();
      // 页面聚焦时滚动到顶部
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#75E8FF", "#75E8FF", "#F5F7FA"]}
        start={{ x: 1, y: 0.55 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
        pointerEvents="none"
      >
        <DigitalAssistant />
        <LinearGradient
          colors={[
            "rgba(151, 248, 254, 0.00)",
            "#BAFAFF",
            "#E8FDFF",
            "#F5F7FA",
          ]}
          style={styles.linearGradient}
          pointerEvents="none"
        />
      </LinearGradient>
      <View
        style={[
          styles.searchContainer,
          { top: Platform.OS === "web" ? 20 : insets.top },
        ]}
      >
        <TouchableOpacity
          onPress={handleSearchPress}
          activeOpacity={0.8}
          style={styles.buttonContainer}
        >
          <Image
            source={require("@/assets/images/home/icon-search.png")}
            style={styles.searchIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleAiPress}
          activeOpacity={0.8}
          style={styles.buttonContainer}
        >
          <Image
            source={require("@/assets/images/home/icon-ai.png")}
            style={styles.searchIcon}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <ScrollView ref={scrollViewRef}>
          <TodayRecommend data={recommendList} />
          <Popular data={popularList} />
        </ScrollView>
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
    width: "100%",
    height: 300,
  },
  content: {
    flex: 1,
    marginTop: -60,
  },
  searchContainer: {
    position: "absolute",
    left: 0,
    width: "100%",
    paddingHorizontal: 16,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchIcon: {
    width: 24,
    height: 24,
  },
  buttonContainer: {
    padding: 8,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  linearGradient: {
    width: "100%",
    height: 108,
    marginTop: -37,
  },
  gradientImage: {
    width: "100%",
    height: 28,
    marginTop: -26,
  },
});
