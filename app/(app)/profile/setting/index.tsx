import LogoutModal from "@/components/modal/LogoutModal";
import { showNotification } from "@/store/slices/notificationSlice";
import { logout } from "@/store/slices/userSlice";
import { clearCache, getCacheSize } from "@/utils/common";
import i18n, { LANGUAGES } from "@/utils/i18n";
import { createFontStyle } from "@/utils/typography";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Updates from "expo-updates";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Button } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";

interface SettingItemProps {
  title: string;
  hint?: string;
  onPress: () => void;
}

const SettingItem = ({ title, hint, onPress }: SettingItemProps) => {
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      style={styles.settingItem}
      activeOpacity={0.5}
      onPress={onPress}
    >
      <View style={styles.settingLeft}>
        <Text style={styles.settingText}>{t(title)}</Text>
      </View>
      <View style={styles.settingRight}>
        {hint && <Text style={styles.settingHint}>{hint}</Text>}
        <AntDesign name="right" size={12} color="#333333" />
      </View>
    </TouchableOpacity>
  );
};

const SettingCard = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.settingsCard}>{children}</View>
);

export default function Setting() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [cacheSize, setCacheSize] = useState<string>("0.00M");
  const dispatch = useDispatch();
  const [error, setError] = useState<string | null>(null);

  const handleLogout = useCallback(() => {
    setLogoutVisible(true);
  }, []);

  const handleLogoutConfirm = useCallback(() => {
    setLogoutVisible(false);
    // TODO: 处理退出登录逻辑
    dispatch(logout());
  }, []);

  const handleLogoutCancel = useCallback(() => {
    setLogoutVisible(false);
  }, []);

  const getCacheLocalCache = useCallback(async () => {
    const size = await getCacheSize();
    setCacheSize(size);
  }, []);

  const handleSettingPress = useCallback(async (type: string) => {
    // 处理各种设置项点击
    switch (type) {
      case "account":
        // 处理账号设置
        break;
      case "customer_service":
        router.push("/profile/setting/privacy");
        // 处理客服联系
        break;
      case "agreement":
        // 处理用户协议
        router.push("/profile/setting/privacy");
        break;
      case "privacy":
        // 处理隐私政策
        router.push("/profile/setting/privacy");
        break;
      case "disclaimer":
        // 处理免责声明
        router.push("/profile/setting/privacy");
        break;
      case "language":
        // 处理语言切换
        router.push("/profile/setting/languages");
        break;
      case "update":
        // 处理检查更新
        try {
          const res = await Updates.checkForUpdateAsync();
          if (res.isAvailable) {
            dispatch(
              showNotification({
                message: t("settings.updateAvailable"),
                type: "loading",
                duration: null,
              })
            );
            await Updates.fetchUpdateAsync();
            Updates.reloadAsync();
          } else {
            dispatch(
              showNotification({
                message: t("settings.noUpdate"),
                type: "default",
                duration: 1000,
              })
            );
          }
        } catch (error) {
          setError((error as Error).message);
        }
        break;
      case "cache":
        // 处理清除缓存
        const isSuccess = await clearCache();
        if (isSuccess) {
          dispatch(
            showNotification({
              message: t("settings.clearCacheSuccess"),
              type: "default",
              duration: 1000,
            })
          );
          getCacheLocalCache();
        } else {
          dispatch(
            showNotification({
              message: t("settings.clearCacheFailed"),
              type: "error",
              duration: 1000,
            })
          );
        }
        break;
    }
  }, []);

  useEffect(() => {
    getCacheLocalCache();
  }, []);

  const settingGroups = useMemo(
    () => [
      {
        items: [
          //   { type: "account", title: "settings.account" },
          { type: "customer_service", title: "settings.customerService" },
          { type: "agreement", title: "settings.userAgreement" },
          { type: "privacy", title: "settings.privacyPolicy" },
          { type: "disclaimer", title: "settings.disclaimer" },
        ],
      },
      {
        items: [
          {
            type: "language",
            title: "settings.language",
            hint: LANGUAGES[i18n.language].label,
          },
          { type: "update", title: "settings.checkUpdate" },
          { type: "cache", title: "settings.clearCache", hint: cacheSize },
        ],
      },
    ],
    [i18n.language, cacheSize]
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#ABF1FF", "#F5F7FA"]} style={styles.gradient} />
      <View style={[styles.content, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backContainer}
          onPress={() => router.back()}
          activeOpacity={0.5}
        >
          <Ionicons name="arrow-back-outline" size={24} color="black" />
          <Text style={styles.backText}>{t("settings.title")}</Text>
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <View style={styles.logoTextContainer}>
              <Text style={styles.logoText}>{Constants.expoConfig?.name}</Text>
              <Text style={styles.versionText}>
                v{Constants.expoConfig?.version}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.settingsContainer}>
          {settingGroups.map((group, groupIndex) => (
            <SettingCard key={groupIndex}>
              {group.items.map((item) => (
                <SettingItem
                  key={item.type}
                  title={item.title}
                  hint={item.hint}
                  onPress={() => handleSettingPress(item.type)}
                />
              ))}
            </SettingCard>
          ))}

          <Button
            mode="contained"
            style={styles.logoutButton}
            labelStyle={styles.logoutText}
            contentStyle={styles.logoutButtonContent}
            onPress={handleLogout}
            buttonColor="#FFFFFF"
            textColor="#EB5735"
            rippleColor="rgba(0, 0, 0, 0.03)"
          >
            {t("settings.logout.button")}
          </Button>
        </View>
      </View>

      <LogoutModal
        visible={logoutVisible}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  gradient: {
    position: "absolute",
    width: "100%",
    height: (375),
    left: 0,
    top: 0,
  },
  content: {
    flex: 1,
  },
  backContainer: {
    position: "relative",
    height: (44),
    width: "100%",
    paddingHorizontal: (16),
    justifyContent: "center",
  },
  backText: {
    position: "absolute",
    inset: 0,
    textAlign: "center",
    paddingVertical: (10),    
    fontSize: 18,
    color: "#0C0A09",
    ...createFontStyle("700"),
  },
  logoContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: (40),
  },
  logoWrapper: {
    alignItems: "center",
    gap: (8),
  },
  logoImage: {
    width: (80),
    height: (80),
  },
  logoTextContainer: {
    alignItems: "center",
    gap: (4),
  },
  logoText: {
    fontSize: 16,
    lineHeight: 20,
    color: "#0C0A09",
    ...createFontStyle("700"),
  },
  versionText: {
    fontSize: 14,
    lineHeight: 18,
    color: "#72818F",
  },
  settingsContainer: {
    paddingHorizontal: (16),
    marginTop: (20),
    gap: (20),
  },
  settingsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: (20),
    padding: (16),
    gap: (16),
  },
  settingItem: {
    height: (24),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: (12),
  },
  settingText: {
    fontSize: 14,
    lineHeight: 18,
    color: "#0C0A09",
    ...createFontStyle("500"),
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: (4),
  },
  settingHint: {
    fontSize: 12,
    lineHeight: 15,
    color: "#A9AEB8",
    ...createFontStyle("500"),
  },
  logoutButton: {
    borderRadius: (78),
  },
  logoutButtonContent: {
    height: (52),
  },
  logoutText: {
    fontSize: 16,
    lineHeight: 20,
    ...createFontStyle("600"),
    textTransform: "capitalize",
  },
});
