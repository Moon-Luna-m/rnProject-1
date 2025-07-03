import { selectActiveTab, setActiveTab } from "@/store/slices/tabIconsSlice";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect } from "react";
import { Image, Platform, View } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedProps,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Path, Svg } from "react-native-svg";
import { useDispatch, useSelector } from "react-redux";

const AnimatedPath = Animated.createAnimatedComponent(Path);
export default function CategoryIcon() {
  const dispatch = useDispatch();
  const activeTab = useSelector(selectActiveTab);
  const isActive = activeTab === "category";

  useFocusEffect(
    useCallback(() => {
      dispatch(setActiveTab("category"));
    }, [])
  );
  if (Platform.OS === "web") {
    return isActive ? (
      <Image
        source={require("@/assets/images/tabs/category-active.png")}
        style={{ width: 24, height: 24 }}
      />
    ) : (
      <Image
        source={require("@/assets/images/tabs/category.png")}
        style={{ width: 24, height: 24 }}
      />
    );
  }
  return <CategoryIconInner />;
}

function CategoryIconInner() {
  const strokeDashoffset = useSharedValue(0);
  const fillColor = useSharedValue("transparent");
  const innerFillColor = useSharedValue("#0C0A09");
  const scale = useSharedValue(1);
  const dispatch = useDispatch();
  const activeTab = useSelector(selectActiveTab);
  const isActive = activeTab === "category";
  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: strokeDashoffset.value,
      fill: fillColor.value,
      transform: [{ scale: scale.value }],
      origin: "12.5, 12",
    };
  });

  const innerAnimatedProps = useAnimatedProps(() => {
    return {
      stroke: innerFillColor.value,
      transform: [{ scale: scale.value }],
      origin: "12.5, 12",
    };
  });

  const startAnimation = () => {
    resetAnimation();
    strokeDashoffset.value = withSpring(
      100,
      {
        duration: 150,
        dampingRatio: 3,
        stiffness: 30,
      },
      (finished) => {
        if (finished) {
          fillColor.value = withTiming("#19DBF2", { duration: 100 });
          scale.value = withTiming(1.05, { duration: 100 }, () => {
            scale.value = withTiming(1, { duration: 100 });
          });
          innerFillColor.value = withTiming("#fff", { duration: 0 });
        }
      }
    );
  };

  const resetAnimation = () => {
    cancelAnimation(strokeDashoffset);
    cancelAnimation(fillColor);
    cancelAnimation(scale);
    cancelAnimation(innerFillColor);

    strokeDashoffset.value = 0;
    fillColor.value = "transparent";
    innerFillColor.value = "#0C0A09";
    scale.value = 1;
  };

  useFocusEffect(
    useCallback(() => {
      dispatch(setActiveTab("category"));
    }, [])
  );

  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      resetAnimation();
    }
  }, [isActive]);

  return (
    <View style={{ width: 24, height: 24 }}>
      <Svg height="24" width="24" viewBox="0 0 25 24">
        <AnimatedPath
          d="M5.5 2H19.5C20.6046 2 21.5 2.89543 21.5 4V19.1543C21.5 20.5396 20.1259 21.5053 18.8226 21.0361L17.2608 20.4739C16.7728 20.2982 16.2356 20.319 15.7626 20.5318L13.3207 21.6307C12.7988 21.8655 12.2012 21.8655 11.6793 21.6307L9.23737 20.5318C8.76439 20.319 8.22721 20.2982 7.7392 20.4739L6.17744 21.0361C4.87412 21.5053 3.5 20.5396 3.5 19.1543V4C3.5 2.89543 4.39543 2 5.5 2Z"
          stroke={"#0C0A09"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="100"
          animatedProps={animatedProps}
        />
        <AnimatedPath
          d="M8.5 7H12.5M8.5 11H16.5M8.5 15H16.5"
          stroke={"#0C0A09"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="100"
          animatedProps={innerAnimatedProps}
        />
      </Svg>
    </View>
  );
}
