import { createFontStyle } from "@/utils/typography";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface ChatMessageProps {
  message: string;
  isUser?: boolean;
  timestamp?: string;
  suggestions?: string[];
  onSuggestionPress?: (suggestion: string) => void;
  loading?: boolean;
  clarifyQuestions?: {
    id: string;
    question: string;
    type: string;
    placeholder?: string;
    options?: string[];
    optional?: boolean;
  }[];
  onClarifyAnswer?: (questionId: string, answer: string) => void;
  currentQuestionIndex?: number;
  clarifyResponses?: Record<string, string>;
  error?: boolean;
  onRetry?: () => void;
}

export default function ChatMessage({
  message,
  isUser = false,
  timestamp,
  suggestions,
  onSuggestionPress,
  loading = false,
  clarifyQuestions,
  onClarifyAnswer,
  currentQuestionIndex = 0,
  clarifyResponses,
  error = false,
  onRetry,
}: ChatMessageProps) {
  const [dots, setDots] = useState("...");
  const [textInputs, setTextInputs] = useState<Record<string, string>>({});
  const { t } = useTranslation();

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? "." : prev + ".");
      }, 500);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleTextChange = (questionId: string, text: string) => {
    setTextInputs(prev => ({ ...prev, [questionId]: text }));
  };

  const handleTextSubmit = (questionId: string) => {
    const answer = textInputs[questionId];
    if (answer && onClarifyAnswer) {
      onClarifyAnswer(questionId, answer);
      // 清空当前问题的输入
      setTextInputs(prev => ({ ...prev, [questionId]: "" }));
    }
  };

  return (
    <View>
      {timestamp && (
        <View style={styles.timestampContainer}>
          <Text style={styles.timestamp}>{timestamp}</Text>
        </View>
      )}
      <View
        style={[
          styles.container,
          isUser ? styles.userContainer : styles.botContainer,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.botBubble,
            error && styles.errorBubble,
          ]}
        >
          {loading ? (
            <Text style={[styles.text, styles.botText, styles.loadingText]}>
              {t("chat.typing")}{dots}
            </Text>
          ) : (
            <>
              <Text style={[styles.text, isUser ? styles.userText : styles.botText]}>
                {message}
              </Text>
              {error && onRetry && (
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={onRetry}
                  disabled={loading}
                >
                  <Ionicons name="reload-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.retryText}>{t("chat.retry")}</Text>
                </TouchableOpacity>
              )}
              {suggestions && suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {suggestions.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => onSuggestionPress?.(suggestion)}
                    >
                      <Text style={[styles.text, styles.highlightText]}>
                        "{suggestion}"
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {clarifyQuestions && clarifyQuestions.length > 0 && (
                <View style={styles.clarifyContainer}>
                  {clarifyQuestions.slice(0, currentQuestionIndex + 1).map((question, index) => (
                    <View key={question.id} style={styles.questionContainer}>
                      <Text style={[styles.text, styles.questionText]}>
                        {`${index + 1}/${clarifyQuestions.length}. ${question.question}`}
                        {question.optional && (
                          <Text style={styles.optionalText}> ({t("chat.optional")})</Text>
                        )}
                      </Text>
                      {index === currentQuestionIndex && !clarifyResponses?.[question.id] && (
                        <>
                          {question.type === "select" && question.options && (
                            <View style={styles.optionsContainer}>
                              {question.options.map((option, optIndex) => (
                                <TouchableOpacity
                                  key={optIndex}
                                  style={styles.optionButton}
                                  onPress={() => onClarifyAnswer?.(question.id, option)}
                                >
                                  <Text style={styles.optionButtonText}>{option}</Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          )}
                          {question.type === "text" && (
                            <View style={styles.textInputContainer}>
                              <TextInput
                                style={styles.textInput}
                                placeholder={question.placeholder || t("chat.input.placeholder")}
                                value={textInputs[question.id] || ""}
                                onChangeText={(text) => handleTextChange(question.id, text)}
                                onSubmitEditing={() => handleTextSubmit(question.id)}
                                returnKeyType="done"
                                placeholderTextColor="#A9AEB8"
                              />
                              <TouchableOpacity
                                style={[
                                  styles.submitButton,
                                  !textInputs[question.id] && styles.submitButtonDisabled,
                                ]}
                                onPress={() => handleTextSubmit(question.id)}
                                disabled={!textInputs[question.id]}
                              >
                                <Text style={[
                                  styles.submitButtonText,
                                ]}>
                                  {t("chat.input.send")}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </>
                      )}
                      {clarifyResponses?.[question.id] && (
                        <View style={styles.answeredContainer}>
                          <Text style={styles.answeredText}>{t("chat.your_answer")}:</Text>
                          <Text style={styles.answerResult}>
                            {question.type === "select" ? (
                              <Text style={styles.answerHighlight}>{clarifyResponses?.[question.id] || ""}</Text>
                            ) : (
                              <Text style={styles.answerHighlight}>"{clarifyResponses?.[question.id] || ""}"</Text>
                            )}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 16,
    marginVertical: 6,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  userContainer: {
    justifyContent: "flex-end",
  },
  botContainer: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: (343),
    padding: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: "#19DBF2",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 2,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 8,
  },
  botBubble: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 2,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 20,
  },
  text: {
    fontSize: 14,
    lineHeight: 24,
    ...createFontStyle("500"),
  },
  userText: {
    color: "#FFFFFF",
  },
  botText: {
    color: "#1F2937",
  },
  highlightText: {
    color: "#195EF2",
  },
  timestamp: {
    fontFamily: "Poppins",
    fontSize: 10,
    color: "#72818F",
    marginBottom: 6,
    backgroundColor: "#EBF5FF",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 20,
  },
  timestampContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  suggestionsContainer: {
    marginTop: 8,
    gap: 8,
  },
  loadingText: {
    fontStyle: "italic",
  },
  clarifyContainer: {
    marginTop: 16,
    gap: 16,
  },
  questionContainer: {
    gap: 8,
  },
  questionText: {
    color: "#1F2937",
    marginBottom: 4,
  },
  optionalText: {
    color: "#6B7280",
    fontSize: 12,
  },
  optionsContainer: {
    flexDirection: "column",
    gap: 8,
  },
  optionButton: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  optionButtonText: {
    color: "#1F2937",
    fontSize: 14,
    ...createFontStyle("500"),
  },
  textInputContainer: {
    gap: 8,
  },
  textInput: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#1F2937",
    minHeight: 40,
    outlineWidth: 0,
  },
  submitButton: {
    backgroundColor: "#19DBF2",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    ...createFontStyle("500"),
  },
  answeredText: {
    color: "#10B981",
    fontSize: 12,
    marginTop: 4,
  },
  answerResult: {
    marginTop: 2,
    fontStyle: "italic",
    color: "#6B7280",
    fontSize: 14,
  },
  answerHighlight: {
    color: "#195EF2",
    ...createFontStyle("500"),
  },
  summaryContainer: {
    marginTop: 16,
    paddingTop: 16,
  },
  summaryText: {
    color: "#10B981",
    fontSize: 14,
    ...createFontStyle("500"),
    textAlign: "center",
  },
  answeredContainer:{
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  errorBubble: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FCA5A5",
    borderWidth: 1,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EF4444",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginTop: 8,
    gap: 4,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 12,
    ...createFontStyle("500"),
  },
});
