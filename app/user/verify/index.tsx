import ErrorMessage from "@/components/ErrorMessage";
import { userService } from "@/services/userService";
import {
  clearLocalCache,
  decrypt,
  encrypt,
  getLocalCache,
  setLocalCache,
} from "@/utils/common";
import { createFontStyle } from "@/utils/typography";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import {
  ImageBackground,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VerifyScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [focusIndex, setFocusIndex] = useState<number>(0);
  const inputRef = useRef<TextInput>(null);
  const [error, setError] = useState<string>("");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const { from } = useLocalSearchParams();

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setIsKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // 点击某个输入框
  const handleBoxPress = (index: number) => {
    setFocusIndex(index);
    if (!isKeyboardVisible) {
      // 键盘隐藏时才执行重新聚焦逻辑
      inputRef.current?.blur();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      // 键盘显示时直接聚焦
      inputRef.current?.focus();
    }
  };

  // 处理验证码输入
  const handleCodeChange = (text: string) => {
    // 只允许输入数字
    const newText = text.replace(/[^0-9]/g, "");
    if (!newText) return;

    // 获取最后输入的数字
    const lastChar = newText.slice(-1);
    setCode(code.map((_, index) => (index === focusIndex ? lastChar : _)));

    // 如果不是最后一位，自动移动到下一位
    if (focusIndex < 5) {
      setFocusIndex(focusIndex + 1);
    }
  };

  // 处理删除操作
  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === "Backspace") {
      const newCode = [...code];
      if (newCode[focusIndex]) {
        newCode[focusIndex] = "";
        setCode([...newCode]);
      }
      if (focusIndex > 0) {
        setFocusIndex(focusIndex - 1);
      }
    }
  };

  // 验证验证码
  const verifyCode = async () => {
    const verifyCode = code.join("");
    if (from !== "forgot") {
      const info = await getLocalCache("user_register_info");
      if (info) {
        const { email, password } = JSON.parse(decrypt(info));
        const res = await userService.register({
          code: verifyCode,
          email,
          password,
        });
        if (res.code === 200) {
          setError("");
          await clearLocalCache("user_register_info");
          router.replace({
            pathname: "/user/verify/[params]",
            params: { params: "register" },
          });
        } else {
          setError(res.message);
        }
      }
    } else {
      await setLocalCache(
        "user_forgot_captcha",
        encrypt(
          JSON.stringify({
            code: verifyCode,
          })
        )
      );
      router.push({
        pathname: "/user/verify/[params]",
        params: { params: "reset" },
      });
    }
  };

  // 自动聚焦输入框
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (from === "forgot") {
      const getEmail = async () => {
        const info = await getLocalCache("user_forgot_info");
        if (info) {
          const { email } = JSON.parse(decrypt(info));
          setEmail(email);
        }
      };
      getEmail();
    } else {
      const getEmail = async () => {
        const info = await getLocalCache("user_register_info");
        if (info) {
          const { email } = JSON.parse(decrypt(info));
          setEmail(email);
        }
      };
      getEmail();
    }
  }, []);

  useEffect(() => {
    const complete = code.every((item) => item !== "");
    if (complete) {
      verifyCode();
    }
  }, [code]);

  // 渲染单个验证码框
  const renderCodeBox = (index: number) => {
    const digit = code[index];
    const isActive = focusIndex === index;

    const cursorAnimatedStyle = useAnimatedStyle(() => ({
      opacity: withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(0, { duration: 500 })
        ),
        -1, // -1 表示无限重复
        true // true 表示反向动画
      ),
    }));

    return (
      <TouchableOpacity
        key={index}
        activeOpacity={0.8}
        onPress={() => handleBoxPress(index)}
        style={[
          styles.codeBox,
          isActive && styles.codeBoxActive,
          error && styles.codeBoxError,
        ]}
      >
        {digit.trim() ? (
          <Text style={styles.codeText}>{digit}</Text>
        ) : isActive ? (
          <Animated.View
            style={[
              styles.cursor,
              error && styles.cursorError,
              cursorAnimatedStyle,
            ]}
          />
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("@/assets/images/login/bg.png")}
        style={styles.bg}
        resizeMode="cover"
      />
      <SafeAreaView style={styles.content}>
        <TouchableOpacity
          style={styles.backContainer}
          onPress={() => {
            router.back();
          }}
        >
          <Ionicons name="arrow-back-outline" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.mainContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{t("form.verify.title")}</Text>
            <Text style={styles.subtitle}>
              <Trans
                i18nKey="form.verify.subtitle"
                values={{
                  email,
                }}
                components={[<Text style={{ color: "#0C0A09" }}>{email}</Text>]}
              />
            </Text>
          </View>

          {/* 验证码输入区 */}
          <View style={styles.codeContainer}>
            <View style={styles.codeBoxesContainer}>
              {Array(6)
                .fill(null)
                .map((_, index) => renderCodeBox(index))}
            </View>
            <TextInput
              ref={inputRef}
              value=""
              onChangeText={handleCodeChange}
              onKeyPress={handleKeyPress}
              style={styles.hiddenInput}
              keyboardType="number-pad"
              autoFocus={true}
              showSoftInputOnFocus={true}
              caretHidden={true}
              onFocus={() => {
                // 如果没有输入任何内容，从第一个开始
                if (!code) {
                  setFocusIndex(0);
                }
              }}
            />
          </View>
          <View style={styles.errorContainer}>
            <ErrorMessage visible={!!error} message={t("form.verify.error")} />
          </View>
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
  bg: {
    width: "100%",
    height: "auto",
    aspectRatio: 1,
    position: "absolute",
    top: 0,
    left: 0,
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
    paddingTop: 48,
    paddingHorizontal: 24,
  },
  titleContainer: {
    gap: 16,
  },
  title: {
    fontSize: 28,
    ...createFontStyle("600"),
    color: "#0C0A09",
  },
  subtitle: {
    fontSize: 14,
    ...createFontStyle("500"),
    color: "#72818F",
    lineHeight: 20,
  },
  codeContainer: {
    marginTop: 48,
  },
  codeBoxesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  codeBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  codeBoxActive: {
    borderColor: "#19DBF2",
  },
  codeBoxError: {
    borderColor: "#EB5735",
  },
  codeText: {
    fontSize: 22,
    ...createFontStyle("600"),
    color: "#0C0A09",
    lineHeight: 28,
  },
  cursor: {
    width: 2,
    height: 18,
    backgroundColor: "#19DBF2",
  },
  cursorError: {
    backgroundColor: "#EB5735",
  },
  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
    top: 0,
    left: 0,
  },
  errorContainer: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  errorText: {
    fontSize: 12,
    ...createFontStyle("400"),
    color: "#EB5735",
  },
});
