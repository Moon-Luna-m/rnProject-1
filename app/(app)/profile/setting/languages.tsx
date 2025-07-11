import CustomCheckbox from "@/components/CustomCheckbox";
import BackBar from "@/components/ui/BackBar";

import i18n, { LANGUAGES, setLanguage } from "@/utils/i18n";
import { createFontStyle } from "@/utils/typography";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Languages() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const currentLang = i18n.language;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <BackBar title={t("settings.language")} />
      <View style={styles.content}>
        <ScrollView>
          {Object.entries(LANGUAGES).map(([key, lang]) => (
            <View key={key} style={styles.langItemWrapper}>
              <TouchableOpacity
                style={styles.langItem}
                activeOpacity={0.5}
                onPress={async () => {
                  if (currentLang !== key) {
                    await setLanguage(key);
                    router.back();
                  }
                }}
              >
                <View style={styles.langInfo}>
                  <Image
                    source={LANGUAGES[key].flag}
                    style={styles.flagIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.langText}>{lang.label}</Text>
                </View>
                <CustomCheckbox
                  checked={currentLang === key}
                  onPress={async () => {
                    if (currentLang !== key) {
                      await setLanguage(key);
                      router.back();
                    }
                  }}
                  size={20}
                  activeColor="#19DBF2"
                  inactiveColor="rgba(12, 10, 9, 0.16)"
                />
              </TouchableOpacity>
              <View style={styles.separator} />
            </View>
          ))}
        </ScrollView>
      </View>
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
    paddingTop: 20,
  },
  langItemWrapper: {
    paddingHorizontal: 16,
  },
  langItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingBottom: 12,
  },
  langInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  flagIcon: {
    width: 32,
    height: 24,
  },
  langText: {
    fontSize: 14,
    color: "#0C0A09",
    ...createFontStyle("500"),
  },
  separator: {
    height: 1,
    backgroundColor: "#F0EFEF",
    marginBottom: 4,
  },
});
