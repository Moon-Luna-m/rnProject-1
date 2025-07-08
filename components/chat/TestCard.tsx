import { createFontStyle } from "@/utils/typography";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TestCardProps {
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  questionCount: string;
  onStart: () => void;
  icon: any;
}

export default function TestCard({
  title,
  subtitle,
  description,
  duration,
  questionCount,
  onStart,
  icon,
}: TestCardProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Image source={icon?.icon} style={styles.icon} />
          </View>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <View style={styles.body}>
          <View style={styles.bodyContent}>
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={onStart}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{t("test.start")}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bodyContent}>
            <Text style={styles.description} numberOfLines={1}>
              {description}
            </Text>
            <TouchableOpacity
              style={[styles.button, { opacity: 0, height: 0 }]}
            >
              <Text style={styles.buttonText}>{t("test.start")}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.footer}>
          <Text style={styles.info}>{questionCount}</Text>
          <Text style={styles.info}>{duration}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#19DBF2",
    padding: 12,
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 16,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 8,
  },
  content: {
    gap: 8,
    alignSelf: "stretch",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "stretch",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 40,
    backgroundColor: "#DDF9FF",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 21.12,
    height: 21.12,
  },
  title: {
    fontSize: 14,
    lineHeight: 18,
    ...createFontStyle("500"),
    color: "#0C0A09",
  },
  body: {
    gap: 4,
  },
  bodyContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subtitle: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    ...createFontStyle("700"),
    color: "#0C0A09",
  },
  descriptionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  description: {
    flex: 1,
    fontSize: 12,
    lineHeight: 15,
    color: "#A9AEB8",
  },
  footer: {
    flexDirection: "row",
    gap: 32,
    alignSelf: "stretch",
  },
  info: {
    fontSize: 12,
    lineHeight: 15,
    ...createFontStyle("500"),
    color: "#515C66",
  },
  button: {
    backgroundColor: "#19DBF2",
    borderRadius: 78,
    height: 32,
    paddingHorizontal: 10,
    paddingVertical: 7,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  buttonText: {
    fontSize: 14,
    lineHeight: 18,
    ...createFontStyle("600"),
    color: "#FFFFFF",
    textTransform: "capitalize",
  },
});
