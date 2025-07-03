import { selectActiveTab, setActiveTab } from "@/store/slices/tabIconsSlice";
import { useIsFocused } from "@react-navigation/native";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect } from "react";
import { Image, Platform, View } from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Path, Svg } from "react-native-svg";
import { useDispatch, useSelector } from "react-redux";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const INACTIVE_PATH =
  "M16.5 7H15.75C15.75 8.79493 14.2949 10.25 12.5 10.25V11V11.75C15.1234 11.75 17.25 9.62335 17.25 7H16.5ZM12.5 11V10.25C10.7051 10.25 9.25 8.79493 9.25 7H8.5H7.75C7.75 9.62335 9.87665 11.75 12.5 11.75V11ZM8.5 7H9.25C9.25 5.20507 10.7051 3.75 12.5 3.75V3V2.25C9.87665 2.25 7.75 4.37665 7.75 7H8.5ZM12.5 3V3.75C14.2949 3.75 15.75 5.20507 15.75 7H16.5H17.25C17.25 4.37665 15.1234 2.25 12.5 2.25V3ZM19.5 17.5H18.75C18.75 18.0294 18.3014 18.7105 17.1143 19.3041C15.9722 19.8751 14.3418 20.25 12.5 20.25V21V21.75C14.5242 21.75 16.3938 21.3414 17.7852 20.6457C19.1316 19.9725 20.25 18.9036 20.25 17.5H19.5ZM12.5 21V20.25C10.6582 20.25 9.02782 19.8751 7.88566 19.3041C6.69864 18.7105 6.25 18.0294 6.25 17.5H5.5H4.75C4.75 18.9036 5.86836 19.9725 7.21484 20.6457C8.60618 21.3414 10.4758 21.75 12.5 21.75V21ZM5.5 17.5H6.25C6.25 16.9706 6.69864 16.2895 7.88566 15.6959C9.02782 15.1249 10.6582 14.75 12.5 14.75V14V13.25C10.4758 13.25 8.60618 13.6586 7.21484 14.3543C5.86836 15.0275 4.75 16.0964 4.75 17.5H5.5ZM12.5 14V14.75C14.3418 14.75 15.9722 15.1249 17.1143 15.6959C18.3014 16.2895 18.75 16.9706 18.75 17.5H19.5H20.25C20.25 16.0964 19.1316 15.0275 17.7852 14.3543C16.3938 13.6586 14.5242 13.25 12.5 13.25V14Z";

const ACTIVE_PATH =
  "M12.5 13C16.366 13 19.5 14.7909 19.5 17C19.5 19.2091 16.366 21 12.5 21C8.63401 21 5.5 19.2091 5.5 17C5.5 14.7909 8.63401 13 12.5 13ZM12.5 3C14.7091 3 16.5 4.79086 16.5 7C16.5 9.20914 14.7091 11 12.5 11C10.2909 11 8.5 9.20914 8.5 7C8.5 4.79086 10.2909 3 12.5 3Z";

export default function ProfileIcon() {
  const dispatch = useDispatch();
  const activeTab = useSelector(selectActiveTab);
  const isActive = activeTab === "profile";

  useFocusEffect(
    useCallback(() => {
      dispatch(setActiveTab("profile"));
    }, [])
  );

  if (Platform.OS === "web") {
    return isActive ? (
      <Image
        source={require("@/assets/images/tabs/profile-active.png")}
        style={{ width: 24, height: 24 }}
      />
    ) : (
      <Image
        source={require("@/assets/images/tabs/profile.png")}
        style={{ width: 24, height: 24 }}
      />
    );
  }
  return <ProfileIconInner />;
}

function ProfileIconInner() {
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const activeTab = useSelector(selectActiveTab);
  const isActive = activeTab === "profile";

  const fillColor = useSharedValue(isActive ? "#19DBF2" : "#0C0A09");
  const scale = useSharedValue(isActive ? 1 : 1);
  const currentPath = useSharedValue(isActive ? ACTIVE_PATH : INACTIVE_PATH);

  const animatedProps = useAnimatedProps(() => {
    return {
      d: currentPath.value,
      fill: fillColor.value,
      transform: [{ scale: scale.value }],
    };
  });

  useFocusEffect(
    useCallback(() => {
      dispatch(setActiveTab("profile"));
    }, [])
  );

  useEffect(() => {
    if (isActive) {
      currentPath.value = ACTIVE_PATH;
      fillColor.value = withSpring("#19DBF2");
      scale.value = withSpring(1.05, {}, () => {
        scale.value = withSpring(1);
      });
    } else {
      currentPath.value = INACTIVE_PATH;
      fillColor.value = withSpring("#0C0A09");
      scale.value = withSpring(1);
    }
  }, [isActive]);

  return (
    <View
      style={{
        width: 24,
        height: 24,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width="25" height="24" viewBox="0 0 25 24">
        <AnimatedPath animatedProps={animatedProps} />
      </Svg>
    </View>
  );
}
