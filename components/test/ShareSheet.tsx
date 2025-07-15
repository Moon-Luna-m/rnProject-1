import { BottomSheet } from "@/components/ui/BottomSheet";
import { createFontStyle } from "@/utils/typography";
import { Image } from "expo-image";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ShareMethod {
  id: string;
  name: string;
  icon: any;
}

interface ShareSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onShare: (method: string) => void;
  isCapturing?: boolean;
}

interface ShareSheetContentProps {
  onShare: (method: string) => void;
  onClose?: () => void;
  isCapturing?: boolean;
}

const shareMethods: ShareMethod[] = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: require("@/assets/images/share/whatsapp.png"),
  },
  {
    id: "twitter",
    name: "Twitter",
    icon: require("@/assets/images/share/twitter.png"),
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: require("@/assets/images/share/facebook.png"),
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: require("@/assets/images/share/instagram.png"),
  },
];

function ShareSheetContent({ onShare, onClose, isCapturing }: ShareSheetContentProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      {/* 顶部拖动条 */}
      <View style={styles.header}>
        <View style={styles.divider} />
      </View>

      {/* 标题 */}
      <Text style={styles.title}>{t("test.share.title")}</Text>

      {/* 分享方式列表 */}
      <View style={styles.methodList}>
        {shareMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={styles.methodItem}
            activeOpacity={0.8}
            onPress={() => {
              onClose?.();
              onShare(method.id);
            }}
          >
            <View style={styles.iconContainer}>
              <Image
                source={method.icon}
                style={styles.icon}
                contentFit="cover"
              />
            </View>
            <Text style={styles.methodName}>{method.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function ShareSheet({
  isVisible,
  onClose,
  onShare,
  isCapturing = false,
}: ShareSheetProps) {
  return (
    <BottomSheet
      visible={isVisible}
      onClose={onClose}
      initialY={500}
      containerStyle={{ padding: 12 }}
    >
      <ShareSheetContent onShare={onShare} onClose={onClose} isCapturing={isCapturing} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 179,
    paddingHorizontal: 12,
    gap: 16,
  },
  header: {
    alignItems: "center",
    alignSelf: "stretch",
    gap: 16,
  },
  divider: {
    width: 48,
    height: 5,
    backgroundColor: "#F3F4F6",
    borderRadius: 50,
  },
  title: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 19,
    letterSpacing: 0.16,
    color: "#0C0A09",
    ...createFontStyle("700"),
    textAlign: "center",
    textTransform: "capitalize",
  },
  methodList: {
    marginTop: "auto",
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "stretch",
    gap: 24,
  },
  methodItem: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12.8,
    overflow: "hidden",
    position: "relative",
  },
  icon: {
    width: "100%",
    height: "100%",
  },
  methodName: {
    fontSize: 12,
    fontFamily: "Outfit-Medium",
    color: "#515C66",
    textAlign: "center",
  },
  loading: {
    position: "absolute",
    right: 0,
    top: 0,
    backgroundColor: "rgba(255,255,255,0.8)",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
