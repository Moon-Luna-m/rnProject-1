import { createFontStyle } from "@/utils/typography";
import React, { createContext, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface CategoryModalContextType {
  showModal: (
    categories: Array<{ key: string; title: string }>,
    activeIndex: number
  ) => void;
  hideModal: () => void;
  onSelect: (key: string) => void;
  setOnSelect: (callback: (key: string) => void) => void;
}

const CategoryModalContext = createContext<CategoryModalContextType>({
  showModal: () => {},
  hideModal: () => {},
  onSelect: () => {},
  setOnSelect: () => {},
});

export const useCategoryModal = () => useContext(CategoryModalContext);

export const CategoryModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [categories, setCategories] = useState<
    Array<{ key: string; title: string }>
  >([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectCallback, setSelectCallback] = useState<(key: string) => void>(
    () => () => {}
  );
  const modalAnimation = useSharedValue(0);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const showModal = (
    newCategories: Array<{ key: string; title: string }>,
    newActiveIndex: number
  ) => {
    setCategories(newCategories);
    setActiveIndex(newActiveIndex);
    setIsVisible(true);
    modalAnimation.value = withSpring(1, {
      damping: 15,
      stiffness: 90,
    });
  };

  const hideModal = () => {
    modalAnimation.value = withSpring(0, {
      damping: 15,
      stiffness: 90,
    });
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: modalAnimation.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          modalAnimation.value,
          [0, 1],
          [-300, 0],
          Extrapolation.CLAMP
        ),
      },
    ],
    opacity: modalAnimation.value,
  }));

  const handleSelect = (key: string) => {
    selectCallback(key);
    hideModal();
  };

  return (
    <CategoryModalContext.Provider
      value={{
        showModal,
        hideModal,
        onSelect: selectCallback,
        setOnSelect: (callback) => {
          runOnJS(setSelectCallback)(() => callback);
        },
      }}
    >
      {children}
      {isVisible && (
        <View style={[StyleSheet.absoluteFill, styles.modalWrapper]}>
          <Animated.View style={[styles.overlay, overlayStyle]}>
            <TouchableOpacity
              style={styles.overlayTouch}
              activeOpacity={1}
              onPress={hideModal}
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.expandPanel,
              modalStyle,
              {
                paddingTop: Platform.OS === "android" ? insets.top : insets.top,
              },
            ]}
          >
            <View style={styles.expandHeader}>
              <Text style={styles.expandTitle}>
                {t("common.allCategories")}
              </Text>
              <TouchableOpacity
                style={styles.expandButton}
                onPress={hideModal}
                activeOpacity={0.7}
              >
                <Image
                  source={require("@/assets/images/login/icon-arrow.png")}
                  style={{
                    width: 24,
                    height: 24,
                    transform: [{ rotate: "180deg" }],
                  }}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.categoryListWrapper}>
              <View style={styles.categoryList}>
                {categories.map((category, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <TouchableOpacity
                      key={category.key}
                      style={[
                        styles.categoryItem,
                        isActive && styles.categoryItemActive,
                      ]}
                      onPress={() => handleSelect(category.key)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          isActive && styles.categoryTextActive,
                        ]}
                      >
                        {category.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </Animated.View>
        </View>
      )}
    </CategoryModalContext.Provider>
  );
};

const styles = StyleSheet.create({
  modalWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  overlayTouch: {
    width: "100%",
    height: "100%",
  },
  expandPanel: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#F5F7FA",
    maxHeight: "80%",
  },
  expandHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    height: 44,
  },
  expandTitle: {
    fontSize: 16,
    ...createFontStyle("600"),
    color: "#0C0A09",
  },
  expandButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryListWrapper: {
    maxHeight: Dimensions.get("window").height * 0.6,
  },
  categoryList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    padding: 10,
    paddingVertical: 20,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  categoryItemActive: {
    backgroundColor: "#19DBF2",
  },
  categoryText: {
    fontSize: 14,
    color: "#72818F",
  },
  categoryTextActive: {
    color: "#fff",
    ...createFontStyle("600"),
  },
});
