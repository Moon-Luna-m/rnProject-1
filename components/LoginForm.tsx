import InputField from "@/components/InputField";
import { UserInfo, userService } from "@/services/userService";
import { setUserInfo } from "@/store/slices/userSlice";
import {
  decrypt,
  encrypt,
  getLocalCache,
  imgProxy,
  setLocalCache,
} from "@/utils/common";
import { setToken } from "@/utils/http/request";
import { createFontStyle } from "@/utils/typography";
import { getValidationSchemas } from "@/utils/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import {
  Image,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Button } from "react-native-paper";
import Animated, {
  Easing,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useDispatch } from "react-redux";
import { z } from "zod";
import CustomCheckbox from "./CustomCheckbox";
import SocialLogin from "./SocialLogin";

interface ExtendedUserInfo extends UserInfo {
  password: string;
  email: string;
  nickname?: string;
}

export default function LoginForm() {
  const { t } = useTranslation();
  const { emailSchema, passwordSchema } = getValidationSchemas();
  const [isLoading, setIsLoading] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [showEmailDropdown, setShowEmailDropdown] = useState(false);
  const [filteredUserList, setFilteredUserList] = useState<
    Record<string, ExtendedUserInfo>
  >({});
  const [isSelectingEmail, setIsSelectingEmail] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const [userList, setUserList] = useState<Record<string, ExtendedUserInfo>>(
    {}
  );
  const dropdownRef = useRef<View>(null);

  // 创建一个对象schema来包装email字段
  const formSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
  });

  type FormData = z.infer<typeof formSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const onSubmit = async (data: FormData) => {
    if (!isAgreed) {
      // TODO: 显示协议未同意提示
      return;
    }

    try {
      setIsLoading(true);
      // 模拟API调用
      const res = await userService.login({
        email: data.email,
        password: data.password,
      });
      if (res.code === 200) {
        await setToken(res.data.token);
        const userInfo = await userService.getUserInfo();
        if (userInfo.code === 200) {
          dispatch(setUserInfo(userInfo.data));
          try {
            const userInfoList = await getLocalCache("user_info");
            const userInfoListObj = userInfoList
              ? JSON.parse(decrypt(userInfoList))
              : {};
            await setLocalCache(
              "user_info",
              encrypt(
                JSON.stringify({
                  ...userInfoListObj,
                  [data.email]: {
                    ...userInfo.data,
                    email: data.email,
                    password: data.password,
                  },
                })
              )
            );
          } catch (error) {
            await setLocalCache(
              "user_info",
              encrypt(
                JSON.stringify({
                  [data.email]: userInfo.data,
                })
              )
            );
          } finally {
            // 重置到根路由
            router.replace({
              pathname: "/",
            });
          }
        }
      } else {
        setError("email", { message: res.message });
        setError("password", { message: res.message });
      }
      // TODO: 处理登录逻辑
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getUserList = async () => {
      try {
        const userInfoList = await getLocalCache("user_info");
        if (!userInfoList) {
          return;
        }

        try {
          const decryptedData = JSON.parse(decrypt(userInfoList));
          if (typeof decryptedData !== "object" || decryptedData === null) {
            throw new Error("Invalid user data format");
          }
          setUserList(decryptedData);
        } catch (decryptError) {
          console.error("Failed to decrypt or parse user data:", decryptError);
          // 清除损坏的数据
          await setLocalCache("user_info", "");
          setUserList({});
        }
      } catch (error) {
        console.error("Failed to get user list from cache:", error);
        setUserList({});
      }
    };
    getUserList();
  }, []);

  // 监听邮箱输入变化
  useEffect(() => {
    if (isSelectingEmail) {
      return;
    }

    try {
      const emailValue = watch("email");
      if (!emailValue) {
        setFilteredUserList(userList);
        return;
      }

      const filtered = Object.entries(userList).reduce((acc, [email, user]) => {
        if (email.toLowerCase().includes(emailValue.toLowerCase())) {
          acc[email] = user;
        }
        return acc;
      }, {} as Record<string, ExtendedUserInfo>);

      setFilteredUserList(filtered);

      // 如果有匹配项且输入框聚焦，显示下拉列表
      if (Object.keys(filtered).length > 0) {
        setShowEmailDropdown(true);
      } else {
        setShowEmailDropdown(false);
      }
    } catch (error) {
      console.error("Failed to filter email list:", error);
      setFilteredUserList({});
      setShowEmailDropdown(false);
    }
  }, [watch("email"), userList, isSelectingEmail]);

  const handleEmailSelect = (email: string, password: string) => {
    try {
      setIsSelectingEmail(true);
      setValue("email", email, { shouldValidate: true });
      setValue("password", password, { shouldValidate: true });
      setShowEmailDropdown(false);
      if (Platform.OS === "web") {
        // Web平台上，让输入框失去焦点
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      } else {
        // 移动端平台，使用Keyboard.dismiss()
        Keyboard.dismiss();
      }
    } catch (error) {
      console.error("Failed to select email:", error);
      setIsSelectingEmail(false);
      setShowEmailDropdown(false);
    }
  };

  useEffect(() => {
    if (Platform.OS === "web" && showEmailDropdown) {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (
          dropdownRef.current &&
          !(dropdownRef.current as any).contains(target)
        ) {
          setShowEmailDropdown(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showEmailDropdown]);

  const renderEmailDropdown = () => {
    const hasUsers = Object.keys(filteredUserList).length > 0;
    const itemHeight = 56; // 每个列表项的高度
    const contentHeight = Math.min(
      Object.keys(filteredUserList).length * itemHeight + 16,
      184
    );

    const animatedStyle = useAnimatedStyle(() => {
      return {
        opacity: withTiming(showEmailDropdown ? 1 : 0, { duration: 200 }),
        height: withTiming(showEmailDropdown && hasUsers ? contentHeight : 0, {
          duration: 200,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }),
      };
    });

    if (!hasUsers) return null;

    return (
      <Animated.View style={[styles.dropdownContainer, animatedStyle]}>
        <ScrollView
          style={styles.dropdownList}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {Object.entries(filteredUserList).map(([email, user]) => (
            <TouchableOpacity
              key={email}
              style={styles.dropdownItem}
              onPress={() => handleEmailSelect(email, user.password)}
              activeOpacity={1}
            >
              <Image
                source={{ uri: imgProxy(user.avatar) }}
                style={styles.avatar}
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.username || "Echo"}</Text>
                <Text style={styles.userEmail}>{email}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    );
  };

  return (
    <View style={styles.formContainer}>
      <View style={[styles.inputGroup, { zIndex: 10 }]}>
        <Text style={styles.inputLabel}>{t("form.email.label")}</Text>
        <TouchableWithoutFeedback>
          <View ref={dropdownRef}>
            <InputField
              control={control}
              name="email"
              placeholder={t("form.email.placeholder")}
              errors={errors}
              returnKeyType="next"
              blurOnSubmit={false}
              containerStyle={[
                styles.inputContainer,
                showEmailDropdown && styles.inputContainerActive,
              ]}
              inputStyle={styles.input}
              onFocusChange={(focused) => {
                if (focused && Object.keys(userList).length > 0) {
                  setShowEmailDropdown(true);
                  setIsSelectingEmail(false);
                }
              }}
              handleBlur={() => {
                setShowEmailDropdown(false);
              }}
              showArrow={Object.keys(userList).length > 0}
            />
            {renderEmailDropdown()}
          </View>
        </TouchableWithoutFeedback>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{t("form.password.label")}</Text>
        <InputField
          control={control}
          name="password"
          placeholder={t("form.password.placeholder")}
          secureTextEntry
          showPasswordToggle
          errors={errors}
          returnKeyType="done"
          onSubmitEditing={() => {
            Keyboard.dismiss();
            handleSubmit(onSubmit)();
          }}
          containerStyle={styles.inputContainer}
          inputStyle={styles.input}
        />
        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => {
            router.push("/user/forgot");
          }}
          activeOpacity={0.5}
        >
          <Text style={styles.forgotPasswordText}>
            {t("form.login.forgotPassword")}
          </Text>
        </TouchableOpacity>
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        style={[
          styles.submitButton,
          (isLoading || !watch("email") || !watch("password") || !isAgreed) && {
            opacity: 0.5,
          },
        ]}
        contentStyle={styles.submitButtonContent}
        labelStyle={styles.submitButtonText}
        loading={isLoading}
        disabled={
          isLoading || !watch("email") || !watch("password") || !isAgreed
        }
      >
        {isLoading ? t("common.loading") : t("form.submit.login")}
      </Button>
      <View style={styles.agreementContainer}>
        <CustomCheckbox
          checked={isAgreed}
          onPress={() => setIsAgreed(!isAgreed)}
          label={
            <Text style={styles.agreementText}>
              <Trans
                i18nKey="form.login.agreement"
                values={{
                  agreement: t("form.login.agreementLink"),
                }}
                components={[
                  <Text
                    onPress={() => router.push("/user/protocol/login")}
                    style={{ textDecorationLine: "underline" }}
                  >
                    {t("form.login.agreementLink")}
                  </Text>,
                ]}
              />
            </Text>
          }
        />
      </View>
      <SocialLogin />
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 8,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    ...createFontStyle("600"),
    color: "#0C0A09",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: "#FFFFFF",
  },
  inputContainerActive: {
    borderColor: "#19DBF2",
  },
  input: {
    flex: 1,
    fontSize: 14,
    ...createFontStyle("500"),
    color: "#0C0A09",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: -8,
  },
  forgotPasswordText: {
    fontSize: 12,
    ...createFontStyle("500"),
    color: "#19DBF2",
  },
  agreementContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  agreementText: {
    fontSize: 14,
    ...createFontStyle("500"),
    color: "#A9AEB8",
    marginLeft: 8,
  },
  submitButton: {
    marginTop: 32,
    borderRadius: 78,
    backgroundColor: "#19DBF2",
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
  dropdownContainer: {
    position: "absolute",
    top: 54,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginTop: 4,
    zIndex: 1000,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#19DBF2",
  },
  dropdownList: {
    flex: 1,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    height: 56,
    borderRadius: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 14,
    ...createFontStyle("600"),
    color: "#0C0A09",
  },
  userEmail: {
    fontSize: 12,
    ...createFontStyle("400"),
    color: "#A9AEB8",
    marginTop: 2,
  },
});
