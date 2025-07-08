import { createFontStyle } from "@/utils/typography";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const windowWidth = Dimensions.get("window").width;

interface EmotionOption {
  id: string;
  content: string;
  size?: number;
  position?: {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
  };
}

interface EmotionChoiceProps {
  question: string;
  description: string;
  options: EmotionOption[];
  selectedEmotion?: string | null;
  onSelect?: (value: string) => void;
}

// 默认布局配置
const DEFAULT_LAYOUTS = [
  { size: 120, position: { top: 20, left: 13 } },
  { size: 100, position: { top: 195, left: 33 } },
  { size: 100, position: { top: 175, right: 55 } },
  { size: 99, position: { top: 10, right: 49 } },
  { size: 80, position: { top: 113, left: 133 } },
  { size: 60, position: { top: 95, right: -5 } },
];

export const EmotionChoice: React.FC<EmotionChoiceProps> = ({
  question,
  description,
  options,
  selectedEmotion,
  onSelect,
}) => {
  // 将选项与默认布局配置合并
  const emotionsWithLayout = options.map((option, index) => ({
    ...option,
    size: option.size || DEFAULT_LAYOUTS[index % DEFAULT_LAYOUTS.length].size,
    position:
      option.position ||
      DEFAULT_LAYOUTS[index % DEFAULT_LAYOUTS.length].position,
  }));

  return (
    <View>
      <Text style={styles.question}>{question}</Text>
      <View style={styles.emotionsContainer}>
        {emotionsWithLayout.map((emotion) => (
          <TouchableOpacity
            key={emotion.id}
            style={[
              styles.emotionButton,
              {
                width: emotion.size,
                height: emotion.size,
                ...emotion.position,
              },
              selectedEmotion === emotion.id && styles.selectedEmotion,
            ]}
            activeOpacity={0.7}
            onPress={() => onSelect?.(emotion.id)}
          >
            <Text
              style={[
                styles.emotionText,
                {
                  fontSize:
                    emotion.size <= 60 ? 9 : emotion.size <= 80 ? 12 : 14,
                },
                selectedEmotion === emotion.id && styles.selectedEmotionText,
              ]}
            >
              {emotion.content}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  question: {
    ...createFontStyle("600"),
    fontSize: 18,
    color: "#0C0A09",
    textTransform: "capitalize",
  },
  emotionsContainer: {
    width: "100%",
    height: 320,
    alignSelf: "center",
    marginTop: 16,
  },
  emotionButton: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedEmotion: {
    backgroundColor: "rgba(25, 219, 242, 0.12)",
    borderWidth: 2,
    borderColor: "#19DBF2",
  },
  emotionText: {
    ...createFontStyle("700"),
    color: "#7F909F",
    textTransform: "capitalize",
  },
  selectedEmotionText: {
    color: "#0C0A09",
  },
});
