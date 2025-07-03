import { BottomSheet } from "@/components/ui/BottomSheet";
import { paymentService } from "@/services/paymentServices";
import { showNotification } from "@/store/slices/notificationSlice";
import { selectUserInfo } from "@/store/slices/userSlice";
import { formatCurrency, formatDecimal, setLocalCache } from "@/utils/common";
import { createFontStyle } from "@/utils/typography";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

interface RechargeOption {
  description: string;
  amount: number;
  coins_amount: number;
  bonus: number;
  is_popular: boolean;
  id: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: any;
  iconBg?: string;
}

export default function Payment() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userInfo = useSelector(selectUserInfo);
  const [selectedOption, setSelectedOption] = useState<number>(0);
  const [selectedPayment, setSelectedPayment] = useState<string>("mastercard");
  const [showInstructionSheet, setShowInstructionSheet] = useState(false);
  const [rechargeOptions, setRechargeOptions] = useState<RechargeOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const fetchRechargeOptions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paymentService.getRechargeList();
      if (res.code === 200) {
        setRechargeOptions(res.data || []);
      }
    } catch (error) {
      console.error("获取充值档位失败:", error);
    } finally {
      setLoading(false);
    }
  }, [paymentService]);

  useEffect(() => {
    fetchRechargeOptions();
  }, [fetchRechargeOptions]);

  const handleSelectOption = (index: number) => {
    setSelectedOption(index);
  };

  const handleSelectPayment = async (id: string) => {
    setSelectedPayment(id);
  };

  const handleConfirm = async () => {
    if (selectedOption === null) return;
    setShowInstructionSheet(true);
  };

  const handleTopUp = async () => {
    if (paymentLoading) return;
    try {
      setPaymentLoading(true);
      setShowInstructionSheet(false);

      // 创建支付订单
      const orderResponse = await paymentService.createPaymentOrder({
        desc: `${rechargeOptions[selectedOption].coins_amount}`,
        payment_gateway: "STRIPE",
        payment_method: Platform.OS === "web" ? "WEB" : "APP",
        product_id: rechargeOptions[selectedOption].id,
        product_type: 1,
      });

      if (orderResponse.code !== 200 || !orderResponse.data) return;
      await setLocalCache("success_callback", location.href);
      location.href = orderResponse.data.pay_url;
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

  const paymentMethods: PaymentMethod[] = [
    {
      id: "mastercard",
      name: t("wallet.paymentMethods.mastercard"),
      icon: require("@/assets/images/wallet/mastercard.png"),
    },
    {
      id: "paypal",
      name: t("wallet.paymentMethods.paypal"),
      icon: require("@/assets/images/wallet/paypal.png"),
    },
  ];

  const instructions = [
    t("wallet.instructions.0"),
    t("wallet.instructions.1"),
    t("wallet.instructions.2"),
    t("wallet.instructions.3"),
  ];

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backContainer}
        onPress={() => {
          router.back();
        }}
      >
        <Ionicons name="arrow-back-outline" size={24} color="black" />
        <Text style={styles.backText}>{t("wallet.title")}</Text>
      </TouchableOpacity>
      <View style={styles.content}>
        <LinearGradient
          colors={["#2277FF", "#34D9FA"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.balanceCard}
        >
          <View style={styles.circles}>
            <View style={[styles.circle, styles.circle1]} />
            <View style={[styles.circle, styles.circle2]} />
            <View style={[styles.circle, styles.circle3]} />
          </View>
          <View style={styles.balanceContent}>
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceTitle}>
                {t("wallet.currentBalance")}
              </Text>
              <Ionicons name="help-circle-outline" size={16} color="white" />
            </View>
            <View style={styles.balanceAmount}>
              <Image
                source={require("@/assets/images/wallet/coin.png")}
                style={styles.coinIcon}
              />
              <Text style={styles.amount}>
                {formatCurrency(userInfo?.balance, "")}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.detailsButton}
            activeOpacity={0.8}
            onPress={() => router.push("/profile/wallet/details")}
          >
            <Text style={styles.detailsText}>{t("wallet.coinDetails")}</Text>
            <AntDesign name="arrowright" size={16} color="white" />
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView>
          <Text style={styles.rechargeTitle}>{t("wallet.rechargeAmount")}</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#19DBF2" />
            </View>
          ) : (
            <View style={styles.rechargeGrid}>
              {rechargeOptions.map((option, index) => (
                <View style={styles.rechargeOptionContainer} key={index}>
                  <TouchableOpacity
                    style={[
                      styles.rechargeOption,
                      selectedOption === index && styles.rechargeOptionSelected,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => handleSelectOption(index)}
                  >
                    <View style={styles.rechargeContent}>
                      <View style={styles.coinAmount}>
                        <Image
                          source={require("@/assets/images/wallet/coin.png")}
                          style={styles.smallCoinIcon}
                        />
                        <Text style={styles.coinText}>
                          {formatDecimal(
                            (option.coins_amount + option.bonus) / 100,
                            0
                          )}
                        </Text>
                      </View>
                      <View style={styles.priceTag}>
                        <Text style={styles.priceText}>
                          {formatCurrency(option.amount)}
                        </Text>
                      </View>
                    </View>
                    {option.is_popular && (
                      <View style={[styles.tag, styles.limitedTag]}>
                        <Text style={styles.tagText}>{option.description}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* <Text style={styles.rechargeTitle}>{t("wallet.rechargeMethod")}</Text>
          <View style={styles.paymentMethods}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethod,
                  selectedPayment === method.id && styles.paymentMethodSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => handleSelectPayment(method.id)}
              >
                <View
                  style={[
                    styles.paymentIcon,
                    method.iconBg && { backgroundColor: method.iconBg },
                  ]}
                >
                  <Image source={method.icon} style={styles.methodIcon} />
                </View>
                <View style={styles.paymentDetails}>
                  <Text style={styles.paymentName}>{method.name}</Text>
                </View>
                <CustomCheckbox
                  checked={selectedPayment === method.id}
                  onPress={() => handleSelectPayment(method.id)}
                  size={24}
                  activeColor="#19DBF2"
                  inactiveColor="#C1C7D0"
                  shape="circle"
                />
              </TouchableOpacity>
            ))}
          </View> */}
        </ScrollView>
        {rechargeOptions.length ? (
          <Button
            mode="contained"
            style={[
              styles.submitButton,
              selectedOption === null && styles.submitButtonDisabled,
            ]}
            contentStyle={styles.submitButtonContent}
            labelStyle={styles.confirmButtonText}
            onPress={handleConfirm}
            disabled={selectedOption === null || paymentLoading}
            loading={paymentLoading}
          >
            {paymentLoading
              ? t("common.camera.processing")
              : t("common.confirm")}
          </Button>
        ) : null}
      </View>

      <BottomSheet
        visible={showInstructionSheet}
        onClose={() => setShowInstructionSheet(false)}
        containerStyle={{ height: 314 }}
        initialY={500}
      >
        <View style={styles.sheetContainer}>
          <View style={styles.sheetContent}>
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            <View style={styles.instructionContainer}>
              <Text style={styles.instructionTitle}>
                {t("wallet.rechargeInstructions")}
              </Text>
              {instructions.map((instruction, index) => (
                <View key={index} style={styles.instructionRow}>
                  <View style={styles.instructionDot} />
                  <Text style={styles.instructionText}>{instruction}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        <View style={styles.buttonGroup}>
          <Button
            mode="outlined"
            style={styles.cancelButton}
            contentStyle={styles.buttonContent}
            labelStyle={[styles.buttonText, { color: "#19DBF2" }]}
            rippleColor="rgba(0,0,0,0.03)"
            onPress={() => setShowInstructionSheet(false)}
          >
            {t("common.cancel")}
          </Button>
          <Button
            mode="contained"
            style={[
              styles.confirmButton,
              { opacity: paymentLoading ? 0.5 : 1 },
            ]}
            contentStyle={styles.buttonContent}
            labelStyle={[styles.buttonText, styles.whiteText]}
            onPress={handleTopUp}
            disabled={paymentLoading}
          >
            {t("common.confirm")}
          </Button>
        </View>
      </BottomSheet>
    </SafeAreaView>
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
    paddingTop: 12,
  },
  balanceCard: {
    height: 100,
    borderRadius: 20,
    padding: 22,
    overflow: "hidden",
    position: "relative",
  },
  circles: {
    position: "absolute",
    right: 0,
    top: 0,
  },
  circle: {
    position: "absolute",
    borderRadius: 999,
  },
  circle1: {
    width: 186,
    height: 186,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    right: -49,
    top: -49,
  },
  circle2: {
    width: 136,
    height: 136,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    right: -44,
    top: -44,
  },
  circle3: {
    width: 110,
    height: 110,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    right: -55,
    top: -55,
  },
  balanceContent: {
    gap: 8,
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  balanceTitle: {
    fontSize: 14,
    lineHeight: 18,
    color: "#FFFFFF",
    ...createFontStyle("500"),
  },
  eyeImage: {
    width: "100%",
    height: "100%",
  },
  balanceAmount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  coinIcon: {
    width: 24,
    height: 24,
  },
  amount: {
    fontSize: 24,
    lineHeight: 30,
    color: "#FFFFFF",
    ...createFontStyle("500"),
  },
  detailsButton: {
    position: "absolute",
    right: 12,
    top: 34,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingVertical: 8,
    paddingLeft: 12,
    paddingRight: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#FFFEFE",
  },
  detailsText: {
    fontSize: 12,
    lineHeight: 16,
    color: "#FFFFFF",
    ...createFontStyle("600"),
  },
  rechargeTitle: {
    fontSize: 14,
    lineHeight: 18,
    color: "#0C0A09",
    ...createFontStyle("700"),
    marginTop: 20,
  },
  rechargeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
  rechargeOptionContainer: { width: `${100 / 3}%`, padding: 2 },
  rechargeOption: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#F3F4F6",
    padding: 12,
    paddingTop: 20,
    alignItems: "center",
    gap: 4,
    position: "relative",
  },
  rechargeOptionSelected: {
    borderColor: "#19DBF2",
  },
  rechargeContent: {
    alignItems: "center",
    gap: 4,
    width: "100%",
  },
  coinAmount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    justifyContent: "center",
  },
  smallCoinIcon: {
    width: 20,
    height: 20,
  },
  coinText: {
    fontSize: 16,
    lineHeight: 20,
    color: "#0C0A09",
    ...createFontStyle("500"),
  },
  priceTag: {
    backgroundColor: "#F5F7FA",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 28,
  },
  priceText: {
    fontSize: 10,
    lineHeight: 13,
    color: "#0C0A09",
    ...createFontStyle("500"),
  },
  tag: {
    position: "absolute",
    top: 0,
    right: -1,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderBottomLeftRadius: 8,
    borderTopRightRadius: 12,
  },
  firstTag: {
    backgroundColor: "#EA6AEA",
  },
  limitedTag: {
    backgroundColor: "#F28919",
  },
  tagText: {
    fontSize: 8,
    lineHeight: 10,
    color: "#FFFFFF",
    ...createFontStyle("600"),
  },
  paymentMethods: {
    marginTop: 12,
    gap: 12,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 48,
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 16,
    borderWidth: 2,
    borderColor: "#F3F4F6",
  },
  paymentMethodSelected: {
    borderColor: "#19DBF2",
  },
  paymentIcon: {
    borderRadius: 36,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  methodIcon: {
    width: 36,
    height: 36,
    resizeMode: "contain",
  },
  paymentDetails: {
    flex: 1,
    justifyContent: "center",
  },
  paymentName: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.2,
    color: "#0D0D12",
    ...createFontStyle("500"),
  },
  submitButton: {
    marginBottom: 20,
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
  submitButtonDisabled: {
    backgroundColor: "#E5E7EB",
  },
  sheetContainer: {
    height: "100%",
  },
  sheetContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  handleContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  handle: {
    width: 48,
    height: 5,
    backgroundColor: "#F3F4F6",
    borderRadius: 50,
  },
  instructionContainer: {
    alignItems: "center",
    alignSelf: "stretch",
    gap: 8,
  },
  instructionTitle: {
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.5,
    ...createFontStyle("700"),
    color: "#0C0A09",
  },
  instructionRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "stretch",
    gap: 8,
  },
  instructionDot: {
    width: 7,
    height: 7,
    borderRadius: 7,
    backgroundColor: "#19DBF2",
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0.5,
    color: "#48484A",
    ...createFontStyle("400"),
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
    marginTop: "auto",
  },
  buttonContent: {
    height: 48,
  },
  buttonText: {
    fontSize: 16,
    lineHeight: 20,
    ...createFontStyle("600"),
    textTransform: "capitalize",
    color: "#FFFFFF",
  },
  cancelButton: {
    flex: 1,
    borderRadius: 78,
    borderColor: "#19DBF2",
    borderWidth: 1,
  },
  confirmButton: {
    flex: 1,
    borderRadius: 78,
    backgroundColor: "#19DBF2",
  },
  whiteText: {
    color: "#FFFFFF",
  },
  loadingContainer: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
});
