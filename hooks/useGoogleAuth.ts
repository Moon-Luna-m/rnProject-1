import { AUTH_CONFIG } from "@/config/auth";
import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Alert, Platform } from "react-native";
import appJson from "../app.config";

if (Platform.OS === "web") {
  WebBrowser.maybeCompleteAuthSession();
}

// 配置 Google OAuth 2.0 scope
const GOOGLE_SCOPES = ["profile", "email"] as const;

// 获取 OAuth 回调地址
const getOAuthRedirectUri = () => {
  if (__DEV__) {
    // 使用 ngrok URL 作为回调地址
    if (Platform.OS === "web") {
      return Constants.expoConfig?.extra?.google?.authCallback;
    } else {
      const ngrokUrl = Constants.expoConfig?.extra?.google?.ngrokUrl;
      const redirectUri = `${ngrokUrl}/oauth2/callback/google`;
      return redirectUri;
    }
  }

  return makeRedirectUri({
    scheme: appJson.expo.scheme,
    path: "oauth2/callback/google",
  });
};

export interface GoogleUserInfo {
  email: string;
  family_name: string;
  given_name: string;
  id: string;
  locale: string;
  name: string;
  picture: string;
  verified_email: boolean;
}

export function useGoogleAuth() {
  const [userInfo, setUserInfo] = useState<GoogleUserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const redirectUri = getOAuthRedirectUri();

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: AUTH_CONFIG.google.appClientId,
    iosClientId: AUTH_CONFIG.google.appClientId,
    webClientId: AUTH_CONFIG.google.webClientId,
    scopes: [...GOOGLE_SCOPES] as string[],
    redirectUri,
    usePKCE: !Platform.OS.match(/web/), // Web 端不使用 PKCE
    responseType: Platform.OS === "web" ? "token" : "code", // Web 端直接使用 implicit flow
  });

  // 使用授权码交换访问令牌
  const exchangeCodeForToken = async (code: string) => {
    try {
      const tokenEndpoint = "https://oauth2.googleapis.com/token";

      if (!Platform.OS.match(/web/) && !request?.codeVerifier) {
        throw new Error("Missing code verifier");
      }

      let params = null;
      if (Platform.OS === "web") {
        params = new URLSearchParams({
          code,
          client_id: AUTH_CONFIG.google.webClientId,
          client_secret: AUTH_CONFIG.google.webClientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        });
      } else {
        params = new URLSearchParams({
          code,
          client_id: AUTH_CONFIG.google.appClientId,
          client_secret: AUTH_CONFIG.google.appClientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
          code_verifier: request?.codeVerifier || "",
        });
      }

      console.log("URLSearchParams 字符串:", params.toString());

      const response = await fetch(tokenEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Token exchange error response:", errorData);
        throw new Error(
          `Token exchange failed: ${response.status} ${errorData}`
        );
      }

      const data = await response.json();
      // console.log("Token exchange response:", data);
      return data;
    } catch (error) {
      console.error("Exchange code for token error:", error);
      throw error;
    }
  };

  // 获取用户信息
  const fetchUserInfo = async (accessToken: string) => {
    const response = await fetch("https://www.googleapis.com/userinfo/v2/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user info");
    }

    return response.json();
  };

  const handleGoogleResponse = async (authResponse: any) => {
    try {
      console.log("处理认证响应:", authResponse);

      if (authResponse?.type === "success") {
        setLoading(true);

        let accessToken = null;
        if (Platform.OS === "web") {
          // Web 端直接从响应中获取 access_token
          accessToken = authResponse.params?.access_token;
          if (!accessToken) {
            throw new Error("未收到访问令牌");
          }
        } else {
          // 移动端需要用 code 换取 token
          const { code } = authResponse.params;
          if (!code) {
            console.error("未找到授权码:", authResponse);
            throw new Error("未找到授权码");
          }
          console.log("获取到授权码:", code);
          console.log("开始交换访问令牌...");
          const tokenData = await exchangeCodeForToken(code);
          accessToken = tokenData.access_token;
        }

        console.log("获取到访问令牌:", accessToken);

        // 使用访问令牌获取用户信息
        console.log("开始获取用户信息...");
        const userData = await fetchUserInfo(accessToken);
        console.log("获取到用户信息:", userData);

        setUserInfo(userData);
      }
    } catch (e) {
      console.error("Google 登录错误:", e);
      Alert.alert(
        "登录失败",
        e instanceof Error ? e.message : "无法完成 Google 登录"
      );
      setError(e instanceof Error ? e : new Error("Google login failed"));
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      setError(null);
      console.log("重定向 URI:", redirectUri);

      if (!request) {
        throw new Error("认证请求未准备好");
      }

      const result = await promptAsync();
      console.log("登录结果:", result);
      await handleGoogleResponse(result);
    } catch (e) {
      console.error("启动登录失败:", e);
      Alert.alert(
        "登录失败",
        e instanceof Error ? e.message : "无法启动登录流程"
      );
      setError(
        e instanceof Error ? e : new Error("Failed to start Google login")
      );
    }
  };

  const logout = () => {
    setUserInfo(null);
  };

  return {
    login,
    logout,
    userInfo,
    loading,
    error,
  };
}
