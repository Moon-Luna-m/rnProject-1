import { HttpRequest } from "@/utils/http/request";
import { ApiResponse } from "@/utils/http/types";

const httpClient = HttpRequest.getInstance();

const path = {
  // 点击分享
  CLICK_SHARE: "/api/share/click",
  // 获取分享配置
  GET_SHARE_CONFIG: "/api/share/config",
  // 获取分享详情
  GET_SHARE_DETAIL: "/api/share/detail",
  // 生成分享链接
  GENERATE_SHARE_LINK: "/api/share/generate",
  // 获取分享列表
  GET_SHARE_LIST: "/api/share/records",
  // 获取分享总收益
  GET_SHARE_TOTAL_EARNING: "/api/share/rewards",
} as const;

// 点击分享响应类型
interface ClickShareResponse {
  data: string;
}

// 获取分享配置响应类型
interface GetShareConfigResponse {
  daily_reward_limit: number;
  is_enabled: number;
  reward_coins: number;
}

// 获取分享详情响应类型
interface GetShareDetailResponse {
  click_count: number;
  created_at: string;
  id: number;
  platform: string;
  reg_count: number;
  target_id: number;
  target_type: string;
  title: string;
}

// 生成分享链接响应类型
interface GenerateShareLinkResponse {
  share_code: string;
  share_link: string;
}

// 获取分享列表响应类型
interface GetShareListResponse {
  total: number;
  records: Array<{
    click_count: number;
    created_at: string;
    platform: string;
    id: number;
    reg_count: number;
    target_id: number;
    target_type: string;
    title: string;
  }>;
}

// 获取分享总收益响应类型
interface GetShareTotalEarningsResponse {
  total_rewards: number;
}

export const shareService = {
  // 点击分享
  async clickShare(params: {
    share_code: number;
  }): Promise<ApiResponse<ClickShareResponse>> {
    return httpClient.post<ClickShareResponse>(path.CLICK_SHARE, params);
  },

  // 获取分享配置
  async getShareConfig(): Promise<ApiResponse<GetShareConfigResponse>> {
    return httpClient.get<GetShareConfigResponse>(path.GET_SHARE_CONFIG);
  },

  // 获取分享详情
  async getShareDetail(params: {
    share_code: number;
  }): Promise<ApiResponse<GetShareDetailResponse>> {
    return httpClient.get<GetShareDetailResponse>(path.GET_SHARE_DETAIL, params);
  },

  // 生成分享链接
  async generateShareLink(params: {
    platform: string;
    target_id: number;
    target_type: string;
    title: string;
  }): Promise<ApiResponse<GenerateShareLinkResponse>> {
    return httpClient.post<GenerateShareLinkResponse>(path.GENERATE_SHARE_LINK, params);
  },

  // 获取分享列表
  async getShareList(params: {
    page: number;
    size: number;
  }): Promise<ApiResponse<GetShareListResponse>> {
    return httpClient.get<GetShareListResponse>(path.GET_SHARE_LIST, params);
  },

  // 获取分享总收益
  async getShareTotalEarnings(): Promise<ApiResponse<GetShareTotalEarningsResponse>> {
    return httpClient.get<GetShareTotalEarningsResponse>(path.GET_SHARE_TOTAL_EARNING);
  },
};
