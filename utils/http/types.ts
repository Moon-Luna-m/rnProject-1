// HTTP 响应数据接口
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

// 错误类型枚举
export enum ErrorType {
  NETWORK = 'NETWORK',   // 网络错误
  BUSINESS = 'BUSINESS', // 业务错误
  TIMEOUT = 'TIMEOUT',   // 超时错误
  AUTH = 'AUTH',         // 认证错误
  UNKNOWN = 'UNKNOWN'    // 未知错误
}

// 错误详情接口
export interface ErrorDetail {
  type: ErrorType;
  code?: number;
  message: string;
  url?: string;
  timestamp: number;
  data?: any;
}

// HTTP 基础配置接口
export interface HttpBaseConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

// 全局配置接口
export interface GlobalConfig extends HttpBaseConfig {
  interceptBusinessError?: boolean; // 是否拦截业务错误
  interceptNetworkError?: boolean; // 是否拦截网络错误
  successCode?: number; // 成功的业务代码
  onError?: (error: ErrorDetail) => void; // 错误处理回调
}

// HTTP 请求配置接口
export interface RequestConfig extends HttpBaseConfig {
  interceptError?: boolean; // 是否拦截业务错误
  interceptNetworkError?: boolean; // 是否拦截网络错误
  businessCodes?: number[]; // 允许的业务代码列表
  params?: Record<string, any>; // 请求参数
} 