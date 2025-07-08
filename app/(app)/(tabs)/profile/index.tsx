import { testService } from "@/services/testServices";
import { userService } from "@/services/userService";
import { selectUserInfo, setUserInfo } from "@/store/slices/userSlice";
import { formatDate, generateBlurhash, imgProxy } from "@/utils/common";
import { createFontStyle } from "@/utils/typography";
import { Ionicons } from "@expo/vector-icons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { memo, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

interface ServiceItem {
  id: string;
  icon: ImageSourcePropType;
  title: string;
  extra?: React.ReactNode;
  onPress: () => void;
}

interface ServiceSectionProps {
  title: string;
  items: ServiceItem[];
}

// 缓存服务项组件
const ServiceItemComponent = memo(
  ({ service, onPress }: { service: ServiceItem; onPress: () => void }) => (
    <TouchableHighlight
      key={service.id}
      style={[styles.serviceItem]}
      onPress={onPress}
      underlayColor="#F5F7FA"
    >
      <View style={styles.serviceContent}>
        <View style={styles.serviceMain}>
          <View style={styles.serviceIconContainer}>
            <Image
              source={service.icon}
              style={styles.serviceIcon}
              resizeMode="contain"
              fadeDuration={0}
            />
          </View>
          <Text numberOfLines={1} style={styles.serviceTitle}>
            {service.title}
          </Text>
        </View>
        <View style={styles.serviceExtra}>
          {service.extra}
          <View style={styles.serviceArrow}>
            <Image
              source={require("@/assets/images/profile/icon-arrow-right.png")}
              style={{ width: 24, height: 24 }}
            />
          </View>
        </View>
      </View>
    </TouchableHighlight>
  )
);

// 缓存服务区块组件
const ServiceSection = memo(({ title, items }: ServiceSectionProps) => (
  <View style={styles.serviceSection}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.servicesCard}>
      {items.map((service, index) => (
        <ServiceItemComponent
          key={service.id}
          service={service}
          onPress={service.onPress}
        />
      ))}
    </View>
  </View>
));

export default function Profile() {
  const userInfo = useSelector(selectUserInfo);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [completedCount, setCompletedCount] = useState(0);
  const [unCompletedCount, setUnCompletedCount] = useState(0);
  const dispatch = useDispatch();

  const getCompletedCount = async () => {
    const [res1, res2] = await Promise.all([
      testService.getUserTestHistory({
        status: 1,
        page: 1,
        size: 1,
      }),
      testService.getUserTestHistory({
        status: 0,
        page: 1,
        size: 1,
      }),
    ]);
    if (res1.code === 200 && res2.code === 200) {
      setCompletedCount(res1.data.count);
      setUnCompletedCount(res2.data.count);
    }
  };

  const getUserInfo = async () => {
    const res = await userService.getUserInfo();
    if (res.code === 200) {
      dispatch(setUserInfo(res.data));
    }
  };

  useFocusEffect(
    useCallback(() => {
      getCompletedCount();
      getUserInfo();
    }, [])
  );

  // 使用 useMemo 缓存服务数组
  const services = useMemo(
    () => [
      {
        id: "vip",
        icon: require("@/assets/images/profile/vip-service.png"),
        title: t("profile.popularServices.vip.title"),
        extra: userInfo?.is_vip_active && (
          <View style={styles.vipExtra}>
            <LinearGradient
              colors={["#FFBA01", "#FFBA01", "#FF3201"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.vipDate}
            >
              <Text numberOfLines={1} style={styles.vipDateText}>
                {t("profile.popularServices.vip.expires")}:{" "}
                {formatDate(userInfo?.vip_expire_at)}
              </Text>
            </LinearGradient>
          </View>
        ),
        onPress: () => router.push("/profile/vip"),
      },
      // {
      //   id: "wallet",
      //   icon: require("@/assets/images/profile/wallet.png"),
      //   title: t("profile.popularServices.wallet"),
      //   onPress: () => router.push("/profile/wallet"),
      // },
      {
        id: "favorites",
        icon: require("@/assets/images/profile/favorites.png"),
        title: t("profile.popularServices.favorites"),
        onPress: () => router.push("/profile/favorites"),
      },
    ],
    [t]
  );

  // 使用 useMemo 缓存其他服务数组
  const otherServices = useMemo(
    () => [
      {
        id: "faq",
        icon: require("@/assets/images/profile/faq.png"),
        title: t("profile.otherServices.faq"),
        onPress: () => router.push("/profile/faq"),
      },
      {
        id: "settings",
        icon: require("@/assets/images/profile/settings.png"),
        title: t("profile.otherServices.settings"),
        onPress: () => router.push("/profile/setting"),
      },
    ],
    [t]
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#ABF1FF", "#F5F7FA"]} style={styles.gradient} />
      <View style={[styles.content, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          {/* 编辑按钮 */}
          <TouchableHighlight
            style={styles.editProfileButton}
            onPress={() => router.push("/profile/edit")}
            underlayColor="#F5F7FA"
          >
            <View style={styles.editButtonContent}>
              <View style={styles.editIcon}>
                <Image
                  source={require("@/assets/images/profile/edit.png")}
                  style={styles.editIconImage}
                  fadeDuration={0}
                />
              </View>
              <Text style={styles.editText}>{t("profile.edit")}</Text>
            </View>
          </TouchableHighlight>

          <View style={styles.avatarContainer}>
            {/* 头像容器 */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                router.push("/profile/vip");
              }}
              style={styles.avatarWrapper}
            >
              <ExpoImage
                source={{ uri: imgProxy(userInfo?.avatar) }}
                style={styles.avatar}
                placeholder={{ blurhash: generateBlurhash() }}
                contentFit="cover"
              />
              {userInfo?.is_vip_active && (
                <View style={styles.editButton}>
                  <Image
                    source={require("@/assets/images/profile/vip.png")}
                    style={styles.editButtonImage}
                  />
                </View>
              )}
            </TouchableOpacity>

            {/* 用户名和性别 */}
            <View style={styles.userInfo}>
              <Text numberOfLines={1} style={styles.username}>
                {userInfo?.username || `Echo`}
              </Text>
              <View style={styles.genderTag}>
                {userInfo?.sex === 1 ? (
                  <Ionicons name="male" size={14} color="#1989F2" />
                ) : (
                  <SimpleLineIcons
                    name="symbol-female"
                    size={12}
                    color="#ED3ADE"
                  />
                )}
              </View>
            </View>
          </View>

          {/* 测试题选项卡 */}
          <TouchableHighlight
            style={styles.testCard}
            onPress={() => router.push("/profile/review")}
            underlayColor="#F5F7FA"
          >
            <View style={styles.testCardContent}>
              {/* 左侧图标 */}
              <View style={styles.testIconContainer}>
                <View style={styles.testIcon}>
                  <Image
                    source={require("@/assets/images/profile/test.png")}
                    style={styles.testIconImage}
                    fadeDuration={0}
                  />
                </View>
              </View>

              {/* 右侧内容 */}
              <View style={styles.testInfo}>
                <Text numberOfLines={1} style={styles.testTitle}>
                  {t("profile.testCard.title")}
                </Text>
                <View style={styles.testStats}>
                  {/* 已完成 */}
                  <View style={styles.statItem}>
                    <Text numberOfLines={1} style={styles.statLabel}>
                      {t("profile.testCard.completed")}:
                    </Text>
                    <Text numberOfLines={1} style={styles.statValue}>
                      {completedCount}
                    </Text>
                  </View>

                  {/* 分隔线 */}
                  <View style={styles.divider} />

                  {/* 未完成 */}
                  <View style={styles.statItem}>
                    <Text numberOfLines={1} style={styles.statLabel}>
                      {t("profile.testCard.notCompleted")}:
                    </Text>
                    <Text numberOfLines={1} style={styles.statValue}>
                      {unCompletedCount}
                    </Text>
                  </View>
                </View>
              </View>

              {/* 右侧箭头 */}
              <View style={styles.arrowContainer}>
                <Image
                  source={require("@/assets/images/profile/arrow-right.png")}
                  style={{ width: 16, height: 16 }}
                />
              </View>
            </View>
          </TouchableHighlight>

          <ScrollView>
            {/* 热门服务 */}
            <ServiceSection
              title={t("profile.popularServices.title")}
              items={services}
            />
            {/* 其他服务 */}
            <ServiceSection
              title={t("profile.otherServices.title")}
              items={otherServices}
            />
          </ScrollView>
        </View>
      </View>
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
    height: 375,
    left: 0,
    top: 0,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    backgroundColor: "#FFFFFF",
    borderRadius: 45,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 2,
  },
  editButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  editIcon: {
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  editText: {
    fontSize: 14,
    lineHeight: 17.64,
    ...createFontStyle("500"),
    color: "#0C0A09",
  },
  editIconImage: {
    width: 16,
    height: 16,
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  avatarWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    position: "relative",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 36,
    borderWidth: 2.25,
    borderColor: "#FFFFFF",
  },
  editButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 20,
    height: 20,
  },
  editButtonImage: {
    width: 20,
    height: 20,
  },
  editButtonGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  username: {
    fontSize: 20,
    ...createFontStyle("600"),
    color: "#0C0A09",
    maxWidth: 200,
  } as TextStyle,
  genderTag: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  // 测试题卡片样式
  testCard: {
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 12,
  },
  testCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  testIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 29.71,
    overflow: "hidden",
  },
  testIcon: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  testIconImage: {
    width: 48,
    height: 48,
  },
  testInfo: {
    flex: 1,
    gap: 8,
  },
  testTitle: {
    fontSize: 16,
    lineHeight: 20.16,
    ...createFontStyle("600"),
    color: "#0C0A09",
  } as TextStyle,
  testStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    lineHeight: 15.12,
    ...createFontStyle("500"),
    color: "#515C66",
  } as TextStyle,
  statValue: {
    fontSize: 14,
    lineHeight: 17.64,
    ...createFontStyle("600"),
    color: "#0C0A09",
  } as TextStyle,
  divider: {
    width: 1,
    height: 16,
    backgroundColor: "#F5F7FA",
  },
  arrowContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F5F7FA",
    alignItems: "center",
    justifyContent: "center",
  },
  serviceSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    lineHeight: 17.64,
    ...createFontStyle("700"),
    color: "#0C0A09",
    marginBottom: 12,
  },
  servicesCard: {
    padding: 12,
    gap: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
  },
  serviceItem: {
    height: 40,
    justifyContent: "center",
    borderRadius: 20,
  },
  serviceContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 6,
  },
  serviceMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  serviceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 48.33,
    backgroundColor: "#F5F7FA",
    alignItems: "center",
    justifyContent: "center",
  },
  serviceIcon: {
    width: 24,
    height: 24,
  },
  serviceTitle: {
    fontSize: 14,
    lineHeight: 17.64,
    ...createFontStyle("500"),
    color: "#0C0A09",
    flex: 1,
  } as TextStyle,
  serviceExtra: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  serviceArrow: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  vipExtra: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  vipDate: {
    borderRadius: 23,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  vipDateText: {
    fontSize: 10,
    lineHeight: 12.6,
    ...createFontStyle("500"),
    color: "#FFFFFF",
  } as TextStyle,
});
