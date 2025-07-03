import { createFontStyle } from "@/utils/typography";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StripePayment() {
  const { t } = useTranslation();
  const successCallback = async () => {
    location.href = "/";
  };
  return (
    <View style={styles.container}>
      <LinearGradient colors={["#B7E8FF", "#F5F7FA"]} style={styles.gradient} />
      <SafeAreaView style={styles.content}>
        <View style={styles.mainContainer}>
          <Image
            source={require("@/assets/images/login/pay-success.png")}
            style={styles.successImage}
          />
          <Text style={styles.title}>{t("payment.paySuccess")}</Text>

          <Button
            mode="contained"
            onPress={successCallback}
            style={[styles.submitButton]}
            contentStyle={styles.submitButtonContent}
            labelStyle={styles.submitButtonText}
          >
            {t("payment.return")}
          </Button>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: "#F5F7FA",
  },
  gradient: {
    position: "absolute",
    width: "100%",
    height: 375,
    left: 0,
    top: 0,
  },
  backContainer: {
    height: 44,
    width: "100%",
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  mainContainer: {
    paddingTop: 200,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  title: {
    marginTop: 20,
    fontSize: 24,
    ...createFontStyle("600"),
    color: "#282828",
  },
  successImage: {
    width: 140,
    height: 140,
  },
  submitButton: {
    marginTop: 24,
    borderRadius: 78,
    backgroundColor: "#19DBF2",
    width: "100%",
  },
  submitButtonContent: {
    height: 48,
  },
  submitButtonText: {
    fontSize: 16,
    ...createFontStyle("600"),
    letterSpacing: 1,
    color: "#FFFFFF",
  },
});
