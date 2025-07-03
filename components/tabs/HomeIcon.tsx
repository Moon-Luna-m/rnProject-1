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

export default function HomeIcon() {
  const dispatch = useDispatch();
  const activeTab = useSelector(selectActiveTab);
  const isActive = activeTab === "home";

  useFocusEffect(
    useCallback(() => {
      dispatch(setActiveTab("home"));
    }, [])
  );

  if (Platform.OS === "web") {
    return isActive ? (
      <Image
        source={require("@/assets/images/tabs/home-active.png")}
        style={{ width: 24, height: 24 }}
      />
    ) : (
      <Image
        source={require("@/assets/images/tabs/home.png")}
        style={{ width: 24, height: 24 }}
      />
    );
  }
  return <HomeIconInner />;
}

function HomeIconInner() {
  const strokeDashoffset = useSharedValue(0);
  const fillColor = useSharedValue("transparent");
  const innerFillColor = useSharedValue("#0C0A09");
  const scale = useSharedValue(1);
  const dispatch = useDispatch();
  const activeTab = useSelector(selectActiveTab);
  const isActive = activeTab === "home";

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
      dispatch(setActiveTab("home"));
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
          d="M21.5 17.9668V10.1503C21.5 8.93937 20.9604 7.7925 20.0301 7.02652L15.0301 2.90935C13.5577 1.69688 11.4423 1.69689 9.96986 2.90935L4.96986 7.02652C4.03964 7.7925 3.5 8.93937 3.5 10.1503V17.9668C3.5 20.1943 5.29086 22 7.5 22H17.5C19.7091 22 21.5 20.1943 21.5 17.9668Z"
          stroke={"#0C0A09"}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeDasharray="100"
          animatedProps={animatedProps}
        />
        <AnimatedPath
          d="M10.5 18H14.5"
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
