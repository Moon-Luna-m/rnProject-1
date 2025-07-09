import BackBar from "@/components/ui/BackBar";
import { createFontStyle } from "@/utils/typography";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PrivacyProtocol() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <BackBar title={t("privacyPolicy.title")} />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.termsContainer}>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>{t("privacyPolicy.content")}</Text>
          </View>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>
              {t("privacyPolicy.content1.title")}
            </Text>
            <Text style={styles.termText}>
              {t("privacyPolicy.content1.content")}
            </Text>
            <Text style={styles.termText}>
              {t("privacyPolicy.content1.content1")}
            </Text>
            <Text style={styles.termText}>
              {t("privacyPolicy.content1.content2")}
            </Text>
            <Text style={styles.termText}>
              {t("privacyPolicy.content1.content3")}
            </Text>
            <Text style={styles.termText}>
              {t("privacyPolicy.content1.content4")}
            </Text>
          </View>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>
              {t("privacyPolicy.content2.title")}
            </Text>
            <Text style={styles.termText}>
              {t("privacyPolicy.content2.content")}
            </Text>
            <Text style={styles.termText}>
              {t("privacyPolicy.content2.content1")}
            </Text>
            <Text style={styles.termText}>
              {t("privacyPolicy.content2.content2")}
            </Text>
            <Text style={styles.termText}>
              {t("privacyPolicy.content2.content3")}
            </Text>
            <Text style={styles.termText}>
              {t("privacyPolicy.content2.content4")}
            </Text>
          </View>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>
              {t("subscribeProtocol.content3.title")}
            </Text>
            <Text style={styles.termText}>
              {t("privacyPolicy.content3.content")}
            </Text>
            <Text style={styles.termText}>
              {t("privacyPolicy.content3.content1")}
            </Text>
            <Text style={styles.termText}>
              {t("privacyPolicy.content3.content2")}
            </Text>
            <Text style={styles.termText}>
              {t("privacyPolicy.content3.content3")}
            </Text>
          </View>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>
              {t("subscribeProtocol.content4.title")}
            </Text>
            <Text style={styles.termText}>
              {t("privacyPolicy.content4.content")}
            </Text>
            <Text style={styles.termText}>
              {t("privacyPolicy.content4.content1")}
            </Text>
            <Text style={styles.termText}>
              {t("privacyPolicy.content4.content2")}
            </Text>
            <Text style={styles.termText}>
              {t("privacyPolicy.content4.content3")}
            </Text>
            <Text style={styles.termText}>
              {t("privacyPolicy.content4.content4")}
            </Text>
          </View>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>
              {t("privacyPolicy.content5.title")}
            </Text>
            <Text style={styles.termText}>
              {t("privacyPolicy.content5.content")}
            </Text>
          </View>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>
              {t("privacyPolicy.content6.title")}
            </Text>
            <Text style={styles.termText}>
              {t("privacyPolicy.content6.content")}
            </Text>
            <Text style={styles.termText}>
              {t("privacyPolicy.content6.content1")}
            </Text>
            <Text style={styles.termText}>
              {t("privacyPolicy.content6.content2")}
            </Text>
            <Text style={styles.termText}>
              {t("privacyPolicy.content6.content3")}
            </Text>
            <Text style={styles.termText}>
              {t("privacyPolicy.content6.content4")}
            </Text>
          </View>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>
              {t("privacyPolicy.content7.title")}
            </Text>
            <Text style={styles.termText}>
              {t("privacyPolicy.content7.content")}
            </Text>
          </View>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>
              {t("privacyPolicy.content8.title")}
            </Text>
            <Text style={styles.termText}>
              {t("privacyPolicy.content8.content")}
            </Text>
          </View>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>
              {t("privacyPolicy.content9.title")}
            </Text>
            <Text style={styles.termText}>
              {t("privacyPolicy.content9.content")}
            </Text>
          </View>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>
              {t("privacyPolicy.content10.title")}
            </Text>
            <Text style={styles.termText}>
              {t("privacyPolicy.content10.content")}
            </Text>
          </View>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>
              {t("privacyPolicy.content11.title")}
            </Text>
            <Text style={styles.termText}>
              {t("privacyPolicy.content11.content")}
            </Text>
            <Text style={styles.termText}>
              {t("privacyPolicy.content11.content1")}
            </Text>
          </View>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>{t("privacyPolicy.content12")}</Text>
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
