import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export const PersonalizedAdvice = ({
  title = "",
  adviceItems = [],
}: {
  title?: string;
  adviceItems?: Array<{
    id: number;
    text: string;
  }>;
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Image
            source={require("@/assets/images/test/advice.png")}
            style={styles.icon}
            resizeMode="contain"
          />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.adviceList}>
            {adviceItems.map((item) => (
              <View key={item.id} style={styles.adviceItem}>
                <View style={styles.dot} />
                <Text style={styles.adviceText}>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignSelf: "stretch",
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: "#FAFAF9",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 32,
    height: 32,
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 12,
  },
  title: {
    fontFamily: "Outfit-SemiBold",
    fontSize: 16,
    lineHeight: 20,
    color: "#0C0A09",
  },
  adviceList: {
    gap: 8,
  },
  adviceItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dot: {
    width: 4,
    height: 4,
    backgroundColor: "#515C66",
    borderRadius: 2,
  },
  adviceText: {
    fontFamily: "Outfit-Regular",
    fontSize: 12,
    lineHeight: 15,
    color: "#515C66",
  },
});

export default PersonalizedAdvice;
