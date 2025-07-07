import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { userService } from "@/services/userService";
import { setUserInfo } from "@/store/slices/userSlice";
import { setToken } from "@/utils/http/request";
import { createFontStyle } from "@/utils/typography";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useDispatch } from "react-redux";

export default function SocialLogin() {
  const { t } = useTranslation();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const {
    login: googleLogin,
    loading: googleLoading,
    error: googleError,
    userInfo,
  } = useGoogleAuth();
  const dispatch = useDispatch();

  const socialButtons = [
    {
      id: "facebook",
      icon: require("@/assets/images/social/facebook.png"),
      onPress: () => handleSocialLogin("facebook"),
    },
    {
      id: "google",
      icon: require("@/assets/images/social/google.png"),
      onPress: () => handleSocialLogin("google"),
    },
    {
      id: "apple",
      icon: require("@/assets/images/social/apple.png"),
      onPress: () => handleSocialLogin("apple"),
    },
  ];

  const handleSocialLogin = async (type: string) => {
    try {
      setLoadingStates((prev) => ({ ...prev, [type]: true }));

      switch (type) {
        case "google":
          await googleLogin();
          break;
        case "facebook":
          // TODO: 实现 Facebook 登录
          console.log("Facebook login not implemented");
          break;
        case "apple":
          // TODO: 实现 Apple 登录
          console.log("Apple login not implemented");
          break;
      }
    } catch (error) {
      console.error(`${type} login failed:`, error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [type]: false }));
    }
  };

  useEffect(() => {
    const res = async () => {
      if (!userInfo) return;
      const res = await userService.googleLogin({
        avatar_url: userInfo?.picture,
        email: userInfo?.email,
        google_id: userInfo?.id,
        name: userInfo?.name,
      });
      if (res.code === 200) {
        await setToken(res.data.token);
        const info = await userService.getUserInfo();
        if (info.code === 200) {
          dispatch(setUserInfo(info.data));
          router.replace("/");
        }
      }
    };
    res();
  }, [userInfo]);

  return (
    <View style={styles.container}>
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>{t("form.login.otherMethods")}</Text>
        <View style={styles.divider} />
      </View>
      <View style={styles.buttonContainer}>
        {socialButtons.map((button) => {
          const isLoading =
            loadingStates[button.id] ||
            (button.id === "google" && googleLoading);

          return (
            <TouchableOpacity
              key={button.id}
              style={[
                styles.socialButton,
                isLoading && styles.socialButtonDisabled,
              ]}
              onPress={button.onPress}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size={24} color="#19DBF2" />
              ) : (
                <Image
                  source={button.icon}
                  style={styles.socialIcon}
                  contentFit="contain"
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    gap: 32,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  divider: {
    width: 24,
    height: 1,
    backgroundColor: "#A9AEB8",
  },
  dividerText: {
    fontSize: 12,
    ...createFontStyle("500"),
    color: "#A9AEB8",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
    paddingHorizontal: 24,
  },
  socialButton: {
    width: 52,
    height: 52,
    borderRadius: 75.64,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.18,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  socialButtonDisabled: {
    opacity: 0.7,
  },
  socialIcon: {
    width: 28,
    height: 28,
  },
});
