import CustomCheckbox from "@/components/CustomCheckbox";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { TabItem, Tabs } from "@/components/ui/Tabs";
import { selectUserInfo } from "@/store/slices/userSlice";
import { formatNumber } from "@/utils/common";
import { createFontStyle } from "@/utils/typography";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";

interface PaymentMethod {
  id: string;
  name: string;
  icon: any;
}

interface PurchaseSheetProps {
  isVisible: boolean;
  onClose: () => void;
  price: number;
  onConfirm: (method: string) => void;
  testName: string;
  toastInfo?: {
    visible: boolean;
    message: string;
    type: "success" | "error" | "warning" | "info" | "loading";
    duration: number | null;
    onDismiss: () => void;
  };
}

interface PurchaseSheetContentProps {
  price: number;
  onConfirm: (method: string) => void;
  onClose?: () => void;
  testName: string;
}

const paymentTabs: TabItem[] = [
  {
    key: "payment",
    title: "purchase.tabs.payment",
  },
  {
    key: "coin",
    title: "purchase.tabs.coin",
  },
];

const paymentMethods: PaymentMethod[] = [
  {
    id: "mastercard",
    name: "Mastercard",
    icon: require("@/assets/images/wallet/mastercard.png"),
  },
  {
    id: "paypal",
    name: "Paypal",
    icon: require("@/assets/images/wallet/paypal.png"),
  },
];

function PurchaseSheetContent({
  price,
  onConfirm,
  onClose,
  testName,
}: PurchaseSheetContentProps) {
  const { t } = useTranslation();
  const [selectedMethod, setSelectedMethod] = useState("mastercard");
  const [paymentType, setPaymentType] = useState<"payment" | "coin">("payment");
  const userInfo = useSelector(selectUserInfo);

  return (
    <View style={styles.container}>
      {/* 顶部拖动条 */}
      <View style={styles.header}>
        <View style={styles.divider} />
      </View>

      {/* 支付方式切换 */}
      <View style={styles.tabContainer}>
        <Tabs
          tabs={paymentTabs.map((tab) => ({ ...tab, title: t(tab.title) }))}
          activeKey={paymentType}
          onChange={(key) => setPaymentType(key as "payment" | "coin")}
          containerStyle={styles.tabWrapper}
          tabStyle={styles.tab}
          textStyle={styles.tabText}
          activeTextStyle={styles.activeTabText}
        />
      </View>

      {paymentType === "coin" ? (
        <>
          {/* 金币余额 */}
          <View style={styles.coinBalanceCard}>
            <View style={styles.coinBalanceInfo}>
              <Text style={styles.coinBalanceTitle}>
                {t("purchase.coin.balance")}
              </Text>
              <View style={styles.coinAmount}>
                <Image
                  source={require("@/assets/images/wallet/coin.png")}
                  style={styles.coinIcon}
                  contentFit="contain"
                />
                <Text style={styles.coinBalanceText}>
                  {formatNumber(userInfo?.balance)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.rechargeButton}
              onPress={() => {
                onClose?.();
                router.push("/profile/wallet");
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.rechargeText}>
                {t("purchase.coin.recharge")}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : null}

      {/* 价格卡片 */}
      <View style={styles.priceCard}>
        <View style={styles.priceIconContainer}>
          <Image
            source={require("@/assets/images/wallet/discover.png")}
            style={styles.priceIcon}
            contentFit="contain"
          />
        </View>
        <View style={styles.priceContent}>
          <View style={styles.advancedBadgeContainer}>
            <LinearGradient
              colors={["#72FFFD", "#69FF7D", "#FFADFB"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              locations={[0, 0.476, 0.9856]}
              style={styles.advancedBadge}
            >
              <Text style={styles.advancedText}>
                {t("purchase.card.badge")}
              </Text>
            </LinearGradient>
          </View>
          <Text style={styles.priceTitle} numberOfLines={1}>
            {testName}
          </Text>
          <View style={styles.priceRow}>
            {paymentType === "coin" ? (
              <>
                <View style={styles.coinAmount}>
                  <Image
                    source={require("@/assets/images/wallet/coin.png")}
                    style={styles.coinIconSmall}
                    contentFit="contain"
                  />
                  <Text style={styles.price}>{price}</Text>
                </View>
                <Text style={styles.equalSign}>=</Text>
                <Text style={styles.dollarPrice}>${price}</Text>
              </>
            ) : (
              <Text style={styles.price}>${price}</Text>
            )}
          </View>
        </View>
      </View>

      {paymentType === "payment" ? (
        /* 支付方式列表 */
        <View style={styles.methodList}>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodItem,
                selectedMethod === method.id && styles.selectedMethod,
              ]}
              activeOpacity={0.8}
              onPress={() => setSelectedMethod(method.id)}
            >
              <Image
                source={method.icon}
                style={styles.icon}
                contentFit="contain"
              />
              <View style={styles.methodContent}>
                <Text style={styles.methodName}>{method.name}</Text>
              </View>
              <CustomCheckbox
                checked={selectedMethod === method.id}
                onPress={() => setSelectedMethod(method.id)}
                size={24}
                activeColor="#19DBF2"
                inactiveColor="#C1C7D0"
                shape="circle"
              />
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        /* 金币支付说明 */
        <View style={styles.illustrationContainer}>
          <Text style={styles.illustrationTitle}>
            {t("purchase.coin.illustration.title")}
          </Text>
          <Text style={styles.illustrationText}>
            {t("purchase.coin.illustration.text")}
          </Text>
        </View>
      )}

      {/* 确认按钮 */}
      <TouchableOpacity
        style={styles.confirmButton}
        onPress={() =>
          onConfirm(paymentType === "payment" ? selectedMethod : "coin")
        }
      >
        <Text style={styles.confirmText}>{t("purchase.confirm")}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function PurchaseSheet({
  isVisible,
  onClose,
  price,
  onConfirm,
  testName,
  toastInfo,
}: PurchaseSheetProps) {
  return (
    <BottomSheet
      visible={isVisible}
      onClose={onClose}
      initialY={500}
      containerStyle={{ padding: 12 }}
      toast={toastInfo}
    >
      <PurchaseSheetContent
        price={price}
        onClose={onClose}
        onConfirm={onConfirm}
        testName={testName}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 440,
    paddingHorizontal: 20,
    gap: 24,
  },
  header: {
    alignItems: "center",
    alignSelf: "stretch",
    gap: 10,
  },
  divider: {
    width: 48,
    height: 5,
    backgroundColor: "#F3F4F6",
    borderRadius: 50,
  },
  tabContainer: {
    alignSelf: "stretch",
    height: 44,
  },
  tabWrapper: {
    backgroundColor: "#F5F7FA",
  },
  tab: {
    height: 44,
    borderRadius: 22,
  },
  tabText: {
    fontSize: 12,
    lineHeight: 15,
    color: "#A9AEB8",
    ...createFontStyle("500"),
  },
  activeTabText: {
    color: "#FFFFFF",
    ...createFontStyle("600"),
  },
  coinBalanceCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
    padding: 16,
    backgroundColor: "#227AFF",
    borderRadius: 20,
  },
  coinBalanceInfo: {
    gap: 12,
  },
  coinBalanceTitle: {
    fontSize: 14,
    lineHeight: 18,
    color: "#FFFFFF",
    ...createFontStyle("500"),
  },
  coinAmount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  coinIcon: {
    width: 16,
    height: 16,
  },
  coinIconSmall: {
    width: 24,
    height: 24,
  },
  coinBalanceText: {
    fontSize: 16,
    lineHeight: 20,
    color: "#FFFFFF",
    ...createFontStyle("500"),
  },
  rechargeButton: {
    backgroundColor: "#F5F7FA",
    borderRadius: 100,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  rechargeText: {
    fontSize: 12,
    lineHeight: 16,
    color: "#0C0A09",
    ...createFontStyle("700"),
  },
  priceCard: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    padding: 6,
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  priceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 44.44,
    backgroundColor: "#C6F6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  priceIcon: {
    width: 24,
    height: 24,
  },
  priceContent: {
    flex: 1,
    gap: 4,
  },
  priceTitle: {
    fontSize: 16,
    lineHeight: 20,
    color: "#0C0A09",
    ...createFontStyle("600"),
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  price: {
    fontSize: 24,
    lineHeight: 30,
    color: "#FF6F00",
    ...createFontStyle("500"),
  },
  equalSign: {
    fontSize: 12,
    lineHeight: 15,
    color: "#515C66",
    marginHorizontal: 4,
  },
  dollarPrice: {
    fontSize: 14,
    lineHeight: 18,
    color: "#515C66",
  },
  methodList: {
    alignSelf: "stretch",
    gap: 12,
  },
  methodItem: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    padding: 12,
    paddingRight: 16,
    gap: 12,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: "#F3F4F6",
  },
  selectedMethod: {
    borderColor: "#19DBF2",
  },
  methodIcon: {
    width: 36,
    height: 36,
    borderRadius: 36,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    padding: 10.8,
  },
  icon: {
    width: 36,
    height: 36,
  },
  methodContent: {
    flex: 1,
    justifyContent: "center",
  },
  methodName: {
    fontSize: 16,
    lineHeight: 22,
    color: "#0D0D12",
    ...createFontStyle("500"),
    letterSpacing: 0.2,
  },
  illustrationContainer: {
    alignSelf: "stretch",
    gap: 4,
  },
  illustrationTitle: {
    fontSize: 14,
    lineHeight: 18,
    color: "#515C66",
    ...createFontStyle("500"),
  },
  illustrationText: {
    fontSize: 12,
    lineHeight: 15,
    color: "#A9AEB8",
  },
  confirmButton: {
    marginTop: "auto",
    alignSelf: "stretch",
    height: 48,
    backgroundColor: "#19DBF2",
    borderRadius: 78,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmText: {
    fontSize: 16,
    lineHeight: 20,
    color: "#FFFFFF",
    ...createFontStyle("600"),
    textTransform: "uppercase",
  },
  advancedBadgeContainer: {
    height: 24,
    position: "relative",
  },
  advancedBadge: {
    position: "absolute",
    top: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    padding: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  advancedText: {
    fontSize: 12,
    ...createFontStyle("500"),
    lineHeight: 12,
    color: "#0C0A09",
  },
});
