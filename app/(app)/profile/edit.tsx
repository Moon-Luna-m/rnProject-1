import CustomCamera from "@/components/CustomCamera";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { DatePicker } from "@/components/ui/DatePicker";
import { userService } from "@/services/userService";
import { selectUserInfo, setUserInfo } from "@/store/slices/userSlice";
import { formatDate, generateBlurhash, imgProxy } from "@/utils/common";
import { createFontStyle } from "@/utils/typography";
import { Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image as ImageExpo } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  Keyboard,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";

type Gender = "male" | "female" | "";

const sexToGender = (sex?: number): Gender => {
  switch (sex) {
    case 1:
      return "male";
    case 2:
      return "female";
    default:
      return "female";
  }
};

const genderToSex = (gender: Gender): number => {
  switch (gender) {
    case "male":
      return 1;
    case "female":
      return 2;
    default:
      return 0;
  }
};

export default function Edit() {
  const userInfo = useSelector(selectUserInfo);
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempGender, setTempGender] = useState<Gender>(
    sexToGender(userInfo?.sex)
  );
  const [birthday, setBirthday] = useState<Date | undefined>(
    userInfo?.birthday ? new Date(userInfo.birthday) : undefined
  );
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [openCamera, setOpenCamera] = useState(false);
  const dispatch = useDispatch();

  const initialGender = useMemo(
    () => sexToGender(userInfo?.sex),
    [userInfo?.sex]
  );
  const [selectedGender, setSelectedGender] = useState<Gender>(initialGender);

  const formSchema = z.object({
    username: z.string().min(1, { message: t("form.username.required") }),
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
      username: "",
    },
    mode: "onBlur",
    reValidateMode: "onBlur",
  });

  const onSubmitUsername = async (data: FormData) => {
    try {
      // 如果值没有改变，不需要提交
      if (data.username === userInfo?.username) {
        return;
      }
      const res = await userService.updateInfo({
        ...userInfo!,
        username: data.username,
      });
      if (res.code === 200) {
        dispatch(setUserInfo({ ...userInfo!, username: data.username }));
      }
      setValue("username", "");
    } catch (error) {
      console.error("error", error);
    }
  };

  const handleBlur = useCallback(
    (onBlur: () => void, value: string) => {
      return async () => {
        setIsFocused(false);
        onBlur();

        // 如果失焦时值为空，恢复为初始值
        if (!value.trim()) {
          setValue("username", "");
          return;
        }

        // 如果值没有变化，不需要提交
        if (value.trim() === userInfo?.username) {
          return;
        }

        // 提交表单
        await handleSubmit(onSubmitUsername)();
      };
    },
    [userInfo?.username, handleSubmit, onSubmitUsername]
  );

  const handleGenderSelect = async (gender: Gender) => {
    setTempGender(gender);
  };

  const handleGenderConfirm = async () => {
    try {
      const newSex = genderToSex(tempGender);
      // 如果值没有变化，不需要提交
      if (newSex === userInfo?.sex) {
        setShowGenderModal(false);
        return;
      }

      // TODO: 调用更新性别的 API
      const res = await userService.updateInfo({
        ...userInfo!,
        sex: newSex,
      });
      if (res.code === 200) {
        dispatch(setUserInfo({ ...userInfo!, sex: newSex }));
      }
      setSelectedGender(tempGender);
      setShowGenderModal(false);
    } catch (error) {
      console.error("error", error);
    }
  };

  const handleDateChange = async (date: Date) => {
    try {
      const res = await userService.updateInfo({
        ...userInfo!,
        birthday: formatDate(date, ""),
      });
      if (res.code === 200) {
        dispatch(
          setUserInfo({
            ...userInfo!,
            birthday: formatDate(date, ""),
          })
        );
        setBirthday(date);
      }
      setShowDatePicker(false);
    } catch (error) {
      console.error("error", error);
    }
  };

  // 处理头像选择
  const handleAvatarSelect = useCallback(async () => {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const formData = new FormData();
          formData.append("file", file);
          const res = await userService.uploadAvatar(formData);
          if (res.code === 200) {
            dispatch(setUserInfo({ ...userInfo!, avatar: res.data.url }));
          }
        }
      };
      input.click();
    } else {
      setShowAvatarModal(true);
    }
  }, []);

  const handleUploadAvatar = useCallback(async (uri: string) => {
    const formData = new FormData();
    formData.append("file", {
      uri,
      name: "avatar.jpg",
      type: "image/jpeg",
    } as any);
    const res = await userService.uploadAvatar(formData);
    if (res.code === 200) {
      dispatch(setUserInfo({ ...userInfo!, avatar: res.data.url }));
    }
  }, []);

  // 打开相机
  const handleOpenCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("common.camera.permissionDenied"),
        t("common.camera.permissionMessage"),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("common.settings"),
            onPress: () => {
              if (Platform.OS === "ios") {
                Linking.openURL("app-settings:");
              } else {
                Linking.openSettings();
              }
            },
          },
        ]
      );
      return;
    }
    setShowAvatarModal(false);
    setOpenCamera(true);
  }, [t]);

  // 处理拍照完成
  const handleCapture = useCallback((uri: string) => {
    handleUploadAvatar(uri);
    setOpenCamera(false);
  }, []);

  // 打开图库
  const handleOpenGallery = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("common.gallery.permissionDenied"),
        t("common.gallery.permissionMessage"),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("common.settings"),
            onPress: () => {
              if (Platform.OS === "ios") {
                Linking.openURL("app-settings:");
              } else {
                Linking.openSettings();
              }
            },
          },
        ]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      handleUploadAvatar(result.assets[0].uri);
    }
    setShowAvatarModal(false);
  }, [t]);

  // 处理点击外部
  const handlePressOutside = () => {
    if (Platform.OS !== "web") {
      Keyboard.dismiss();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
        <Text style={styles.backText}>{t("common.dataEditing")}</Text>
      </TouchableOpacity>
      {openCamera && (
        <CustomCamera
          onClose={() => setOpenCamera(false)}
          onCapture={handleCapture}
        />
      )}
      <TouchableWithoutFeedback onPress={handlePressOutside}>
        <View style={styles.content}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity
              style={styles.avatarWrapper}
              activeOpacity={0.8}
              onPress={handleAvatarSelect}
            >
              <ImageExpo
                source={imgProxy(userInfo?.avatar)}
                style={styles.avatar}
                contentFit="cover"
                placeholder={{ blurhash: generateBlurhash() }}
              />
              <View style={styles.editButton}>
                <Image
                  source={require("@/assets/images/profile/edit/photo.png")}
                  fadeDuration={0}
                  style={styles.editIcon}
                />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>{t("profile.changeName")}</Text>
            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, isFocused && styles.inputFocused]}
                    onBlur={handleBlur(onBlur, value)}
                    onFocus={() => setIsFocused(true)}
                    onChangeText={onChange}
                    value={value}
                    placeholder={userInfo?.username}
                    placeholderTextColor="#A9AEB8"
                    returnKeyType="done"
                  />
                </View>
              )}
            />
          </View>

          <GenderSelector
            selectedGender={selectedGender}
            tempGender={tempGender}
            showGenderModal={showGenderModal}
            setShowGenderModal={setShowGenderModal}
            handleGenderSelect={handleGenderSelect}
            handleGenderConfirm={handleGenderConfirm}
          />

          <BirthdaySelector
            birthday={birthday}
            showDatePicker={showDatePicker}
            setShowDatePicker={setShowDatePicker}
            handleDateChange={handleDateChange}
          />
        </View>
      </TouchableWithoutFeedback>

      {/* 头像选择模态框 */}
      {Platform.OS !== "web" && (
        <BottomSheet
          visible={showAvatarModal}
          onClose={() => setShowAvatarModal(false)}
          containerStyle={{ height: 288 }}
          initialY={500}
        >
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHeader}>
              <View style={styles.indicator} />
            </View>

            <View style={styles.sheetContent}>
              <Text style={styles.sheetTitle}>{t("common.avatar.title")}</Text>

              <View style={styles.avatarOptionsContainer}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.avatarOption}
                  onPress={handleOpenCamera}
                >
                  <Text style={styles.avatarOptionText}>
                    {t("common.avatar.camera")}
                  </Text>
                  <Image
                    source={require("@/assets/images/profile/icon-arrow-right.png")}
                    style={{
                      width: 24,
                      height: 24,
                      position: "absolute",
                      right: 12,
                    }}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.avatarOption}
                  onPress={handleOpenGallery}
                >
                  <Text style={styles.avatarOptionText}>
                    {t("common.avatar.gallery")}
                  </Text>
                  <Image
                    source={require("@/assets/images/profile/icon-arrow-right.png")}
                    style={{
                      width: 24,
                      height: 24,
                      position: "absolute",
                      right: 12,
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Button
              mode="outlined"
              style={styles.cancelButton}
              contentStyle={styles.submitButtonContent}
              labelStyle={styles.cancelButtonText}
              onPress={() => setShowAvatarModal(false)}
              rippleColor="rgba(0,0,0,0.03)"
            >
              {t("common.cancel")}
            </Button>
          </View>
        </BottomSheet>
      )}
    </SafeAreaView>
  );
}

function GenderSelector({
  selectedGender,
  tempGender,
  showGenderModal,
  setShowGenderModal,
  handleGenderSelect,
  handleGenderConfirm,
}: {
  selectedGender: Gender;
  tempGender: Gender;
  showGenderModal: boolean;
  setShowGenderModal: (show: boolean) => void;
  handleGenderSelect: (gender: Gender) => void;
  handleGenderConfirm: () => void;
}) {
  const { t } = useTranslation();
  const userInfo = useSelector(selectUserInfo);
  return (
    <>
      <View style={styles.formSection}>
        <Text style={styles.formLabel}>{t("profile.genderSelection")}</Text>
        <TouchableWithoutFeedback
          onPress={() => {
            handleGenderSelect(sexToGender(userInfo?.sex));
            setShowGenderModal(true);
          }}
        >
          <View style={styles.genderSelector}>
            <Text style={[styles.genderText]}>
              {selectedGender
                ? t(`gender.${selectedGender}`)
                : t("gender.placeholder")}
            </Text>
            <Image
              source={require("@/assets/images/login/icon-arrow.png")}
              style={{
                width: 24,
                height: 24,
                transform: [{ rotate: "180deg" }],
              }}
            />
          </View>
        </TouchableWithoutFeedback>
      </View>

      <BottomSheet
        visible={showGenderModal}
        onClose={() => setShowGenderModal(false)}
        containerStyle={{ height: 220 }}
        initialY={500}
      >
        <View style={styles.sheetContainer}>
          <View style={styles.sheetHeader}>
            <View style={styles.indicator} />
          </View>

          <View style={styles.sheetContent}>
            <Text style={styles.sheetTitle}>{t("profile.selectGender")}</Text>

            <View style={styles.optionsContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.genderOption,
                  tempGender === "male" && styles.genderOptionSelected,
                ]}
                onPress={() => handleGenderSelect("male")}
              >
                <Ionicons name="male" size={20} color="#1989F2" />
                <Text
                  style={[
                    styles.genderOptionText,
                    tempGender === "male" && styles.genderOptionTextSelected,
                  ]}
                >
                  {t("gender.male")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.genderOption,
                  tempGender === "female" && styles.genderOptionSelected,
                ]}
                onPress={() => handleGenderSelect("female")}
              >
                <SimpleLineIcons
                  name="symbol-female"
                  size={20}
                  color="#ED3ADE"
                />
                <Text
                  style={[
                    styles.genderOptionText,
                    tempGender === "female" && styles.genderOptionTextSelected,
                  ]}
                >
                  {t("gender.female")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Button
            mode="contained"
            style={styles.submitButton}
            contentStyle={styles.submitButtonContent}
            labelStyle={styles.confirmButtonText}
            onPress={handleGenderConfirm}
          >
            {t("common.confirm")}
          </Button>
        </View>
      </BottomSheet>
    </>
  );
}

function BirthdaySelector({
  birthday,
  showDatePicker,
  setShowDatePicker,
  handleDateChange,
}: {
  birthday: Date | undefined;
  showDatePicker: boolean;
  setShowDatePicker: (show: boolean) => void;
  handleDateChange: (date: Date) => void;
}) {
  const { t } = useTranslation();

  return (
    <>
      <View style={styles.formSection}>
        <Text style={styles.formLabel}>{t("profile.birthday")}</Text>
        <TouchableWithoutFeedback onPress={() => setShowDatePicker(true)}>
          <View style={styles.dateSelector}>
            <Text style={[styles.dateText]}>
              {birthday
                ? formatDate(birthday)
                : t("profile.birthdayPlaceholder")}
            </Text>
            <Image
              source={require("@/assets/images/login/icon-arrow.png")}
              style={{
                width: 24,
                height: 24,
                transform: [{ rotate: "180deg" }],
              }}
            />
          </View>
        </TouchableWithoutFeedback>
      </View>

      <DatePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        value={birthday}
        onChange={handleDateChange}
        mode="date"
        title={t("profile.selectBirthday")}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  backContainer: {
    position: "relative",
    height: 44,
    width: "100%",
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  backText: {
    position: "absolute",
    inset: 0,
    textAlign: "center",
    paddingVertical: 10,
    fontSize: 18,
    color: "#0C0A09",
    ...createFontStyle("700"),
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 24,
  },
  avatarWrapper: {
    position: "relative",
    width: 72,
    height: 72,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 36,
    borderWidth: 2.25,
    borderColor: "#FFFFFF",
  },
  editButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
  },
  editIcon: {
    width: 24,
    height: 24,
  },
  formSection: {
    gap: 8,
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    lineHeight: 18,
    ...createFontStyle("600"),
    color: "#0C0A09",
  },
  inputContainer: {
    width: "100%",
  },
  input: {
    height: 44,
    backgroundColor: "#FFFFFF",
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "transparent",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    ...createFontStyle("500"),
    color: "#0C0A09",
    outlineWidth: 0,
  },
  inputFocused: {
    borderColor: "#19DBF2",
  },
  genderSelector: {
    height: 44,
    backgroundColor: "#FFFFFF",
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  genderText: {
    fontSize: 14,
    ...createFontStyle("500"),
    color: "#A9AEB8",
  },
  arrowIcon: {
    width: 24,
    height: 24,
  },
  sheetContainer: {
    height: "100%",
    paddingHorizontal: 16,
  },
  sheetHeader: {
    alignItems: "center",
    paddingBottom: 16,
  },
  indicator: {
    width: 48,
    height: 5,
    backgroundColor: "#F3F4F6",
    borderRadius: 50,
  },
  sheetContent: {
    alignItems: "center",
    gap: 32,
  },
  sheetTitle: {
    fontSize: 16,
    lineHeight: 19,
    ...createFontStyle("700"),
    color: "#0C0A09",
    letterSpacing: 0.16,
  },
  optionsContainer: {
    flexDirection: "row",
    gap: 24,
    width: "100%",
  },
  genderOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: "#F5F7FA",
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "transparent",
  },
  genderOptionSelected: {
    borderColor: "#19DBF2",
  },
  genderOptionText: {
    fontSize: 14,
    lineHeight: 18,
    ...createFontStyle("500"),
    color: "#0C0A09",
  },
  genderOptionTextSelected: {
    color: "#19DBF2",
  },
  submitButton: {
    marginTop: 24,
    borderRadius: 78,
    backgroundColor: "#19DBF2",
  },
  submitButtonContent: {
    height: 48,
  },
  confirmButtonText: {
    fontSize: 16,
    ...createFontStyle("600"),
    color: "#FFFFFF",
    textTransform: "capitalize",
  },
  dateSelector: {
    height: 44,
    backgroundColor: "#FFFFFF",
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: {
    fontSize: 14,
    lineHeight: 18,
    ...createFontStyle("500"),
    color: "#A9AEB8",
  },
  avatarOptionsContainer: {
    gap: 12,
    width: "100%",
  },
  avatarOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#F5F7FA",
    borderRadius: 40,
  },
  avatarOptionText: {
    fontSize: 14,
    lineHeight: 18,
    ...createFontStyle("500"),
    color: "#0C0A09",
  },
  cancelButton: {
    marginTop: 24,
    borderRadius: 78,
    borderColor: "#19DBF2",
  },
  cancelButtonText: {
    fontSize: 16,
    ...createFontStyle("600"),
    color: "#19DBF2",
    textTransform: "capitalize",
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    ...createFontStyle("bold"),
    color: "white",
  },
});
