import BackBar from "@/components/ui/BackBar";
import { createFontStyle } from "@/utils/typography";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function RenewProtocol() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <BackBar title={t("renewProtocol.title")} />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.termsContainer}>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>
              {t("renewProtocol.content")}
            </Text>
          </View>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>
              {t("renewProtocol.content1.title")}
            </Text>
            <Text style={styles.termText}>
              {t("renewProtocol.content1.content")}
            </Text>
          </View>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>
              {t("renewProtocol.content2.title")}
            </Text>
            <Text style={styles.termText}>
              {t("renewProtocol.content2.content")}
            </Text>
          </View>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>
              {t("renewProtocol.content3.title")}
            </Text>
            <Text style={styles.termText}>
              {t("renewProtocol.content3.content")}
            </Text>
          </View>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>
              {t("renewProtocol.content4.title")}
            </Text>
            <Text style={styles.termText}>
              {t("renewProtocol.content4.content")}
            </Text>
          </View>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>
              {t("renewProtocol.content5.title")}
            </Text>
            <Text style={styles.termText}>
              {t("renewProtocol.content5.content")}
            </Text>
          </View>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>
              {t("renewProtocol.content6.title")}
            </Text>
            <Text style={styles.termText}>
              {t("renewProtocol.content6.content")}
            </Text>
          </View>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>
              {t("renewProtocol.content7.title")}
            </Text>
            <Text style={styles.termText}>
              {t("renewProtocol.content7.content")}
            </Text>
          </View>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>
              {t("renewProtocol.content8.title")}
            </Text>
            <Text style={styles.termText}>
              {t("renewProtocol.content8.content")}
            </Text>
          </View>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>
              {t("renewProtocol.content9.title")}
            </Text>
            <Text style={styles.termText}>
              {t("renewProtocol.content9.content")}
            </Text>
          </View>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>
              {t("renewProtocol.content9.title")}
            </Text>
            <Text style={styles.termText}>
              {t("renewProtocol.content9.content")}
            </Text>
          </View>
          <View style={styles.termSection}>
            <Text style={styles.termTitle}>
              {t("renewProtocol.content11")}
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
