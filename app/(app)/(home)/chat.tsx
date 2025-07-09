import { icons } from "@/assets/static";
import ChatInput from "@/components/chat/ChatInput";
import ChatMessage from "@/components/chat/ChatMessage";
import TestCard from "@/components/chat/TestCard";
import DigitalAssistant from "@/components/home/DigitalAssistant";
import { chatServices } from "@/services/chatServices";
import { formatDate } from "@/utils/common";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ClarifyQuestion {
  id: string;
  question: string;
  type: string;
  placeholder?: string;
  options?: string[];
  optional?: boolean;
}

interface TestInfo {
  id: number;
  type_id: number;
  type_name: string;
  name: string;
  desc: string;
  question_count: number;
  answer_time: number;
  price: number;
  discount_price: number;
  image: string;
}

interface Message {
  id: string;
  message: string;
  isUser: boolean;
  timestamp?: string;
  suggestions?: string[];
  clarifyQuestions?: ClarifyQuestion[];
  testInfo?: TestInfo;
  error?: boolean;
}

// 提取并记忆化背景组件
const Background = React.memo(({ insets }: { insets: { top: number } }) => (
  <>
    <TouchableOpacity
      onPress={() => {
        router.back();
      }}
      style={[styles.backButton, { top: insets.top }]}
    >
      <Image
        source={require("@/assets/images/common/icon-back.png")}
        style={{ width: 24, height: 24 }}
      />
    </TouchableOpacity>
    <LinearGradient
      colors={["#75E8FF", "#75E8FF", "#F5F7FA"]}
      start={{ x: 1, y: 0.55 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
      pointerEvents="none"
    >
      <DigitalAssistant />
    </LinearGradient>
  </>
));

// 记忆化主内容组件
const MainContent = React.memo(
  ({
    insets,
    messages,
    loading,
    currentQuestionIndex,
    clarifyResponses,
    isAnsweringQuestions,
    isTestGenerated,
    scrollViewRef,
    contentHeight,
    scrollViewHeight,
    onContentSizeChange,
    onLayout,
    onSuggestionPress,
    onClarifyAnswer,
    onRetry,
    onSend,
    handleStartTest,
    t,
  }: {
    insets: { top: number };
    messages: Message[];
    loading: boolean;
    currentQuestionIndex: number;
    clarifyResponses: Record<string, string>;
    isAnsweringQuestions: boolean;
    isTestGenerated: boolean;
    scrollViewRef: React.RefObject<ScrollView | null>;
    contentHeight: number;
    scrollViewHeight: number;
    onContentSizeChange: (w: number, h: number) => void;
    onLayout: (event: any) => void;
    onSuggestionPress: (suggestion: string) => void;
    onClarifyAnswer: (questionId: string, answer: string) => void;
    onRetry: () => Promise<void>;
    onSend: (message: string) => void;
    handleStartTest: () => void;
    t: (key: string, options?: any) => string;
  }) => (
    <View style={styles.container}>
      <Background insets={insets} />
      <View
        style={[
          styles.scrollContainer,
          {
            marginTop:
              Platform.OS === "web" ? 215 : Platform.OS === "ios" ? 230 : 195,
          },
        ]}
      >
        <View style={styles.scrollContent}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            onContentSizeChange={onContentSizeChange}
            onLayout={onLayout}
          >
            {messages.map((msg, index) => (
              <ChatMessage
                key={index}
                message={msg.message}
                isUser={msg.isUser}
                timestamp={msg.timestamp}
                suggestions={msg.suggestions}
                onSuggestionPress={onSuggestionPress}
                clarifyQuestions={msg.clarifyQuestions}
                onClarifyAnswer={onClarifyAnswer}
                currentQuestionIndex={currentQuestionIndex}
                clarifyResponses={clarifyResponses}
                error={msg.error}
                onRetry={msg.error ? onRetry : undefined}
              />
            ))}
            {loading && (
              <ChatMessage
                key="loading"
                message=""
                isUser={false}
                loading={true}
              />
            )}
            {messages[messages.length - 1]?.testInfo && (
              <TestCard
                title={messages[messages.length - 1].testInfo!.name}
                subtitle={messages[messages.length - 1].testInfo!.type_name}
                description={messages[messages.length - 1].testInfo!.desc}
                questionCount={`${t("test.total_questions", {
                  count: messages[messages.length - 1].testInfo!.question_count,
                })}`}
                duration={`${t("test.estimated_time", {
                  minutes: Math.ceil(
                    messages[messages.length - 1].testInfo!.answer_time / 60
                  ),
                })}`}
                icon={
                  icons[
                    Number(
                      messages[messages.length - 1]
                        .testInfo!.image.split("/")[2]
                        .split(".")[0]
                    ) - 1
                  ]
                }
                onStart={handleStartTest}
              />
            )}
          </ScrollView>
        </View>
      </View>
      <ChatInput
        onSend={onSend}
        loading={loading}
        disabled={isAnsweringQuestions || isTestGenerated}
      />
    </View>
  )
);

export default function Chat() {
  const scrollViewRef = useRef<ScrollView | null>(null);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  // 在页面失焦时清除会话ID
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        chatServices.clearSession();
      };
    }, [])
  );

  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      message: t("chat.hello"),
      timestamp: formatDate(date, "MMM DD, YYYY hh:mm:ss"),
      isUser: false,
    },
  ]);
  const [clarifyResponses, setClarifyResponses] = useState<
    Record<string, string>
  >({});
  const [isAnsweringQuestions, setIsAnsweringQuestions] = useState(false);
  const [isTestGenerated, setIsTestGenerated] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<{
    type: "message" | "clarify";
    content: string | Record<string, string>;
  } | null>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);

  // 监听消息变化和键盘事件，自动滚动到底部
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollViewRef.current && contentHeight > scrollViewHeight) {
        const scrollDistance = contentHeight - scrollViewHeight;
        scrollViewRef.current.scrollTo({ y: scrollDistance, animated: true });
      }
    };

    scrollToBottom();

    // 只在移动端添加键盘监听
    if (Platform.OS !== "web") {
      const keyboardDidShowListener = Keyboard.addListener(
        "keyboardWillShow",
        scrollToBottom
      );

      return () => {
        keyboardDidShowListener.remove();
      };
    }
  }, [messages, contentHeight, scrollViewHeight]);

  const handleStartTest = () => {
    // TODO: Handle test start
    router.push({
      pathname: "/test/[id]",
      params: {
        id: messages[messages.length - 1]?.testInfo?.id.toString() || "",
      },
    });
  };

  const handleClarifyAnswer = async (questionId: string, answer: string) => {
    const lastMessage = messages[messages.length - 1];
    const questions = lastMessage.clarifyQuestions || [];

    // 保存回答
    const newResponses = {
      ...clarifyResponses,
      [questionId]: answer,
    };
    setClarifyResponses(newResponses);

    // 如果不是最后一个问题，显示下一个问题
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      return;
    }

    // 如果是最后一个问题，发送所有回答
    setLoading(true);
    try {
      // 保存最后一次提交的内容
      setLastSubmission({
        type: "clarify",
        content: newResponses,
      });

      const response = await chatServices.createTest({
        description: messages[messages.length - 2].message,
        clarify_responses: newResponses,
      });
      const result = chatServices.handleChatResponse(response);

      // 清除最后一次提交的内容
      setLastSubmission(null);

      // 不重置问题索引和回答，而是保持显示所有结果
      handleResponse(result);

      // 如果生成测试成功，设置测试已生成状态
      if (result.status === "success") {
        setIsTestGenerated(true);
      }

      // 解除输入限制
      setIsAnsweringQuestions(false);
      // 清空问题相关状态
      setCurrentQuestionIndex(0);
      setClarifyResponses({});
    } catch (error) {
      // Handle error
      setIsAnsweringQuestions(false);
      // 添加错误消息
      setMessages((prev) => [
        ...prev,
        {
          id: String(prev.length + 1),
          message: t("chat.network_error"),
          isUser: false,
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = (result: any) => {
    switch (result.status) {
      case "error":
        setMessages((prev) => [
          ...prev,
          {
            id: String(prev.length + 1),
            message: result.message || t("chat.error"),
            isUser: false,
            suggestions: chatServices.formatAlternatives(result.alternatives),
          },
        ]);
        break;

      case "need_confirmation":
        setMessages((prev) => [
          ...prev,
          {
            id: String(prev.length + 1),
            message: result.message || t("chat.type_confirmation"),
            isUser: false,
          },
        ]);
        break;

      case "need_clarification":
        // 设置正在回答问题状态
        setIsAnsweringQuestions(true);
        setCurrentQuestionIndex(0);
        setClarifyResponses({});

        setMessages((prev) => [
          ...prev,
          {
            id: String(prev.length + 1),
            message: result.message || t("chat.need_clarification"),
            isUser: false,
            clarifyQuestions: result.clarifyQuestions,
          },
        ]);
        break;

      case "success":
        setMessages((prev) => [
          ...prev,
          {
            id: String(prev.length + 1),
            message: t("chat.test_ready", {
              name: result.testInfo?.name,
              count: result.testInfo?.question_count,
            }),
            isUser: false,
            testInfo: result.testInfo,
          },
        ]);
        // 设置测试已生成状态
        setIsTestGenerated(true);
        break;

      default:
        setMessages((prev) => [
          ...prev,
          {
            id: String(prev.length + 1),
            message: t("chat.unknown_error"),
            isUser: false,
          },
        ]);
    }
  };

  const handleSendMessage = async (message: string) => {
    // 如果正在回答问题或测试已生成，不允许发送新消息
    if (isAnsweringQuestions || isTestGenerated || loading) {
      return;
    }

    const userMessage: Message = {
      id: String(messages.length + 1),
      message,
      isUser: true,
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      // 保存最后一次提交的内容
      setLastSubmission({
        type: "message",
        content: message,
      });

      const response = await chatServices.createTest({ description: message });
      const result = chatServices.handleChatResponse(response);

      // 清除之前的网络错误消息
      setMessages((prev) => {
        // 找到当前用户消息的索引
        const currentMessageIndex = prev.findIndex(
          (msg) => msg.id === userMessage.id
        );
        if (currentMessageIndex === -1) return prev;

        // 过滤掉当前用户消息之前的所有网络错误消息
        return prev.filter((msg, index) => {
          if (index >= currentMessageIndex) return true;
          return !msg.error || msg.message !== t("chat.network_error");
        });
      });

      handleResponse(result);

      // 清除最后一次提交的内容
      setLastSubmission(null);
    } catch (error) {
      // 添加错误消息
      setMessages((prev) => [
        ...prev,
        {
          id: String(prev.length + 1),
          message: t("chat.network_error"),
          isUser: false,
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 使用 useCallback 记忆化回调函数
  const handleContentSizeChange = React.useCallback((w: number, h: number) => {
    setContentHeight(h);
  }, []);

  const handleLayout = React.useCallback((event: any) => {
    setScrollViewHeight(event.nativeEvent.layout.height);
  }, []);

  const handleSuggestionPress = React.useCallback(
    (suggestion: string) => {
      // 如果正在回答问题或测试已生成，不允许点击建议
      if (isAnsweringQuestions || isTestGenerated || loading) {
        return;
      }
      handleSendMessage(suggestion);
    },
    [isAnsweringQuestions, isTestGenerated, loading]
  );

  const handleRetry = React.useCallback(async () => {
    if (!lastSubmission || loading) return;

    setLoading(true);
    try {
      if (lastSubmission.type === "message") {
        const response = await chatServices.createTest({
          description: lastSubmission.content as string,
        });
        const result = chatServices.handleChatResponse(response);
        handleResponse(result);
      } else {
        const response = await chatServices.createTest({
          description: messages[messages.length - 3].message, // 跳过错误消息和用户消息
          clarify_responses: lastSubmission.content as Record<string, string>,
        });
        const result = chatServices.handleChatResponse(response);
        handleResponse(result);
      }

      // 移除错误消息
      setMessages((prev) => prev.filter((msg) => !msg.error));
      // 清除最后一次提交的内容
      setLastSubmission(null);
    } catch (error) {
      // 保持错误消息
    } finally {
      setLoading(false);
    }
  }, [lastSubmission, loading, messages]);

  // 渲染主内容
  return Platform.OS === "web" ? (
    <MainContent
      insets={insets}
      messages={messages}
      loading={loading}
      currentQuestionIndex={currentQuestionIndex}
      clarifyResponses={clarifyResponses}
      isAnsweringQuestions={isAnsweringQuestions}
      isTestGenerated={isTestGenerated}
      scrollViewRef={scrollViewRef}
      contentHeight={contentHeight}
      scrollViewHeight={scrollViewHeight}
      onContentSizeChange={handleContentSizeChange}
      onLayout={handleLayout}
      onSuggestionPress={handleSuggestionPress}
      onClarifyAnswer={handleClarifyAnswer}
      onRetry={handleRetry}
      onSend={handleSendMessage}
      handleStartTest={handleStartTest}
      t={t}
    />
  ) : (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <MainContent
        insets={insets}
        messages={messages}
        loading={loading}
        currentQuestionIndex={currentQuestionIndex}
        clarifyResponses={clarifyResponses}
        isAnsweringQuestions={isAnsweringQuestions}
        isTestGenerated={isTestGenerated}
        scrollViewRef={scrollViewRef}
        contentHeight={contentHeight}
        scrollViewHeight={scrollViewHeight}
        onContentSizeChange={handleContentSizeChange}
        onLayout={handleLayout}
        onSuggestionPress={handleSuggestionPress}
        onClarifyAnswer={handleClarifyAnswer}
        onRetry={handleRetry}
        onSend={handleSendMessage}
        handleStartTest={handleStartTest}
        t={t}
      />
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flex: 1,
    backgroundColor: "#fff",
  },
  gradient: {
    width: "100%",
    height: 300,
    position: "absolute",
    top: 0,
    left: 0,
  },
  content: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    // backgroundColor: "#F5F7FA",
  },
  scrollContent: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    // paddingVertical: 24,
    paddingTop: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  backButton: {
    position: "absolute",
    left: 0,
    height: 44,
    paddingVertical: 10,
    paddingHorizontal: 16,
    zIndex: 1,
  },
});
