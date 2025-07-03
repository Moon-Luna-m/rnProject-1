import { HttpRequest } from "@/utils/http/request";

const httpClient = HttpRequest.getInstance();

export interface ChatResponse {
  code: number;
  message: string;
  data: {
    message?: string;
    alternatives?: string[];
    suggestion?: string;
    stage?: string;
    detected_type_id?: number;
    detected_type_name?: string;
    type_options?: {
      id: number;
      name: string;
      recommended: boolean;
      desc: string;
    }[];
    clarify_questions?: {
      id: string;
      question: string;
      type: string;
      placeholder?: string;
      options?: string[];
      optional?: boolean;
    }[];
    session_id?: string;
    original_question?: string;
    action_buttons?: {
      text: string;
      action: string;
      type_id?: number;
    }[];
    test_id?: number;
    is_existing?: boolean;
    test_info?: {
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
    };
  };
}

export interface CreateTestParams {
  description: string;
  confirmed_type_id?: number;
  session_id?: string;
  clarify_responses?: Record<string, string>;
}

export const chatServices = {
  /**
   * 当前会话ID
   */
  currentSessionId: "",

  /**
   * 清除当前会话ID
   */
  clearSession: () => {
    chatServices.currentSessionId = "";
  },

  /**
   * 创建心理测试
   * @param params 创建测试的参数
   * @returns 创建测试的响应
   */
  createTest: async (params: CreateTestParams): Promise<ChatResponse> => {
    return httpClient.post(
      "/api/psychology/ai/create",
      {
        ...params,
        session_id: chatServices.currentSessionId || params.session_id,
      },
      {
        interceptNetworkError: false,
        interceptError: false,
      }
    );
  },

  /**
   * 处理聊天响应
   * @param response 聊天响应数据
   * @returns 处理后的状态和数据
   */
  handleChatResponse: (response: ChatResponse) => {
    const { data } = response;
    const { stage, session_id } = data;

    // 保存会话ID
    if (session_id) {
      chatServices.currentSessionId = session_id;
    }

    switch (stage) {
      case "input_too_short":
      case "inappropriate_content":
      case "vague_input":
      case "invalid_input":
      case "low_content_density":
        return {
          status: "error",
          message: data.message,
          alternatives: data.alternatives,
          suggestion: data.suggestion,
        };

      case "need_confirmation":
        return {
          status: "need_confirmation",
          message: data.message,
          detectedTypeId: data.detected_type_id,
          detectedTypeName: data.detected_type_name,
          typeOptions: data.type_options,
          actionButtons: data.action_buttons,
          originalQuestion: data.original_question,
        };

      case "need_clarification":
        return {
          status: "need_clarification",
          message: data.message,
          clarifyQuestions: data.clarify_questions,
          sessionId: data.session_id,
          originalQuestion: data.original_question,
          detectedTypeId: data.detected_type_id,
        };

      case "test_created":
      case "test_reused":
        return {
          status: "success",
          testId: data.test_id,
          detectedTypeId: data.detected_type_id,
          isExisting: data.is_existing,
          testInfo: data.test_info,
        };

      case "error_generation":
        return {
          status: "error",
          message: data.message,
          alternatives: data.alternatives,
          suggestion: data.suggestion,
        };

      default:
        return {
          status: "unknown",
          message: "Unknown response status",
        };
    }
  },

  /**
   * 格式化建议选项
   * @param alternatives 建议选项数组
   * @returns 格式化后的建议选项
   */
  formatAlternatives: (alternatives: string[] = []): string[] => {
    return alternatives.map((alt) => alt.replace(/^["']|["']$/g, ""));
  },

  /**
   * 检查输入是否有效
   * @param input 用户输入
   * @returns 是否有效
   */
  isValidInput: (input: string): boolean => {
    // 检查输入长度
    if (input.length < 5) {
      return false;
    }

    // 检查违规内容
    const forbiddenWords = [
      "hack",
      "cheat",
      "nsfw",
      "sex",
      "illegal",
      "bomb",
      "attack",
    ];
    if (forbiddenWords.some((word) => input.toLowerCase().includes(word))) {
      return false;
    }

    // 检查模糊输入
    const vagueWords = ["随便", "whatever", "anything", "test"];
    if (vagueWords.some((word) => input.toLowerCase().includes(word))) {
      return false;
    }

    // 检查无效输入
    const invalidPatterns = [
      /(.)\1{4,}/, // 重复字符
      /\?{3,}/, // 多个问号
      /^[\s\p{P}]+$/u, // 只有空格和标点
    ];
    if (invalidPatterns.some((pattern) => pattern.test(input))) {
      return false;
    }

    return true;
  },
};
