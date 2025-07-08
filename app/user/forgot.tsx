import InputField from "@/components/InputField";
import { userService } from "@/services/userService";
import { encrypt, setLocalCache } from "@/utils/common";
import { createFontStyle } from "@/utils/typography";
import { getValidationSchemas } from "@/utils/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    Image, ImageBackground,
    Keyboard,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { Button } from "react-native-paper";
import { z } from "zod";

export default function ForgotScreen() {
  const { t } = useTranslation();
  const { emailSchema } = getValidationSchemas();
  // 创建一个对象schema来包装email字段
  const formSchema = z.object({
    email: emailSchema,
  });
  const [isLoading, setIsLoading] = useState(false);
  type FormData = z.infer<typeof formSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      Keyboard.dismiss();
      const res = await userService.getCaptcha({
        email: data.email,
        type: "reset",
      });
      if (res.code === 200) {
        await setLocalCache(
          "user_forgot_info",
          encrypt(
            JSON.stringify({
              email: data.email,
            })
          )
        );
        router.push(`/user/verify?from=forgot`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
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
          <Image
            source={require("@/assets/images/common/icon-back.png")}
            style={{ width: 24, height: 24 }}
          />
        </TouchableOpacity>
        <View style={styles.mainContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{t("form.forgot.title")}</Text>
            <Text style={styles.subtitle}>{t("form.forgot.subtitle")}</Text>
          </View>
          <View style={styles.inputGroup}>
            <InputField
              control={control}
              name="email"
              placeholder={t("form.email.placeholder")}
              errors={errors}
              returnKeyType="next"
              blurOnSubmit={false}
              containerStyle={styles.inputContainer}
              inputStyle={styles.input}
            />
          </View>
          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            style={[
              styles.submitButton,
              (isLoading || !watch("email")) && {
                opacity: 0.5,
              },
            ]}
            contentStyle={styles.submitButtonContent}
            labelStyle={styles.submitButtonText}
            loading={isLoading}
            disabled={isLoading || !watch("email")}
          >
            {isLoading ? t("common.loading") : t("form.forgot.button")}
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
    color: "#515C66",
    lineHeight: 20,
  },
  inputGroup: {
    marginTop: 12,
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
  },
  input: {
    flex: 1,
    fontSize: 14,
    ...createFontStyle("500"),
    color: "#0C0A09",
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
});
