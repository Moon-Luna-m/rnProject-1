import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";
import { Tabs } from "@/components/ui/Tabs";
import { createFontStyle } from "@/utils/typography";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ImageBackground,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("login");

  // 定义标签页
  const tabs = [
    { key: "login", title: t("form.login.tab") },
    { key: "register", title: t("form.register.tab") },
  ];

  const content = (
    <View style={styles.container}>
      <ImageBackground
        source={require("@/assets/images/login/bg.png")}
        style={styles.bg}
        resizeMode="cover"
      />
      <SafeAreaView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {t("common.welcome", { name: Constants.expoConfig?.name })}
          </Text>
          <Text style={styles.subtitle}>{t("form.login.subtitle")}</Text>
        </View>

        <Tabs
          tabs={tabs}
          activeKey={activeTab}
          onChange={setActiveTab}
          containerStyle={styles.loginTypeSwitch}
        />

        {activeTab === "login" ? <LoginForm /> : <RegisterForm />}
      </SafeAreaView>
    </View>
  );

  return Platform.OS === "web" ? (
    content
  ) : (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      {content}
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: "#F5F7FA",
  },
  bg: {
    width: "100%",
    height: "auto",
    aspectRatio: 1,
    position: "absolute",
    top: 0,
    left: 0,
  },
  content: {
    flex: 1,
  },
  header: {
    display: "flex",
    gap: (16),
    paddingHorizontal: (24),
    paddingVertical: (32),
  },
  title: {
    fontSize: 28,
    ...createFontStyle("600"),
    color: "#0C0A09",
  },
  subtitle: {
    fontSize: 14,
    color: "#A9AEB8",
    ...createFontStyle("500"),
  },
  loginTypeSwitch: {
    marginHorizontal: (24),
    marginBottom: (32),
  },
});
