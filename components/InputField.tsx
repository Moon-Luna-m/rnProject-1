import { createFontStyle } from "@/utils/typography";
import React, { forwardRef } from "react";
import { Controller } from "react-hook-form";
import {
  Image,
  Keyboard,
  KeyboardTypeOptions,
  Platform,
  ReturnKeyTypeOptions,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import ErrorMessage from "./ErrorMessage";

interface InputFieldProps {
  control: any;
  name: string;
  label?: string;
  placeholder: string;
  secureTextEntry?: boolean;
  showPasswordToggle?: boolean;
  errors: any;
  keyboardType?: KeyboardTypeOptions;
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
  blurOnSubmit?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  onFocusChange?: (focused: boolean) => void;
  showArrow?: boolean;
  handleBlur?: () => void;
}

const InputField = forwardRef<TextInput, InputFieldProps>(
  (
    {
      control,
      name,
      label,
      placeholder,
      secureTextEntry = false,
      showPasswordToggle = false,
      errors,
      onSubmitEditing,
      keyboardType = "default",
      returnKeyType = "done",
      blurOnSubmit = false,
      containerStyle,
      inputStyle,
      disabled = false,
      onFocusChange,
      showArrow = false,
      handleBlur,
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(!secureTextEntry);
    const [isFocused, setIsFocused] = React.useState(false);

    const arrowAnimatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          {
            rotate: withTiming(isFocused ? "0deg" : "180deg", {
              duration: 300,
              easing: Easing.bezier(0.4, 0, 0.2, 1),
            }),
          },
        ],
      };
    });

    const handleFocusChange = (focused: boolean) => {
      setIsFocused(focused);
      onFocusChange?.(focused);
    };

    const content = (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View
          style={[
            styles.inputWrapper,
            containerStyle,
            isFocused && styles.inputWrapperFocused,
            errors[name] && styles.inputWrapperError,
          ]}
        >
          <Controller
            control={control}
            name={name}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder={placeholder}
                value={value}
                onChangeText={(text) => {
                  onChange(text);
                }}
                onBlur={() => {
                  handleFocusChange(false);
                  onBlur();
                  handleBlur?.();
                }}
                onFocus={() => {
                  !disabled && handleFocusChange(true);
                }}
                secureTextEntry={!showPassword}
                style={[
                  styles.input,
                  inputStyle,
                  Platform.OS === "web" && ({ outlineWidth: 0 } as any),
                ]}
                placeholderTextColor="#A9AEB8"
                keyboardType={keyboardType}
                returnKeyType={returnKeyType}
                onSubmitEditing={onSubmitEditing}
                enablesReturnKeyAutomatically={true}
                autoCapitalize={name === "email" ? "none" : "sentences"}
                autoComplete={
                  name === "email"
                    ? "email"
                    : name === "password"
                    ? "password"
                    : "off"
                }
                editable={!disabled}
                autoCorrect={false}
              />
            )}
          />
          {showPasswordToggle && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIconContainer}
            >
              <Image
                source={
                  showPassword
                    ? require("@/assets/images/login/icon-open.png")
                    : require("@/assets/images/login/icon-close.png")
                }
                style={{ width: 24, height: 24 }}
              />
            </TouchableOpacity>
          )}
          {showArrow && (
            <Animated.View
              style={[styles.eyeIconContainer, arrowAnimatedStyle]}
            >
              <Image
                source={require("@/assets/images/login/icon-arrow.png")}
                style={{ width: 24, height: 24 }}
              />
            </Animated.View>
          )}
        </View>
        <View style={styles.errorContainer}>
          <ErrorMessage
            message={errors[name]?.message}
            visible={!!errors[name]}
          />
        </View>
      </View>
    );

    // 在 Web 平台直接返回内容，在其他平台使用 TouchableWithoutFeedback
    return Platform.OS === "web" ? (
      content
    ) : (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        {content}
      </TouchableWithoutFeedback>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    minHeight: 80, // 预留错误信息的空间
  },
  label: {
    fontSize: 16,
    ...createFontStyle("600"),
    color: "#0C0A09",
    marginBottom: 8,
  },
  inputWrapper: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: "#FFFFFF",
  },
  inputWrapperFocused: {
    borderColor: "#19DBF2",
  },
  inputWrapperError: {
    borderColor: "#EB5735",
  },
  input: {
    flex: 1,
    height: 28,
    fontSize: 14,
    ...createFontStyle("500"),
    color: "#0C0A09",
    padding: 0,
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeIconContainer: {
    marginLeft: 8,
    padding: 0,
  },
  errorContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 40,
    marginTop: 4,
  },
});

export default InputField;
