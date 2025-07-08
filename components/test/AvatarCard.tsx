import { createFontStyle } from "@/utils/typography";
import { Image } from "expo-image";
import React from "react";
import { useTranslation } from "react-i18next";
import { ImageSourcePropType, StyleSheet, Text, View } from "react-native";

interface AvatarCardProps {
  avatar?: ImageSourcePropType;
  result?: {
    title: string;
    description: string;
  };
}

export default function AvatarCard({ avatar, result }: AvatarCardProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Image
          source={require("@/assets/images/test/area-question.png")}
          style={styles.bg}
          contentFit="cover"
        />
        {avatar ? (
          <View style={styles.realAvatar}>
            <Image
              source={avatar}
              style={styles.realAvatarImage}
              contentFit="cover"
            />
          </View>
        ) : null}
      </View>
      <View style={[styles.content, result && styles.resultContent]}>
        {result ? (
          <>
            <View style={styles.iconContainer}>
              <View style={styles.iconBg}>
                <Image
                  source={require("@/assets/images/test/book-square.png")}
                  style={styles.icon}
                  contentFit="contain"
                />
              </View>
            </View>
            <Text style={styles.resultTitle}>{result.title}</Text>
            <Text style={styles.resultDescription}>{result.description}</Text>
          </>
        ) : (
          <>
            <Text style={styles.title}>
              {t("test.components.avatar.title")}
            </Text>
            <Text style={styles.description}>
              {t("test.components.avatar.description")}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    gap: 16,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 190,
    height: 190,
  },
  bg: {
    width: 190,
    height: 190,
  },
  realAvatar: {
    position: "absolute",
    inset: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  realAvatarImage: {
    height: 90,
    width: 90,
  },
  content: {
    alignItems: "center",
    gap: 8,
  },
  resultContent: {
    alignSelf: "stretch",
    backgroundColor: "#EFF4FA",
    borderRadius: 12,
    padding: 8,
    position: "relative",
  },
  iconContainer: {
    position: "absolute",
    top: -22,
    left: 16,
    width: 44,
    height: 44,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 44,
    backgroundColor: "#19DBF2",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 24,
    height: 24,
  },
  title: {
    fontSize: 16,
    ...createFontStyle("600"),
    color: "#0C0A09",
    textTransform: "uppercase",
  },
  description: {
    fontSize: 12,
    ...createFontStyle("400"),
    color: "#515C66",
    textTransform: "uppercase",
    textAlign: "center",
  },
  resultTitle: {
    maxWidth: "80%",
    fontSize: 16,
    ...createFontStyle("600"),
    color: "#0C0A09",
    textAlign: "center",
  },
  resultDescription: {
    fontSize: 12,
    ...createFontStyle("400"),
    color: "#515C66",
    textAlign: "center",
  },
});
