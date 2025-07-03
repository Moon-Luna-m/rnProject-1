import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import Constants from "expo-constants";
import { deleteItemAsync, getItemAsync, setItemAsync } from "expo-secure-store";
import i18next from "i18next";
import qs from "qs";
import { Platform } from "react-native";
import { eventBus } from "../eventBus";
import { getStoredLanguage, LANGUAGES } from "../i18n";
import {
  ApiResponse,
  ErrorDetail,
  ErrorType,
  GlobalConfig,
  RequestConfig,
} from "./types";

// Token 存储键名
const AUTH_TOKEN_KEY = "Authorization";

// 事件名称常量
export const HTTP_EVENTS = {
  ERROR: "http:error",
  UNAUTHORIZED: "http:unauthorized",
  NETWORK_ERROR: "http:network_error",
} as const;

// 自定义错误类
class HttpError extends Error {
  constructor(
    message: string,
    public type: ErrorType,
    public response?: AxiosResponse,
    public code?: number,
    public data?: any
  ) {
    super(message);
    this.name = type;
  }
}

export class HttpRequest {
  private static instance: HttpRequest;
  private axiosInstance: AxiosInstance;
  private globalConfig: GlobalConfig = {
    baseURL: !__DEV__
      ? Constants.expoConfig?.extra?.apiUrl.prod.apiUrl
      : Constants.expoConfig?.extra?.apiUrl.dev.apiUrl,
    // baseURL: "https://mindsecho.com/h5",
    interceptBusinessError: true,
    interceptNetworkError: true,
    successCode: 200,
    timeout: 120000,
    onError: (error: ErrorDetail) => {
      eventBus.emit(HTTP_EVENTS.ERROR, error);
    },
  };

  private constructor() {
    // 创建 axios 实例的默认配置
    const axiosConfig = {
      baseURL: this.globalConfig.baseURL,
      timeout: this.globalConfig.timeout,
      headers: {
        "Content-Type": "application/json",
        Platform: Platform.OS,
      },
      paramsSerializer: {
        serialize: (params: Record<string, any>) =>
          qs.stringify(params, {
            arrayFormat: "brackets",
            encode: true,
            skipNulls: true,
            allowDots: true,
          }),
      },
    };
    // 初始化 axios 实例
    this.axiosInstance = axios.create(axiosConfig);

    // 设置拦截器
    this.setupInterceptors();
  }

  public static getInstance(): HttpRequest {
    if (!HttpRequest.instance) {
      HttpRequest.instance = new HttpRequest();
    }
    return HttpRequest.instance;
  }

  // 提供一个公共方法用于更新配置
  public updateConfig(config: Partial<GlobalConfig>): void {
    // 更新全局配置
    this.globalConfig = {
      ...this.globalConfig,
      ...config,
    };

    // 更新 axios 实例配置
    if (config.baseURL) {
      this.axiosInstance.defaults.baseURL = config.baseURL;
    }
    if (config.timeout) {
      this.axiosInstance.defaults.timeout = config.timeout;
    }
    if (config.headers) {
      Object.assign(this.axiosInstance.defaults.headers, config.headers);
    }
  }

  private async checkNetworkConnection(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected || false;
    } catch (error) {
      console.warn("Network check failed:", error);
      return false;
    }
  }

  private createErrorDetail(
    error: HttpError | AxiosError | Error,
    url?: string
  ): ErrorDetail {
    const errorDetail: ErrorDetail = {
      type: ErrorType.UNKNOWN,
      message: error.message,
      timestamp: Date.now(),
      url,
    };

    if (error instanceof HttpError) {
      errorDetail.type = error.type;
      errorDetail.code = error.code;
      errorDetail.data = error.data;
    } else if (axios.isAxiosError(error)) {
      if (error.response) {
        errorDetail.type = [401, 10104].includes(error.response.status)
          ? ErrorType.AUTH
          : ErrorType.BUSINESS;
        errorDetail.code = error.response.status;
        errorDetail.data = error.response.data;
      } else if (error.code === "ECONNABORTED") {
        errorDetail.type = ErrorType.TIMEOUT;
      } else {
        errorDetail.type = ErrorType.NETWORK;
      }
    }

    return errorDetail;
  }

  private async setupInterceptors(): Promise<void> {
    // 请求拦截器
    this.axiosInstance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        try {
          // 检查网络状态
          const isConnected = await this.checkNetworkConnection();
          if (!isConnected) {
            throw new HttpError(
              i18next.t("http.errors.network.unavailable"),
              ErrorType.NETWORK
            );
          }

          // 从本地存储获取 token
          let token = null;
          if (Platform.OS === "web") {
            token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
          } else {
            token = await getItemAsync(AUTH_TOKEN_KEY);
          }

          if (token) {
            config.headers.token = `${token}`;
          }
          const language = await getStoredLanguage();
          if (language) {
            config.headers["Accept-Language"] = LANGUAGES[language].code;
          }

          return config;
        } catch (error) {
          return Promise.reject(
            error instanceof HttpError
              ? error
              : new HttpError(
                  i18next.t("http.errors.network.requestFailed"),
                  ErrorType.NETWORK
                )
          );
        }
      },
      (error: Error) => {
        return Promise.reject(
          new HttpError(
            i18next.t("http.errors.network.requestFailed"),
            ErrorType.NETWORK
          )
        );
      }
    );

    // 响应拦截器
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        const apiResponse = response.data as ApiResponse;
        const requestConfig = response.config as InternalAxiosRequestConfig &
          RequestConfig;

        // 判断是否需要拦截错误
        const shouldInterceptError =
          requestConfig.interceptError ??
          this.globalConfig.interceptBusinessError;
        const successCode = this.globalConfig.successCode;
        const allowedCodes = requestConfig.businessCodes || [successCode];
        // 处理业务错误
        if (shouldInterceptError && !allowedCodes.includes(apiResponse.code)) {
          throw new HttpError(
            apiResponse.message || i18next.t("http.errors.business.failed"),
            ErrorType.BUSINESS,
            response,
            apiResponse.code,
            apiResponse.data
          );
        }

        return response;
      },
      async (error: AxiosError) => {
        let httpError: HttpError;
        if (error.response) {
          const status = error.response.status;
          const apiResponse = error.response.data as ApiResponse;
          if (status === 401 || apiResponse.code === 10104) {
            // 清除本地 token
            if (Platform.OS === "web") {
              await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
            } else {
              await deleteItemAsync(AUTH_TOKEN_KEY);
            }

            httpError = new HttpError(
              apiResponse?.message || i18next.t("http.errors.auth.expired"),
              ErrorType.AUTH,
              error.response,
              status,
              apiResponse?.data
            );

            // 发送未授权事件而不是直接调用 store
            eventBus.emit(HTTP_EVENTS.UNAUTHORIZED);
          } else {
            httpError = new HttpError(
              apiResponse?.message ||
                i18next.t("http.errors.business.serverError"),
              ErrorType.BUSINESS,
              error.response,
              status,
              apiResponse?.data
            );
          }
        } else if (error.code === "ECONNABORTED") {
          httpError = new HttpError(
            i18next.t("http.errors.network.timeout"),
            ErrorType.TIMEOUT
          );
        } else {
          httpError = new HttpError(
            i18next.t("http.errors.network.requestFailed"),
            ErrorType.NETWORK
          );
        }

        return Promise.reject(httpError);
      }
    );
  }

  private async handleRequestError(
    error: any,
    url?: string,
    requestConfig?: RequestConfig
  ): Promise<ApiResponse<any>> {
    let errorDetail: ErrorDetail;

    try {
      errorDetail = this.createErrorDetail(error, url);

      // 判断是否需要拦截网络错误
      const shouldInterceptNetworkError =
        requestConfig?.interceptNetworkError ??
        this.globalConfig.interceptNetworkError;

      // 如果是网络错误且配置为不拦截，直接返回错误
      if (
        errorDetail.type === ErrorType.NETWORK &&
        !shouldInterceptNetworkError
      ) {
        return Promise.reject(errorDetail);
      }

      // 调用全局错误处理
      this.globalConfig.onError?.(errorDetail);

      // 构造API响应格式
      const apiResponse: ApiResponse<any> = {
        code: errorDetail.code || -1,
        message: errorDetail.message,
        data: errorDetail.data,
      };

      // 返回格式化的错误响应
      return apiResponse;
    } catch (e) {
      // 确保即使错误处理过程中出错，也不会导致应用崩溃
      console.error("Error handling failed:", e);
      errorDetail = {
        type: ErrorType.UNKNOWN,
        message: i18next.t("http.errors.unknown"),
        timestamp: Date.now(),
        url,
      };

      // 返回通用错误响应
      return {
        code: -1,
        message: i18next.t("http.errors.unknown"),
        data: null,
      };
    }
  }

  // GET 方法
  public async get<T = any>(
    url: string,
    params?: Record<string, any>,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.get<ApiResponse<T>>(url, {
        ...config,
        params: {
          ...params,
          ...config.params,
        },
      });

      // 验证响应数据结构
      if (!this.isValidResponse(response.data)) {
        throw new HttpError(
          i18next.t("http.errors.business.invalidResponse"),
          ErrorType.BUSINESS,
          response
        );
      }

      return response.data;
    } catch (error) {
      return this.handleRequestError(error, url, config);
    }
  }

  // POST 方法
  public async post<T = any>(
    url: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    try {
      let processedData;
      let requestConfig = { ...config };

      // 处理 FormData
      if (data instanceof FormData) {
        processedData = data;
        requestConfig.headers = {
          ...requestConfig.headers,
          "Content-Type": "multipart/form-data",
        };
      } else {
        // 处理普通 JSON 数据
        processedData = this.sanitizeRequestData(data);
      }
      const response = await this.axiosInstance.post<ApiResponse<T>>(
        url,
        processedData,
        requestConfig
      );

      if (!this.isValidResponse(response.data)) {
        throw new HttpError("", ErrorType.BUSINESS, response);
      }

      return response.data;
    } catch (error) {
      return this.handleRequestError(error, url, config);
    }
  }

  // PUT 方法
  public async put<T = any>(
    url: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    try {
      let processedData;
      let requestConfig = { ...config };

      // 处理 FormData
      if (data instanceof FormData) {
        processedData = data;
        requestConfig.headers = {
          ...requestConfig.headers,
          "Content-Type": "multipart/form-data",
        };
      } else {
        // 处理普通 JSON 数据
        processedData = this.sanitizeRequestData(data);
      }

      const response = await this.axiosInstance.put<ApiResponse<T>>(
        url,
        processedData,
        requestConfig
      );

      if (!this.isValidResponse(response.data)) {
        throw new HttpError("", ErrorType.BUSINESS, response);
      }

      return response.data;
    } catch (error) {
      return this.handleRequestError(error, url, config);
    }
  }

  // DELETE 方法
  public async delete<T = any>(
    url: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    try {
      let processedData;
      let requestConfig = { ...config };
      processedData = this.sanitizeRequestData(data);
      const response = await this.axiosInstance.delete<ApiResponse<T>>(url, {
        ...requestConfig,
        data: processedData, // 通过 data 配置项传递请求体数据
      });

      if (!this.isValidResponse(response.data)) {
        throw new HttpError("", ErrorType.BUSINESS, response);
      }

      return response.data;
    } catch (error) {
      return this.handleRequestError(error, url, config);
    }
  }

  // 验证响应数据结构
  private isValidResponse<T>(response: any): response is ApiResponse<T> {
    return (
      response &&
      typeof response === "object" &&
      "code" in response &&
      typeof response.code === "number" &&
      "message" in response &&
      typeof response.message === "string" &&
      "data" in response
    );
  }

  // 清理和验证请求数据
  private sanitizeRequestData(data: any): any {
    if (!data) return data;
    if (data instanceof FormData) return data;

    try {
      // 移除 undefined 值
      const cleanData = JSON.parse(JSON.stringify(data));
      return cleanData;
    } catch (error) {
      console.warn("Data sanitization failed:", error);
      return data;
    }
  }

  // 设置认证 token
  public static async setToken(token: string): Promise<void> {
    try {
      if (Platform.OS === "web") {
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      } else {
        await setItemAsync(AUTH_TOKEN_KEY, token);
      }
    } catch (error) {
      console.error("Failed to save auth token:", error);
    }
  }

  // 清除认证 token
  public static async clearToken(): Promise<void> {
    try {
      if (Platform.OS === "web") {
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      } else {
        await deleteItemAsync(AUTH_TOKEN_KEY);
      }
    } catch (error) {
      console.error("Failed to clear auth token:", error);
    }
  }
}

// 获取 token
export async function getToken() {
  try {
    if (Platform.OS === "web") {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } else {
      return await getItemAsync(AUTH_TOKEN_KEY);
    }
  } catch (error) {
    console.error("Failed to get auth token:", error);
    return null;
  }
}

export async function setToken(token: string) {
  await HttpRequest.setToken(token);
}

export async function clearToken() {
  await HttpRequest.clearToken();
}
