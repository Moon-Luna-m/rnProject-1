import React, { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import BottomSheetToast from "./BottomSheetToast";

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  containerStyle?: ViewStyle;
  initialY?: number;
  toast?: {
    message?: string;
    visible: boolean;
    type?: "success" | "error" | "warning" | "info" | "loading";
    duration?: number | null;
    onDismiss: () => void;
  };
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  containerStyle,
  initialY = 1000,
  toast,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(initialY);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animateIn = () => {
    setModalVisible(true);
    opacity.value = withTiming(1, { duration: 300 });
    translateY.value = withTiming(0, {
      duration: 350,
    });
  };

  const animateOut = (callback?: () => void) => {
    opacity.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(
      initialY,
      {
        duration: 200,
      },
      (finished) => {
        if (finished) {
          runOnJS(setModalVisible)(false);
          callback && runOnJS(callback)();
        }
      }
    );
  };

  useEffect(() => {
    if (visible) {
      animateIn();
    } else {
      handleClose();
    }
  }, [visible]);

  const handleClose = () => {
    animateOut(onClose);
  };

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      {toast?.visible ? <View style={styles.toastOverlay}></View> : null}
      <Animated.View
        style={[
          styles.overlay,
          {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
          overlayStyle,
        ]}
      >
        <TouchableOpacity
          style={[styles.overlay, { backgroundColor: "transparent" }]}
          activeOpacity={1}
          onPress={handleClose}
        >
          <BottomSheetToast
            message={toast?.message}
            visible={toast?.visible || false}
            type={toast?.type || "info"}
            duration={toast?.duration || 3000}
            onDismiss={toast?.onDismiss}
          />
          <Animated.View style={[styles.content, containerStyle, modalStyle]}>
            <TouchableOpacity
              activeOpacity={1}
            >
              {children}
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  toastOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
    marginBottom: 40,
    marginHorizontal: 16,
  },
});
