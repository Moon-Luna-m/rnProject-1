import { createFontStyle } from "@/utils/typography";
import { Ionicons } from "@expo/vector-icons";
import { CameraType, CameraView, FlashMode } from "expo-camera";
import { Image } from "expo-image";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CROP_SIZE = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) * 0.8; // 80% 屏幕宽高的正方形

interface Props {
  onClose: () => void;
  onCapture: (uri: string) => void;
}

export default function CustomCamera({ onClose, onCapture }: Props) {
  const { t } = useTranslation();
  const cameraRef = useRef<CameraView>(null);
  const insets = useSafeAreaInsets();

  const [type, setType] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const [photo, setPhoto] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  // 动画值
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const context = useSharedValue({ x: 0, y: 0, scale: 1 });
  const initialScale = useSharedValue(1);
  const cropSize = useSharedValue(CROP_SIZE);

  // 聚焦动画值
  const focusAnimation = {
    scale: useSharedValue(0),
    opacity: useSharedValue(0),
    x: useSharedValue(0),
    y: useSharedValue(0),
  };

  // 聚焦动画样式
  const focusSquareStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: focusAnimation.scale.value }],
      opacity: focusAnimation.opacity.value,
      left: focusAnimation.x.value - 25,
      top: focusAnimation.y.value - 25,
    };
  });

  // 初始化编辑状态
  const initializeEditState = (imageWidth: number, imageHeight: number) => {
    "worklet";
    // 计算图片适应屏幕的缩放比例
    const screenRatio = SCREEN_WIDTH / SCREEN_HEIGHT;
    const imageRatio = imageWidth / imageHeight;

    let initialScaleValue = 1;

    if (imageRatio > screenRatio) {
      // 图片更宽，以高度为准
      initialScaleValue = SCREEN_HEIGHT / imageHeight;
    } else {
      // 图片更高，以宽度为准
      initialScaleValue = SCREEN_WIDTH / imageWidth;
    }

    // 确保初始缩放至少能覆盖裁剪区域
    const minScaleX = CROP_SIZE / SCREEN_WIDTH;
    const minScaleY = CROP_SIZE / SCREEN_HEIGHT;
    const requiredScale = Math.max(minScaleX, minScaleY);
    initialScaleValue = Math.max(initialScaleValue, requiredScale);

    // 重置所有动画值
    scale.value = initialScaleValue;
    savedScale.value = initialScaleValue;
    initialScale.value = initialScaleValue;

    translateX.value = 0;
    translateY.value = 0;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;

    context.value = {
      x: 0,
      y: 0,
      scale: initialScaleValue,
    };
  };

  // 动画配置
  const springConfig = {
    mass: 0.3,
    damping: 10,
    stiffness: 150,
    overshootClamping: true,
    restDisplacementThreshold: 0.05,
    restSpeedThreshold: 5,
  };

  // 获取边界安全值
  const getBoundedValue = (value: number, min: number, max: number) => {
    "worklet";
    return Math.min(Math.max(value, min), max);
  };

  // 检查并修正边界
  const checkBoundaries = () => {
    const scaledWidth = SCREEN_WIDTH * scale.value;
    const scaledHeight = SCREEN_HEIGHT * scale.value;
    const maxOffsetX = (scaledWidth - CROP_SIZE) / 2;
    const maxOffsetY = (scaledHeight - CROP_SIZE) / 2;

    // 计算最小缩放比例
    const minScaleX = CROP_SIZE / SCREEN_WIDTH;
    const minScaleY = CROP_SIZE / SCREEN_HEIGHT;
    const requiredScale = Math.max(minScaleX, minScaleY);

    // 批量更新动画值
    if (scale.value < requiredScale) {
      scale.value = withSpring(requiredScale, springConfig);
      savedScale.value = requiredScale;
      initialScale.value = requiredScale;
    }

    if (Math.abs(translateX.value) > maxOffsetX) {
      translateX.value = withSpring(
        getBoundedValue(translateX.value, -maxOffsetX, maxOffsetX),
        springConfig
      );
      savedTranslateX.value = translateX.value;
    }

    if (Math.abs(translateY.value) > maxOffsetY) {
      translateY.value = withSpring(
        getBoundedValue(translateY.value, -maxOffsetY, maxOffsetY),
        springConfig
      );
      savedTranslateY.value = translateY.value;
    }
  };

  // 图片手势
  const panGesture = Gesture.Pan()
    .minDistance(0)
    .onStart(() => {
      context.value = {
        x: translateX.value,
        y: translateY.value,
        scale: scale.value,
      };
    })
    .onUpdate((e) => {
      // 直接更新值，不做边界检查
      translateX.value = e.translationX + context.value.x;
      translateY.value = e.translationY + context.value.y;
    })
    .onFinalize(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
      runOnJS(checkBoundaries)();
    });

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      context.value = {
        x: translateX.value,
        y: translateY.value,
        scale: scale.value,
      };
    })
    .onUpdate((e) => {
      const minScaleX = CROP_SIZE / SCREEN_WIDTH;
      const minScaleY = CROP_SIZE / SCREEN_HEIGHT;
      const minScale = Math.max(minScaleX, minScaleY);
      const maxScale = minScale * 3;

      // 直接更新缩放值
      scale.value = getBoundedValue(
        context.value.scale * e.scale,
        minScale,
        maxScale
      );
    })
    .onFinalize(() => {
      savedScale.value = scale.value;
      runOnJS(checkBoundaries)();
    });

  const composedImageGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  // 动画样式
  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handleConfirm = async () => {
    if (photo) {
      try {
        // 1. 获取原始图片和显示相关的参数
        const imageRatio = imageSize.width / imageSize.height;
        const screenRatio = SCREEN_WIDTH / SCREEN_HEIGHT;

        // 2. 计算图片在屏幕上的初始显示尺寸
        let displayWidth, displayHeight;
        if (imageRatio > screenRatio) {
          displayWidth = SCREEN_WIDTH;
          displayHeight = SCREEN_WIDTH / imageRatio;
        } else {
          displayHeight = SCREEN_HEIGHT;
          displayWidth = SCREEN_HEIGHT * imageRatio;
        }

        // 3. 计算裁剪框在屏幕上的中心位置
        const cropFrameCenter = {
          x: SCREEN_WIDTH / 2,
          y: SCREEN_HEIGHT / 2,
        };

        // 4. 计算图片当前缩放后的中心点位置（考虑用户位移）
        const scaledCenterX = SCREEN_WIDTH / 2 + translateX.value;
        const scaledCenterY = SCREEN_HEIGHT / 2 + translateY.value;

        // 5. 计算裁剪框相对于缩放后图片中心的偏移
        const relativeToScaledCenter = {
          x: (cropFrameCenter.x - scaledCenterX) / scale.value,
          y: (cropFrameCenter.y - scaledCenterY) / scale.value,
        };

        // 6. 计算在原图上的裁剪尺寸
        const cropSize = Math.round(
          (CROP_SIZE / scale.value / displayWidth) * imageSize.width
        );

        // 7. 计算在原图上的裁剪起点
        const originX = Math.round(
          imageSize.width / 2 +
            (relativeToScaledCenter.x / displayWidth) * imageSize.width -
            cropSize / 2
        );
        const originY = Math.round(
          imageSize.height / 2 +
            (relativeToScaledCenter.y / displayHeight) * imageSize.height -
            cropSize / 2
        );

        // 8. 确保裁剪区域在图片范围内
        const safeOriginX = Math.max(
          0,
          Math.min(imageSize.width - cropSize, originX)
        );
        const safeOriginY = Math.max(
          0,
          Math.min(imageSize.height - cropSize, originY)
        );

        // 执行裁剪
        const manipResult = await ImageManipulator.manipulate(photo)
          .crop({
            originX: safeOriginX,
            originY: safeOriginY,
            width: cropSize,
            height: cropSize,
          })
          .renderAsync();

        const result = await manipResult.saveAsync({
          compress: 1,
          format: SaveFormat.JPEG,
        });

        onCapture(result.uri);
      } catch (error) {
        console.log("error", error);
      }
    }
  };

  // 重置预览
  const handleRetake = () => {
    setPhoto(null);
  };

  // 切换相机
  const toggleCameraType = () => {
    setType((current) => (current === "back" ? "front" : "back"));
  };

  // 拍照
  const handleCapture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setPhoto(photo.uri);
    }
  };

  // 预览界面
  if (photo) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.previewContainer}>
          <GestureDetector gesture={composedImageGesture}>
            <Animated.View style={[styles.imageWrapper, imageStyle]}>
              <Image
                source={{ uri: photo }}
                style={[
                  styles.fullPreview,
                  { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
                ]}
                contentFit="cover"
                onLoad={(e) => {
                  const newImageSize = {
                    width: e.source.width,
                    height: e.source.height,
                  };
                  setImageSize(newImageSize);
                  runOnJS(initializeEditState)(e.source.width, e.source.height);
                }}
              />
            </Animated.View>
          </GestureDetector>
          <View style={styles.maskContainer}>
            <View style={styles.sideMaskStyle} />
            <View style={{ width: CROP_SIZE }}>
              <View style={styles.bottomMaskStyle} />
              <View
                style={{
                  width: CROP_SIZE,
                  height: CROP_SIZE,
                }}
              >
                <View style={styles.cropGuide} pointerEvents="none" />
                <View style={[styles.cornerHandle, styles.topLeftHandle]} />
                <View style={[styles.cornerHandle, styles.topRightHandle]} />
                <View style={[styles.cornerHandle, styles.bottomLeftHandle]} />
                <View style={[styles.cornerHandle, styles.bottomRightHandle]} />
              </View>
              <View style={styles.topMaskStyle} />
            </View>
            <View style={styles.sideMaskStyle} />
          </View>
        </View>
        <View
          style={{
            ...styles.previewControls,
            paddingBottom: insets.bottom + 40,
          }}
        >
          <TouchableOpacity onPress={handleRetake}>
            <Text style={styles.controlText}>{t("common.cancel")}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleConfirm}>
            <Text style={[styles.controlText]}>{t("common.confirm")}</Text>
          </TouchableOpacity>
        </View>
      </GestureHandlerRootView>
    );
  }

  // 相机界面
  return (
    <View style={styles.container}>
      <View style={styles.cameraWrapper}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={type}
          flash={flash}
        />
      </View>

      {/* 聚焦框 */}
      <Animated.View
        style={[styles.focusSquare, focusSquareStyle]}
        pointerEvents="none"
      >
        <View style={styles.focusSquareInner}>
          <View style={styles.focusSquareLine} />
          <View
            style={[
              styles.focusSquareLine,
              { transform: [{ rotate: "90deg" }] },
            ]}
          />
        </View>
      </Animated.View>

      <View style={styles.cameraOverlay}>
        {/* 顶部工具栏 */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={onClose}>
            <Ionicons name="close" size={40} color="white" />
          </TouchableOpacity>
        </View>

        {/* 底部工具栏 */}
        <View
          style={{
            ...styles.footer,
            height: insets.bottom + 130,
            paddingBottom: insets.bottom + 40,
          }}
        >
          <TouchableOpacity
            onPress={() => setFlash(flash === "off" ? "on" : "off")}
          >
            <Ionicons
              name={flash === "off" ? "flash-off-outline" : "flash-outline"}
              size={24}
              color="white"
            />
          </TouchableOpacity>
          <View style={styles.captureButtonContainer}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleCapture}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={toggleCameraType}>
            <Ionicons name="camera-reverse-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "black",
    zIndex: 999,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: "absolute",
    height: "100%",
    width: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 44,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerButtonText: {
    color: "white",
    fontSize: 16,
    ...createFontStyle("600"),
  },
  confirmButton: {
    backgroundColor: "#19DBF2",
  },
  focusFrame: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  focusFrameInner: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  focusText: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    opacity: 0.8,
  },
  footer: {
    marginTop: "auto",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,1)",
    paddingHorizontal: 30,
  },
  footerButton: {
    width: 44,
    height: 44,
  },
  captureButtonContainer: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    marginTop: 10,
  },
  captureButton: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "white",
  },
  previewContainer: {
    position: "relative",
    flex: 1,
    backgroundColor: "black",
  },
  imageWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fullPreview: {
    backgroundColor: "black",
  },
  cropOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  cropGuide: {
    width: "100%",
    height: "100%",
    borderWidth: 0.5,
    borderColor: "white",
    borderStyle: "solid",
  },
  cornerHandle: {
    position: "absolute",
    width: 44,
    height: 44,
    backgroundColor: "transparent",
  },
  topLeftHandle: {
    top: 0,
    left: 0,
    borderLeftWidth: 3,
    borderTopWidth: 3,
    borderColor: "white",
  },
  topRightHandle: {
    top: 0,
    right: 0,
    borderRightWidth: 3,
    borderTopWidth: 3,
    borderColor: "white",
  },
  bottomLeftHandle: {
    bottom: 0,
    left: 0,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderColor: "white",
  },
  bottomRightHandle: {
    bottom: 0,
    right: 0,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    borderColor: "white",
  },
  previewControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "black",
  },
  controlText: {
    fontSize: 17,
    color: "white",
    ...createFontStyle("400"),
  },
  maskContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
    zIndex: 1001,
    flexDirection: "row",
    pointerEvents: "none",
  },
  topMaskStyle: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sideMaskStyle: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  bottomMaskStyle: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  cameraWrapper: {
    flex: 1,
    position: "relative",
  },
  focusSquare: {
    position: "absolute",
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  focusSquareInner: {
    width: "100%",
    height: "100%",
    borderWidth: 1,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  focusSquareLine: {
    position: "absolute",
    width: 20,
    height: 1,
    backgroundColor: "#fff",
  },
});
