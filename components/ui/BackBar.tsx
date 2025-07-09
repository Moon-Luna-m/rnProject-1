import { createFontStyle } from "@/utils/typography";
import { router } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function BackBar({ title }: { title: string }) {
  return (
    <View style={styles.backContainer}>
      <TouchableOpacity
        onPress={() => {
          router.back();
        }}
        style={{ width: 24, height: 24, zIndex: 1 }}
      >
        <Image
          source={require("@/assets/images/common/icon-back.png")}
          style={{ width: 24, height: 24 }}
        />
      </TouchableOpacity>
      <View
        style={{
          flex: 1,
          paddingHorizontal: 48,
        }}
      >
        <Text style={styles.backText} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backContainer: {
    position: "relative",
    flexDirection: "row",
    height: 44,
    width: "100%",
    paddingHorizontal: 16,
    alignItems: "center",
  },
  backText: {
    textAlign: "center",
    paddingVertical: 10,
    fontSize: 18,
    color: "#0C0A09",
    ...createFontStyle("700"),
  },
});
