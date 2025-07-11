import { createFontStyle } from "@/utils/typography";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackBar from "../ui/BackBar";

export default function LoginProtocol() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <BackBar title={t("settings.privacyPolicy")} />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.termsContainer}>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>{t("loginProtocol.content")}</Text>
          </View>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>
              {t("loginProtocol.content1.title")}
            </Text>
            <Text style={styles.termText}>
              {t("loginProtocol.content1.content")}
            </Text>
          </View>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>
              {t("loginProtocol.content2.title")}
            </Text>
            <Text style={styles.termText}>
              {t("loginProtocol.content2.content")}
            </Text>
            <Text style={styles.termText}>
              {t("loginProtocol.content2.content2")}
            </Text>
          </View>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>
              {t("loginProtocol.content3.title")}
            </Text>
            <Text style={styles.termText}>
              {t("loginProtocol.content3.content")}
            </Text>
          </View>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>
              {t("loginProtocol.content4.title")}
            </Text>
            <Text style={styles.termText}>
              {t("loginProtocol.content4.content")}
            </Text>
          </View>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>
              {t("loginProtocol.content5.title")}
            </Text>
            <Text style={styles.termText}>
              {t("loginProtocol.content5.content")}
            </Text>
          </View>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>
              {t("loginProtocol.content6.title")}
            </Text>
            <Text style={styles.termText}>
              {t("loginProtocol.content6.content")}
            </Text>
          </View>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>
              {t("loginProtocol.content7.title")}
            </Text>
            <Text style={styles.termText}>
              {t("loginProtocol.content7.content")}
            </Text>
          </View>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>
              {t("loginProtocol.content8.title")}
            </Text>
            <Text style={styles.termText}>
              {t("loginProtocol.content8.content")}
            </Text>
          </View>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>
              {t("loginProtocol.content9.title")}
            </Text>
            <Text style={styles.termText}>
              {t("loginProtocol.content9.content")}
            </Text>
          </View>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>
              {t("loginProtocol.content10.title")}
            </Text>
            <Text style={styles.termText}>
              {t("loginProtocol.content10.content")}
            </Text>
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
    color: "#515C66",
    ...createFontStyle("600"),
    marginBottom: 30,
  },
});
