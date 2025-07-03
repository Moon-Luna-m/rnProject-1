import React from "react";
import { Image, Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DigitalAssistant() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { marginTop: (Platform.OS === "web" ? 44 : 0) + insets.top },
      ]}
    >
      {/* 数字人头像 */}
      <Image
        source={require("@/assets/images/home/digital-human.png")}
        style={[styles.avatar]}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 180,
    position: "relative",
  },
  avatar: {
    width: 180,
    height: 180,
    position: "absolute",
    bottom: 0,
    left: "50%",
    transform: [{ translateX: "-50%" }],
  },
});
