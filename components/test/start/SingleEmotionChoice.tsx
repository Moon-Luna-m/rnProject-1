import { createFontStyle } from "@/utils/typography";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface EmotionOption {
  id: string;
  content: string;
  imgUrl: string;
}

interface SingleEmotionChoiceProps {
  question: string;
  description: string;
  options: EmotionOption[];
  selectedEmotion?: string | null;
  onSelect?: (value: string) => void;
}

export const SingleEmotionChoice: React.FC<SingleEmotionChoiceProps> = ({
  question,
  description,
  options,
  selectedEmotion,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.question}>{question}</Text>
      </View>

      <View style={styles.emotionsContainer}>
        {options.map((emotion) => (
          <View key={emotion.id} style={styles.emotionButtonContainer}>
            <TouchableOpacity
              style={[
                styles.emotionButton,
                selectedEmotion === emotion.id && styles.selectedEmotion,
              ]}
              activeOpacity={0.7}
              onPress={() => onSelect?.(emotion.id)}
            >
              <View
                style={[
                  styles.emotionImageContainer,
                  {
                    backgroundColor:
                      selectedEmotion === emotion.id ? "#fff" : "#E4EBF0",
                  },
                ]}
              >
                <Image
                  source={{ uri: emotion.imgUrl }}
                  style={styles.emotionImage}
                  resizeMode="cover"
                />
              </View>
              <Text
                style={[
                  styles.emotionText,
                  selectedEmotion === emotion.id && styles.selectedEmotionText,
                ]}
              >
                {emotion.content}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  question: {
    fontSize: 18,
    ...createFontStyle("700"),
    color: "#0C0A09",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#72818F",
    marginBottom: 24,
    ...createFontStyle("400"),
  },
  content: {
    marginBottom: 32,
  },
  emotionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  emotionButtonContainer: {
    width: `${100 / 3}%`,
    aspectRatio: 1,
    padding: 6,
  },
  emotionButton: {
    width: "100%",
    height: "100%",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  selectedEmotion: {
    backgroundColor: "#19DBF2",
  },
  emotionImageContainer: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
    overflow: "hidden",
  },
  emotionImage: {
    width: "100%",
    height: "100%",
  },
  emotionText: {
    fontSize: 14,
    ...createFontStyle("600"),
    color: "#72818F",
    textAlign: "center",
  },
  selectedEmotionText: {
    color: "#FFFFFF",
  },
});
