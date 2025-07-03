import { createFontStyle } from "@/utils/typography";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  TextInput,
  TextInputKeyPressEventData,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ChatInputProps {
  onSend: (message: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

export default function ChatInput({
  onSend,
  loading,
  disabled,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const handleSend = () => {
    if (message.trim() && !loading && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) => {
    if (e.nativeEvent.key === "Enter") {
      // handleSend();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={"padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      style={[styles.container, { marginBottom: insets.bottom }]}
    >
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, disabled && styles.inputDisabled]}
          placeholder={t("chat.input.placeholder")}
          placeholderTextColor="#A9AEB8"
          value={message}
          onChangeText={setMessage}
          returnKeyType="send"
          onKeyPress={handleKeyPress}
          onSubmitEditing={handleSend}
          editable={!disabled}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            loading || !message.trim() || disabled ? { opacity: 0.5 } : null,
          ]}
          onPress={handleSend}
          disabled={!message.trim() || loading || disabled}
        >
          <Image
            source={require("@/assets/images/chat/send.png")}
            style={styles.sendIcon}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#F5F7FA",
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  input: {
    flex: 1,
    fontSize: 14,
    lineHeight: 17,
    ...createFontStyle("500"),
    color: "#0C0A09",
    padding: 0,
    outlineWidth: 0,
    height: 18,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  sendButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    borderRadius: 16,
  },
  sendButtonActive: {
    backgroundColor: "#19DBF2",
  },
  sendIcon: {
    width: 32,
    height: 32,
  },
});
