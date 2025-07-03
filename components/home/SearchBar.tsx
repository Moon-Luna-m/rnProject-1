import { createFontStyle } from "@/utils/typography";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Keyboard,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  TextInput,
  TextInputSubmitEditingEventData,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import SearchIcon from "./SearchIcon";

export default function SearchBar({
  onSearch,
  disabled = false,
  handlePress,
  autoFocus = false,
  value,
  onChangeText,
  onFocus,
  onBlur,
}: {
  onSearch?: (text: string) => void;
  disabled?: boolean;
  handlePress?: () => void;
  autoFocus?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  const { t } = useTranslation();
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleSearchPress = (
    e: NativeSyntheticEvent<TextInputSubmitEditingEventData>
  ) => {
    if (Platform.OS !== "web") {
      Keyboard.dismiss();
    }
    onSearch?.(e.nativeEvent.text);
  };

  useEffect(() => {
    if (isFocused) {
      onFocus?.();
    } else {
      onBlur?.();
    }
  }, [isFocused]);

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View
        style={[
          styles.container,
          disabled && {
            shadowColor: "#A7A7A7",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 4,
          },
          isFocused && {
            borderWidth: 1,
            borderColor: "#19DBF2",
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <SearchIcon fill={isFocused ? "#19DBF2" : "#72818F"} />
        </View>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={t("home.search.placeholder")}
          placeholderTextColor="#A9AEB8"
          returnKeyType="search"
          onSubmitEditing={handleSearchPress}
          editable={!disabled}
          autoFocus={autoFocus}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: (8),
    paddingHorizontal: (12),
    paddingVertical: (10),
    backgroundColor: "#FFFFFF",
    borderRadius: (40),
    borderWidth: 1,
    borderColor: "transparent",
  },
  iconContainer: {
    width: (24),
    height: (24),
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: (14),
    ...createFontStyle("500"),
    padding: 0,
    outlineWidth: 0,
  },
});
