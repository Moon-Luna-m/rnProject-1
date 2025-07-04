import { createFontStyle } from "@/utils/typography";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Image, ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Privacy() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TouchableOpacity
        style={styles.backContainer}
        onPress={() => {
          router.back();
        }}
      >
        <Image
          source={require("@/assets/images/common/icon-back.png")}
          style={{ width: 24, height: 24 }}
        />
        <Text style={styles.backText}>{t("settings.privacyPolicy")}</Text>
      </TouchableOpacity>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.termsContainer}>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>{t("privacy.terms.title")}</Text>
            <Text style={styles.termText}>{t("privacy.terms.content1")}</Text>
            <Text style={styles.termText}>{t("privacy.terms.content2")}</Text>
          </View>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>{t("privacy.changes.title")}</Text>
            <Text style={styles.termText}>{t("privacy.changes.content1")}</Text>
            <Text style={styles.termText}>{t("privacy.changes.content2")}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  backContainer: {
    position: "relative",
    height: 44,
    width: "100%",
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  backText: {
    position: "absolute",
    inset: 0,
    textAlign: "center",
    paddingVertical: 10,
    fontSize: 18,
    color: "#0C0A09",
    ...createFontStyle("700"),
  },
  content: {
    flex: 1,
  },
  termsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  termSection: {
    marginBottom: 24,
  },
  termTitle: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.08,
    color: "#101010",
    ...createFontStyle("700"),
    marginBottom: 12,
  },
  termText: {
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0.07,
    color: "#72818F",
    ...createFontStyle("600"),
    marginBottom: 30,
  },
});
