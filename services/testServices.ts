import { HttpRequest } from "@/utils/http/request";
import { ApiResponse } from "@/utils/http/types";

const httpClient = HttpRequest.getInstance();

const path = {
  // 获取心理测试详情
  GET_TEST_LIST: "/api/psychology/test/detail",
  // 开始心理测试
  START_TEST: "/api/psychology/test/start",
  // 提交心理测试答案
  SUBMIT_TEST_ANSWER: "/api/psychology/test/submit",
  // 获取某类型下的测试列表
  GET_TEST_LIST_BY_TYPE: "/api/psychology/tests",
  // 获取心里测试类型详情
  GET_TEST_TYPE_DETAIL: "/api/psychology/type/detail",
  // 获取心里测试类型列表
  GET_TEST_TYPE_LIST: "/api/psychology/types",
  // 获取用户心里测试详情
  GET_USER_TEST_DETAIL: "/api/psychology/user/test/detail",
  // 获取用户心理测试历史
  GET_USER_TEST_HISTORY: "/api/psychology/user/tests",
  // 搜索心理测试
  SEARCH_TEST: "/api/psychology/search",
  // 添加测试到收藏夹
  ADD_TEST_TO_FAVORITE: "/api/psychology/favorite/add",
  // 删除测试从收藏夹
  DELETE_TEST_FROM_FAVORITE: "/api/psychology/favorite/remove",
  // 获取用户的收藏夹
  GET_USER_FAVORITE: "/api/psychology/favorites",
  // 保存用户测试进度
  SAVE_USER_TEST_PROGRESS: "/api/psychology/test/save",
  // 获取用户测试报告
  GET_USER_TEST_REPORT: "/api/psychology/user/test/report",
  // 删除用户未完成的测试
  DELETE_USER_TEST: "/api/psychology/user/test/delete",
} as const;

// 基础响应类型
interface BaseResponse {
  code: number;
  message: string;
}

export type BlockType =
  | "MatchingResultBlock"
  | "KeywordTagBlock"
  | "RadarChartBlock"
  | "QuoteImageBlock"
  | "RecommendationBox"
  | "BadgeBlock"
  | "GrowthPathBlock"
  | "TextProgressBlock"
  | "VisualMeterBlock"
  | "MultiDimensionalBlock";

// 心理测试详情
export interface TestDetailResponse {
  id: number;
  type_id: number;
  name: string;
  desc: string;
  image: string;
  price: number;
  star: number;
  total: number;
  user_avatars: Array<string>;
  discount_price: number;
  question_count: number;
  is_favorited: boolean;
  answer_time: number;
  component_types: Array<BlockType>;
  questions: Array<{
    id: number;
    content: string;
    image: string;
    type: number;
    options: Array<{
      id: number;
      content: string;
      image: string;
      score: number;
      dimension: string;
    }>;
  }>;
  test_status: 0 | 1 | 2; // 0: 未开始 1: 进行中 2: 已完成
  user_test_id: number;
}

export interface Option {
  content: string;
  dimension: string;
  id: number;
  image?: string;
  score: number;
}

export interface SingleChoiceQuestion {
  type: 1;
  id: number;
  content: string;
  options: Option[];
}

export interface MultipleChoiceQuestion {
  type: 2;
  id: number;
  content: string;
  options: Option[];
  maxSelect?: number; // 最大可选数量，可选
}

export interface SliderQuestion {
  type: 3;
  id: number;
  content: string;
  options: Option[];
}

export interface SingleEmotionQuestion {
  type: 5;
  id: number;
  content: string;
  options: Option[];
}

export interface EmotionQuestion {
  type: 6;
  id: number;
  content: string;
  options: Option[];
}

export interface SortQuestion {
  type: 4;
  id: number;
  content: string;
  options: Option[];
}

export interface PercentageQuestion {
  type: 7;
  id: number;
  content: string;
  options: Option[];
}

export interface ColorQuestion {
  type: 8;
  id: number;
  content: string;
  options: Option[];
}

export interface ImageTextQuestion {
  type: 9;
  id: number;
  content: string;
  options: Option[];
}

export interface ImageText2Question {
  type: 10;
  id: number;
  content: string;
  options: Option[];
}

// 所有题目类型
export type Question =
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | SliderQuestion
  | EmotionQuestion
  | SortQuestion
  | PercentageQuestion
  | SingleEmotionQuestion
  | ColorQuestion
  | ImageTextQuestion
  | ImageText2Question;

// 心理测试报告类型
export interface TestReportResponse {
  components: Array<{
    type: BlockType;
    data: any;
  }>;
  has_access: boolean;
  message: string;
  test_id: number;
  test_name: string;
  discount_price: number;
  price: number;
}

// 开始心理测试
export interface StartTestResponse {
  user_test_id: number;
}

// 提交心理测试答案
export interface SubmitTestAnswerResponse {
  desc: string;
  id: number;
  result_key: string;
  suggestion: string;
  title: string;
}

// 获取某类型下的测试列表
export interface GetTestListByTypeResponse {
  count: number;
  list: Array<{
    id: number;
    type_id: number;
    name: string;
    desc: string;
    image: string;
    price: number;
    discount_price: number;
    question_count: number;
    answer_time: number;
    star: number;
    user_avatars: Array<string>;
    total: number;
  }>;
}

// 根据筛选条件获取测试列表
export interface GetTestListByFilterResponse {
  count: number;
  list: Array<{
    id: number;
    type_id: number;
    name: string;
    desc: string;
    image: string;
    price: number;
    discount_price: number;
    question_count: number;
    answer_time: number;
  }>;
}

// 获取心里测试类型详情
export interface GetTestTypeDetailResponse {
  id: number;
  name: string;
  desc: string;
  icon: string;
}

// 获取心里测试类型列表
export interface GetTestTypeListResponse {
  count: number;
  list: Array<{
    id: number;
    name: string;
    desc: string;
    icon: string;
  }>;
}

// 获取用户心里测试详情
export interface GetUserTestDetailResponse {
  answers: Array<{
    id: number;
    option_texts: string[];
    option_ids: number[];
    question_id: number;
    question_text: string;
    score: number[];
  }>;
  discount_price: number;
  end_time: string;
  id: number;
  price: number;
  result: Array<{
    desc: string;
    id: number;
    result_key: string;
    suggestion: string;
    title: string;
  }>;
  result_key: number;
  type_id: number;
  score: number;
  start_time: string;
  status: number;
  test_id: number;
  test_name: string;
}

// 获取用户心理测试历史
export interface GetUserTestHistoryResponse {
  count: number;
  list: Array<{
    id: number;
    test_id: number;
    test_name: string;
    type_name: string;
    start_time: string;
    end_time: string;
    status: number;
    price: number;
    discount_price: number;
    score: number;
    result_key: string;
    test_desc: string;
    progress: number;
    question_count: number;
  }>;
}

// 通用无信息返回
export interface EmptyResponse extends BaseResponse {}

export const testService = {
  // 获取心理测试详情
  async getTestList(params: {
    id: number;
  }): Promise<ApiResponse<TestDetailResponse>> {
    return httpClient.get<TestDetailResponse>(path.GET_TEST_LIST, params);
  },

  // 开始心理测试
  async startTest(params: {
    test_id: number;
  }): Promise<ApiResponse<StartTestResponse>> {
    return httpClient.post<StartTestResponse>(path.START_TEST, params);
  },

  // 提交心理测试答案
  async submitTestAnswer(params: {
    user_test_id: number;
    answers: Array<{
      option_ids: number[];
      question_id: number;
    }>;
  }): Promise<ApiResponse<SubmitTestAnswerResponse>> {
    return httpClient.post<SubmitTestAnswerResponse>(
      path.SUBMIT_TEST_ANSWER,
      params
    );
  },

  // 获取某类型下的测试列表
  async getTestListByType(params: {
    type_id?: number;
    rec?: boolean;
    free?: boolean;
    pay?: boolean;
    quick?: boolean;
    page: number;
    size: number;
    popular?: boolean;
  }): Promise<ApiResponse<GetTestListByTypeResponse>> {
    return httpClient.get<GetTestListByTypeResponse>(
      path.GET_TEST_LIST_BY_TYPE,
      params
    );
  },

  // 获取心里测试类型详情
  async getTestTypeDetail(params: {
    id: number;
  }): Promise<ApiResponse<GetTestTypeDetailResponse>> {
    return httpClient.get<GetTestTypeDetailResponse>(
      path.GET_TEST_TYPE_DETAIL,
      params
    );
  },

  // 获取心里测试类型列表
  async getTestTypeList(params: {
    page: number;
    size: number;
  }): Promise<ApiResponse<GetTestTypeListResponse>> {
    return httpClient.get<GetTestTypeListResponse>(
      path.GET_TEST_TYPE_LIST,
      params
    );
  },

  // 获取用户心里测试详情
  async getUserTestDetail(params: {
    id: number;
  }): Promise<ApiResponse<GetUserTestDetailResponse>> {
    return httpClient.get<GetUserTestDetailResponse>(
      path.GET_USER_TEST_DETAIL,
      params
    );
  },

  // 获取用户心理测试历史
  async getUserTestHistory(params: {
    status: number;
    page: number;
    size: number;
  }): Promise<ApiResponse<GetUserTestHistoryResponse>> {
    return httpClient.get<GetUserTestHistoryResponse>(
      path.GET_USER_TEST_HISTORY,
      params
    );
  },

  // 搜索心理测试
  async searchTest(params: {
    keyword: string;
    page: number;
    size: number;
  }): Promise<ApiResponse<GetTestListByTypeResponse>> {
    return httpClient.get<GetTestListByTypeResponse>(path.SEARCH_TEST, params);
  },

  // 添加测试到收藏夹
  async addTestToFavorite(params: {
    test_id: number;
  }): Promise<ApiResponse<EmptyResponse>> {
    return httpClient.post<EmptyResponse>(path.ADD_TEST_TO_FAVORITE, params);
  },

  // 删除测试从收藏夹
  async deleteTestFromFavorite(params: {
    test_id: number;
  }): Promise<ApiResponse<EmptyResponse>> {
    return httpClient.post<EmptyResponse>(
      path.DELETE_TEST_FROM_FAVORITE,
      params
    );
  },

  // 获取用户的收藏夹
  async getUserFavorite(params: {
    page: number;
    size: number;
  }): Promise<ApiResponse<GetTestListByTypeResponse>> {
    return httpClient.get<GetTestListByTypeResponse>(
      path.GET_USER_FAVORITE,
      params
    );
  },

  // 保存用户测试进度
  async saveUserTestProgress(params: {
    user_test_id: number;
    answers: Array<{
      option_ids: number[];
      question_id: number;
    }>;
  }): Promise<ApiResponse<EmptyResponse>> {
    return httpClient.post<EmptyResponse>(
      path.SAVE_USER_TEST_PROGRESS,
      params,
      {
        interceptError: false,
        interceptNetworkError: false,
      }
    );
  },

  // 获取用户测试报告
  async getUserTestReport(params: { test_id: number }) {
    return httpClient.get<TestReportResponse>(
      path.GET_USER_TEST_REPORT,
      params
    );
  },

  // 删除用户未完成的测试
  async deleteUserTest(params: { test_id: number }) {
    return httpClient.delete<EmptyResponse>(path.DELETE_USER_TEST, params);
  },
};
