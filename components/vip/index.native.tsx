import CustomCheckbox from "@/components/CustomCheckbox";
import { GetVipListResponse, paymentService } from "@/services/paymentServices";
import { userService } from "@/services/userService";
import { showNotification } from "@/store/slices/notificationSlice";
import { selectUserInfo, setUserInfo } from "@/store/slices/userSlice";
import {
  formatCurrency,
  formatDate,
  formatDecimal,
  generateBlurhash,
  imgProxy,
} from "@/utils/common";
import { createFontStyle } from "@/utils/typography";
import { useStripe } from "@stripe/stripe-react-native";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ColorValue,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import BackBar from "../ui/BackBar";

export default function Vip() {
  const { t } = useTranslation();
  const userInfo = useSelector(selectUserInfo);
  const [selectedType, setSelectedType] = useState<number>();
  const [isAgreed, setIsAgreed] = useState(false);
  const insets = useSafeAreaInsets();
  const [plans, setPlans] = useState<GetVipListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const [paymentLoading, setPaymentLoading] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const vipInfo = useMemo<{
    [key: string]: {
      bg: readonly [ColorValue, ColorValue, ...ColorValue[]];
      icon: any;
      color: ColorValue;
      tipsIcon?: any;
      tips?: string;
    };
  }>(() => {
    return {
      "": {
        icon: require("@/assets/images/vip/0.png"),
        bg: ["#EEEFF8", "#9EA6D0"],
        color: "#515C66",
      },
      monthly: {
        icon: require("@/assets/images/vip/1.png"),
        bg: ["#FCFFC7", "#FF7B00"],
        color: "#FF7B00",
        tipsIcon: require("@/assets/images/vip/monthly.png"),
        tips: t("vip.monthlyMemberShip"),
      },
      quarterly: {
        icon: require("@/assets/images/vip/2.png"),
        bg: ["#FDDAE9", "#FF506A"],
        color: "#FF506A",
        tipsIcon: require("@/assets/images/vip/quarterly.png"),
        tips: t("vip.quarterlyMemberShip"),
      },
      yearly: {
        icon: require("@/assets/images/vip/3.png"),
        bg: ["#FFFCAB", "#5E00FF"],
        color: "#5E00FF",
        tipsIcon: require("@/assets/images/vip/yearly.png"),
        tips: t("vip.yearlyMemberShip"),
      },
      lifetime: {
        icon: require("@/assets/images/vip/4.png"),
        bg: ["#A1F2FF", "#F4FF60", "#FF60E7"],
        color: "#FF60E7",
        tipsIcon: require("@/assets/images/vip/lifetime.png"),
        tips: t("vip.lifetimeMemberShip"),
      },
    };
  }, []);

  useEffect(() => {
    const getPlans = async () => {
      const res = await paymentService.getVipListNoPrice();
      if (res.code === 200) {
        setPlans(res.data || []);
        setSelectedType((res.data || [])[0]?.id);
      }
      setLoading(false);
    };
    getPlans();
  }, []);

  const handleSubscriptionSelect = (id: number) => {
    setSelectedType(id);
  };

  const getSubscriptionStyle = (id: number) => {
    if (id === selectedType) {
      return {
        gradient: ["#BBF1FF", "#FFFFFF"] as readonly [ColorValue, ColorValue],
        borderColor: "#19DBF2",
        borderWidth: 2,
        priceColor: "#19DBF2",
      };
    }
    return {
      gradient: ["#FFFFFF", "#FFFFFF"] as readonly [ColorValue, ColorValue],
      borderColor: "transparent",
      borderWidth: 2,
      priceColor: "#0C0A09",
    };
  };

  const getAutoRenewalText = () => {
    if (selectedType === undefined) return;
    const plan = plans.find((plan) => plan.id === selectedType);
    if (plan?.subscription_type === "lifetime") {
      return t("vip.agreement.oneTimePayment");
    }
    return t("vip.agreement.autoRenewal", {
      price: formatCurrency(plan?.price),
    });
  };

  const handleConfirm = async () => {
    if (paymentLoading || !isAgreed || userInfo?.is_vip_active) return;
    try {
      setPaymentLoading(true);
      const plan = plans.find((plan) => plan.id === selectedType);
      // 创建支付订单
      const orderResponse = await paymentService.subscribeVip({
        payment_gateway: "STRIPE",
        payment_method: Platform.OS === "web" ? "WEB" : "APP",
        auto_renew: true,
        subscription_type: plan!.subscription_type,
        vip_level: 1,
        payment_method_id: "Card",
      });

      if (orderResponse.code !== 200 || !orderResponse.data) return;
      if (!orderResponse.data.sk) {
        return dispatch(
          showNotification({
            message: t("vip.noSk"),
            type: "default",
            duration: 2000,
          })
        );
      }
      const { error } = await initPaymentSheet({
        merchantDisplayName: "ECHO",
        customerId: orderResponse.data.customer,
        customerEphemeralKeySecret: orderResponse.data.ephemeralKey,
        setupIntentClientSecret: orderResponse.data.sk,
        defaultBillingDetails: {
          name: userInfo?.username,
        },
      });
      if (error) {
        return dispatch(
          showNotification({
            message: error.message,
            type: "default",
            duration: 2000,
          })
        );
      }
      const res = await presentPaymentSheet();
      if (res.error) {
        return dispatch(
          showNotification({
            message: res.error.message,
            type: "default",
            duration: 2000,
          })
        );
      }
      dispatch(
        showNotification({
          type: "success",
          message: t("vip.success"),
          duration: 2000,
        })
      );
      updateUserInfo();
    } catch (error: any) {
      dispatch(
        showNotification({
          type: "default",
          message: error.message,
          duration: 2000,
        })
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  const updateUserInfo = async () => {
    const res = await userService.getUserInfo();
    if (res.code === 200) {
      dispatch(setUserInfo(res.data));
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <BackBar title={t("vip.memberCenter")} />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.cardContainer}>
          <LinearGradient
            colors={vipInfo[userInfo?.subscription_type || ""].bg}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardBackground}
          >
            <View style={styles.cardContent}>
              <View style={styles.userInfo}>
                <ExpoImage
                  source={{ uri: imgProxy(userInfo?.avatar) }}
                  style={styles.avatar}
                  placeholder={{ blurhash: generateBlurhash() }}
                  contentFit="cover"
                />
                <View style={styles.userInfoContent}>
                  <Text style={styles.username}>{userInfo?.username}</Text>
                  {userInfo?.is_vip_active ? (
                    <View style={styles.tipsContainer}>
                      <Image
                        source={
                          vipInfo[userInfo?.subscription_type || ""].tipsIcon
                        }
                        style={styles.tipsIcon}
                      />
                      <Text
                        style={[
                          styles.tips,
                          {
                            color:
                              vipInfo[userInfo?.subscription_type || ""].color,
                          },
                        ]}
                      >
                        {vipInfo[userInfo?.subscription_type || ""].tips}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
              <Text
                style={[
                  styles.status,
                  { color: vipInfo[userInfo?.subscription_type || ""].color },
                ]}
              >
                {userInfo?.is_vip_active
                  ? t("vip.expires") +
                    formatDate(userInfo?.vip_expire_at, "YYYY-MM-DD")
                  : t("vip.notActivated")}
              </Text>
            </View>
          </LinearGradient>
          <Image
            source={vipInfo[userInfo?.subscription_type || ""].icon}
            style={styles.cardDecoration}
            resizeMode="contain"
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#19DBF2" />
          </View>
        ) : plans.length ? (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.subscriptionContainer}
            >
              {plans.map((plan) => {
                const style = getSubscriptionStyle(plan.id);
                return (
                  <TouchableOpacity
                    key={plan.id}
                    activeOpacity={0.8}
                    style={[styles.subscriptionItem]}
                    onPress={() => handleSubscriptionSelect(plan.id)}
                  >
                    <LinearGradient
                      colors={style.gradient}
                      start={{ x: 0.5, y: 0 }}
                      end={{ x: 0.5, y: 1 }}
                      style={[
                        styles.subscriptionContent,
                        {
                          borderColor: style.borderColor,
                          borderWidth: style.borderWidth,
                        },
                      ]}
                    >
                      <Text
                        numberOfLines={2}
                        style={[styles.subscriptionTitle, { color: "#0C0A09" }]}
                      >
                        {plan.name}
                      </Text>
                      <View style={styles.priceContainer}>
                        <Text
                          style={[
                            styles.currencySymbol,
                            { color: style.priceColor },
                          ]}
                        >
                          $
                        </Text>
                        <Text
                          style={[styles.price, { color: style.priceColor }]}
                        >
                          {formatDecimal(plan.price / 100)}
                        </Text>
                      </View>
                      <Text style={styles.perMonth}>
                        {plan.subscription_type === "lifetime"
                          ? t("vip.lifetime")
                          : t(`vip.${plan.subscription_type}`, {
                              n: formatCurrency(plan.price),
                            })}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={styles.agreementContainer}>
              <View style={styles.agreementCard}>
                <Text style={styles.autoRenewal}>{getAutoRenewalText()}</Text>
                <View style={styles.agreementRow}>
                  <TouchableOpacity
                    style={styles.agreementContent}
                    onPress={() => setIsAgreed(!isAgreed)}
                    activeOpacity={0.8}
                  >
                    <CustomCheckbox
                      checked={isAgreed}
                      onPress={() => setIsAgreed(!isAgreed)}
                      size={16}
                      shape="circle"
                    />
                    <View style={styles.agreementTextContainer}>
                      <Text style={styles.agreementText}>
                        {t("vip.agreement.prefix")}
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={(e) => {
                          e.stopPropagation();
                          // 处理会员协议点击
                          router.push("/protocol/subscribe");
                        }}
                      >
                        <Text style={styles.agreementLink}>
                          {t("vip.agreement.membershipAgreement")}
                        </Text>
                      </TouchableOpacity>
                      <Text style={styles.agreementText}>
                        {t("vip.agreement.and")}{" "}
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={(e) => {
                          e.stopPropagation();
                          // 处理订阅协议点击
                          router.push("/protocol/renew");
                        }}
                      >
                        <Text style={styles.agreementLink}>
                          {t("renewProtocol.title")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        ) : null}
        <View style={styles.benefitsContainer}>
          <View style={styles.benefitsHeader}>
            <LinearGradient
              colors={["rgba(12, 10, 9, 0.00)", "#0C0A09"]}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 1 }}
              style={styles.benefitsLine}
            />
            <Text style={styles.benefitsTitle}>{t("vip.benefits.title")}</Text>
            <LinearGradient
              colors={["rgba(12, 10, 9, 0.00)", "#0C0A09"]}
              start={{ x: 1, y: 1 }}
              end={{ x: 0, y: 1 }}
              style={styles.benefitsLine}
            />
          </View>
          <View style={styles.benefitsList}>
            <View style={styles.benefitRow}>
              <View style={styles.benefitCard}>
                <View style={styles.benefitIconContainer}>
                  <Image
                    source={require("@/assets/images/vip/unlimited.png")}
                    style={styles.benefitIcon}
                  />
                </View>
                <View style={styles.benefitTextContainer}>
                  <Text style={styles.benefitTitle}>
                    {t("vip.benefits.items.unlimitedTests.title")}
                  </Text>
                </View>
              </View>
              <View style={styles.benefitCard}>
                <View style={styles.benefitIconContainer}>
                  <Image
                    source={require("@/assets/images/vip/exclusive.png")}
                    style={styles.benefitIcon}
                  />
                </View>
                <View style={styles.benefitTextContainer}>
                  <Text style={styles.benefitTitle}>
                    {t("vip.benefits.items.exclusiveContent.title")}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.benefitRow}>
              <View style={styles.benefitCard}>
                <View style={styles.benefitIconContainer}>
                  <Image
                    source={require("@/assets/images/vip/support.png")}
                    style={styles.benefitIcon}
                  />
                </View>
                <View style={styles.benefitTextContainer}>
                  <Text style={styles.benefitTitle}>
                    {t("vip.benefits.items.prioritySupport.title")}
                  </Text>
                </View>
              </View>
              <View style={styles.benefitCard}>
                <View style={styles.benefitIconContainer}>
                  <Image
                    source={require("@/assets/images/vip/no-ads.png")}
                    style={styles.benefitIcon}
                  />
                </View>
                <View style={styles.benefitTextContainer}>
                  <Text style={styles.benefitTitle}>
                    {t("vip.benefits.items.noAds.title")}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        <Button
          mode="contained"
          style={[
            styles.submitButton,
            { opacity: !isAgreed || userInfo?.is_vip_active ? 0.5 : 1 },
          ]}
          contentStyle={styles.submitButtonContent}
          labelStyle={styles.confirmButtonText}
          onPress={handleConfirm}
          disabled={paymentLoading || !isAgreed || userInfo?.is_vip_active}
        >
          {paymentLoading ? t("common.camera.processing") : t("common.confirm")}
        </Button>
      </View>
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
    paddingHorizontal: 16,
  },
  cardContainer: {
    position: "relative",
    width: "100%",
    height: 140,
    marginTop: 16,
  },
  cardBackground: {
    position: "absolute",
    top: 40,
    width: "100%",
    height: 100,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
  },
  username: {
    fontSize: 14,
    ...createFontStyle("600"),
    color: "#0C0A09",
  },
  status: {
    position: "absolute",
    bottom: -10,
    left: 16,
    fontSize: 12,
    ...createFontStyle("500"),
  },
  cardDecoration: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 150,
    height: 150,
  },
  subscriptionContainer: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 20,
  },
  loadingContainer: {
    height: 240,
    justifyContent: "center",
    alignItems: "center",
  },
  subscriptionItem: {
    width: 106,
  },
  subscriptionContent: {
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 12,
    height: "100%",
    backgroundColor: "#FFFFFF",
  },
  subscriptionTitle: {
    minHeight: 36,
    fontSize: 14,
    ...createFontStyle("500"),
    textAlign: "center",
    lineHeight: 18,
  },
  priceContainer: {
    height: 30,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
  },
  currencySymbol: {
    marginBottom: 2,
    fontSize: 14,
    ...createFontStyle("500"),
  },
  price: {
    fontSize: 24,
    ...createFontStyle("500"),
  },
  perMonth: {
    fontSize: 12,
    ...createFontStyle("400"),
    color: "#515C66",
  },
  agreementContainer: {
    paddingBottom: 24,
  },
  agreementCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    padding: 12,
    gap: 12,
  },
  autoRenewal: {
    fontSize: 14,
    ...createFontStyle("400"),
    color: "#515C66",
    lineHeight: 18,
  },
  agreementRow: {
    flexDirection: "row",
  },
  agreementContent: {
    flex: 1,
    flexDirection: "row",
    gap: 4,
    alignItems: "flex-start",
  },
  agreementTextContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  agreementText: {
    fontSize: 12,
    ...createFontStyle("400"),
    color: "#515C66",
  },
  agreementLink: {
    fontSize: 12,
    ...createFontStyle("400"),
    color: "#19DBF2",
    textDecorationLine: "underline",
  },
  submitButton: {
    marginBottom: 24,
    borderRadius: 78,
    backgroundColor: "#19DBF2",
  },
  submitButtonContent: {
    height: 48,
  },
  confirmButtonText: {
    fontSize: 16,
    ...createFontStyle("600"),
    color: "#FFFFFF",
    textTransform: "capitalize",
  },
  benefitsContainer: {
    marginBottom: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingBottom: 12,
  },
  benefitsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 44,
  },
  benefitsLine: {
    width: 40,
    height: 1,
  },
  benefitsTitle: {
    fontSize: 18,
    ...createFontStyle("600"),
    color: "#0C0A09",
  },
  benefitsList: {
    gap: 12,
  },
  benefitRow: {
    width: "100%",
    flexDirection: "row",
    paddingHorizontal: 10,
  },
  benefitCard: {
    width: "50%",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
  },
  benefitIconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  benefitIcon: {
    width: 36,
    height: 36,
  },
  benefitTextContainer: {
    flex: 1,
    gap: 6,
  },
  benefitTitle: {
    fontSize: 14,
    lineHeight: 18,
    ...createFontStyle("500"),
    color: "#515C66",
    textAlign: "center",
  },
  benefitDesc: {
    fontSize: 10,
    lineHeight: 13,
    ...createFontStyle("400"),
    color: "#515C66",
  },
  footer: {
    position: "fixed",
    width: "100%",
    left: 0,
    bottom: 0,
    minHeight: 56,
    paddingVertical: 8,
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
  },
  userInfoContent: {
    gap: 4,
  },
  tipsContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 2,
    paddingLeft: 4,
    paddingRight: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.50)",
  },
  tipsIcon: {
    width: 14,
    height: 14,
  },
  tips: {
    fontSize: 10,
    ...createFontStyle("500"),
  },
});
