import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

interface ErrorMessageProps {
  message?: string;
  visible?: boolean;
  showIcon?: boolean;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  visible = false,
}) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withTiming(visible ? 0 : -10),
      },
    ],
    opacity: withTiming(visible ? 1 : 0),
  }));

  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
    >
      {!visible || !message ? null : (
        <>
          <MaterialIcons
            name="error-outline"
            size={16}
            color="#EB5735"
            style={styles.icon}
          />
          <Text style={styles.text}>{message}</Text>
        </>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    minHeight: 45,
    paddingVertical: 8,
    overflow: "hidden",
  },
  icon: {
    marginTop: 1,
  },
  text: {
    color: "#EB5735",
    fontSize: 14,
    marginLeft: 4,
    fontFamily: "Outfit",
  },
});

export default ErrorMessage;
