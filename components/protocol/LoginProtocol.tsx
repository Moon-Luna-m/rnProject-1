import { createFontStyle } from "@/utils/typography";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
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
