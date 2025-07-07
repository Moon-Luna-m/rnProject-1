import { HttpRequest } from "@/utils/http/request";
import { ApiResponse } from "@/utils/http/types";

const httpClient = HttpRequest.getInstance();

const path = {
  // 获取用户信息
  INFO: "/api/users/info",
  // 谷歌登录
  GOOGLELOGIN: "/api/google-login",
  // 账密登录
  LOGIN: "/api/login",
  // 注册
  REGISTER: "/api/register",
  // 退出登录
  LOGOUT: "/api/users/logout",
  // 获取验证码
  GET_CAPTCHA: "/api/send-verify-code",
  // 修改个人信息
  UPDATE_INFO: "/api/users/info",
  // 修改密码
  UPDATE_PASSWORD: "/api/users/password",
  // 忘记密码
  RESET: "/api/users/reset",
  // 重置密码
  RESET_PASSWORD: "/api/users/reset-password",
  // 获取头像列表
  GET_AVATAR_LIST: "/api/users/avatars",
  // 上传头像
  UPLOAD_AVATAR: "/api/users/avatar/upload",
} as const;

// 基础响应类型
interface BaseResponse {
  code: number;
  message: string;
}

// 用户信息接口
export interface UserInfo {
  avatar: string;
  email: string;
  username: string;
  sex: number;
  balance: number;
  birthday: string;
  is_vip_active: boolean;
  vip_expire_at: string;
  vip: number;
  subscription_type: string;
}

// 谷歌登录返回信息
export interface GoogleUserInfo {
  is_new_user: boolean;
  token: string;
  user_id: number;
  username: string;
}

// 账密登录返回信息
export interface LoginResponse {
  token: string;
}

// 注册返回信息
export interface RegisterResponse {
  token: string;
  user_id: number;
}

// 获取验证码返回信息
export interface GetCaptchaResponse {
  code: string;
}

// 获取头像列表返回信息
export interface GetAvatarListResponse {
  count: number;
  list: Array<{ id: number; url: string; is_default: boolean }>;
}

// 上传头像返回信息
export interface UploadAvatarResponse {
  url: string;
}

// 通用无信息返回
export interface EmptyResponse extends BaseResponse {}

// API 响应类型
export type UserResponse = ApiResponse<UserInfo>;
export type GoogleLoginResponse = ApiResponse<UserInfo>;

export const userService = {
  async getUserInfo(): Promise<ApiResponse<UserInfo>> {
    return httpClient.get<UserInfo>(path.INFO);
  },

  async googleLogin(params: {
    avatar_url: string;
    email: string;
    google_id: string;
    name: string;
  }): Promise<ApiResponse<GoogleUserInfo>> {
    return httpClient.post<GoogleUserInfo>(path.GOOGLELOGIN, params);
  },

  async login(params: {
    email: string;
    password: string;
  }): Promise<ApiResponse<LoginResponse>> {
    return httpClient.post<LoginResponse>(path.LOGIN, params, {
      interceptError: false,
    });
  },

  async register(params: {
    code: string;
    email: string;
    password: string;
  }): Promise<ApiResponse<EmptyResponse>> {
    return httpClient.post<EmptyResponse>(path.REGISTER, params, {
      interceptError: false,
    });
  },

  async logout(): Promise<ApiResponse<EmptyResponse>> {
    return httpClient.post<EmptyResponse>(path.LOGOUT);
  },

  async getCaptcha(params: {
    email: string;
    type: "register" | "reset" | "password";
  }): Promise<ApiResponse<GetCaptchaResponse>> {
    return httpClient.post<GetCaptchaResponse>(path.GET_CAPTCHA, params);
  },

  async updateInfo(params: {
    avatar: string;
    sex: number;
    username: string;
    birthday: string;
  }): Promise<ApiResponse<UserInfo>> {
    return httpClient.put<UserInfo>(path.UPDATE_INFO, params);
  },

  async updatePassword(params: {
    new_password: string;
    old_password: string;
  }): Promise<ApiResponse<EmptyResponse>> {
    return httpClient.put<EmptyResponse>(path.UPDATE_PASSWORD, params);
  },

  async reset(params: {
    email: string;
    code: string;
    new_password: string;
  }): Promise<ApiResponse<EmptyResponse>> {
    return httpClient.put<EmptyResponse>(path.RESET, params, {
      interceptError: false,
    });
  },

  async resetPassword(params: {
    new_password: string;
    token: string;
  }): Promise<ApiResponse<EmptyResponse>> {
    return httpClient.post<EmptyResponse>(path.RESET_PASSWORD, params);
  },

  async getAvatarList(params: {
    page: number;
    size: number;
  }): Promise<ApiResponse<GetAvatarListResponse>> {
    return httpClient.get<GetAvatarListResponse>(path.GET_AVATAR_LIST, params);
  },

  async uploadAvatar(
    file: FormData
  ): Promise<ApiResponse<UploadAvatarResponse>> {
    return httpClient.post<UploadAvatarResponse>(path.UPLOAD_AVATAR, file);
  },
};
