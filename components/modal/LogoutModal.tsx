import { BottomSheet } from "@/components/ui/BottomSheet";
import { createFontStyle } from "@/utils/typography";

import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";

interface LogoutModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutModal({
  visible,
  onClose,
  onConfirm,
}: LogoutModalProps) {
  const { t } = useTranslation();

  return (
    <BottomSheet visible={visible} onClose={onClose} initialY={300}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.handle} />
          <View style={styles.body}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{t("settings.logout.title")}</Text>
              <Text style={styles.description}>
                {t("settings.logout.description")}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.buttons}>
          <Button
            mode="outlined"
            style={styles.button}
            labelStyle={styles.buttonText}
            contentStyle={styles.buttonContent}
            onPress={onClose}
            textColor="#19DBF2"
            rippleColor="rgba(0, 0, 0, 0.03)"
          >
            {t("settings.logout.cancel")}
          </Button>
          <Button
            mode="contained"
            style={styles.button}
            labelStyle={styles.buttonText}
            contentStyle={styles.buttonContent}
            onPress={onConfirm}
            buttonColor="#19DBF2"
            textColor="#FFFFFF"
          >
            {t("settings.logout.confirm")}
          </Button>
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  content: {
    alignItems: "center",
    gap: 16,
  },
  handle: {
    width: 48,
    height: 5,
    backgroundColor: "#F3F4F6",
    borderRadius: 50,
  },
  body: {
    alignItems: "center",
    gap: 32,
  },
  textContainer: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.08,
    color: "#0C0A09",
    ...createFontStyle("700"),
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0.07,
    color: "#48484A",
    textAlign: "center",
    width: 279,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 78,
    borderColor: "#19DBF2",
  },
  buttonContent: {
    height: 48,
  },
  buttonText: {
    fontSize: 16,
    lineHeight: 20,
    ...createFontStyle("600"),
    textTransform: "capitalize",
  },
});
