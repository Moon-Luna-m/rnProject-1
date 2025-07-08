import { BottomSheet } from "@/components/ui/BottomSheet";
import { createFontStyle } from "@/utils/typography";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ExitTestModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onSave: () => void;
  toastInfo:
    | {
        visible: boolean;
        message: string;
        type: "success" | "error" | "warning" | "info" | "loading";
        duration: number | null;
        onDismiss: () => void;
      }
    | undefined;
}

export function ExitTestModal({
  visible,
  onClose,
  onConfirm,
  onSave,
  toastInfo,
}: ExitTestModalProps) {
  const { t } = useTranslation();

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      containerStyle={styles.modalWrapper}
      toast={toastInfo}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.handle} />
          <View style={styles.body}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{t("test.exit.title")}</Text>
              <Text style={styles.desc}>{t("test.exit.description")}</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={onConfirm}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>
              {t("test.exit.confirmButton")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonOutline]}
            onPress={onSave}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, { color: "#19DBF2" }]}>
              {t("test.exit.saveButton")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonGray]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, { color: "#515C66" }]}>
              {t("test.exit.cancelButton")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  modalWrapper: {},
  container: {
    paddingHorizontal: 12,
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
  image: {
    width: 100,
    height: 100,
  },
  textContainer: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    ...createFontStyle("700"),
    fontSize: 16,
    color: "#0C0A09",
    letterSpacing: 0.08,
  },
  desc: {
    ...createFontStyle("400"),
    fontSize: 14,
    color: "#48484A",
    letterSpacing: 0.07,
    textAlign: "center",
    width: 279,
    lineHeight: 22.4,
  },
  buttons: {
    marginTop: 24,
    gap: 12,
  },
  button: {
    height: 48,
    borderRadius: 78,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonPrimary: {
    backgroundColor: "#19DBF2",
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: "#19DBF2",
  },
  buttonGray: {
    backgroundColor: "#F3F4F6",
  },
  buttonText: {
    ...createFontStyle("600"),
    fontSize: 16,
    textTransform: "capitalize",
  },
});
