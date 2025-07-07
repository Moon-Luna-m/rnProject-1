import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { eventBus } from "../../utils/eventBus";
import { clearToken, HTTP_EVENTS, HttpRequest } from "../../utils/http/request";

interface UserInfo {
  avatar: string;
  email: string;
  username: string;
  sex: number;
  balance: number;
  birthday: string;
  is_vip_active: boolean;
  vip_expire_at: string | null;
  vip: number;
  subscription_type: string;
}

interface UserState {
  userInfo: UserInfo | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  userInfo: null,
  loading: false,
  error: null,
  initialized: false,
  isAuthenticated: false,
};

// 获取 HTTP 实例
const http = HttpRequest.getInstance();

export const initializeUserData = createAsyncThunk(
  "user/initialize",
  async (_, { rejectWithValue }) => {
    try {
      let token = null;
      if (Platform.OS === "web") {
        token = await AsyncStorage.getItem("Authorization");
      } else {
        token = await SecureStore.getItemAsync("Authorization");
      }
      if (!token) {
        return rejectWithValue({
          message: "No token found",
          isAuthError: true,
        });
      }
      const response = await http.get<UserInfo>("/api/users/info");
      if (response.code !== 200) {
        return rejectWithValue({
          message: response.message,
          isAuthError: response.code === 401 || response.code === 10104,
        });
      }
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message:
          error instanceof Error ? error.message : "Failed to fetch user data",
        isAuthError: false,
      });
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserInfo: (state, action: PayloadAction<UserInfo>) => {
      state.userInfo = action.payload;
      state.loading = false;
      state.error = null;
      state.isAuthenticated = true;
    },
    updateUserInfo: (state, action: PayloadAction<Partial<UserInfo>>) => {
      if (state.userInfo) {
        state.userInfo = { ...state.userInfo, ...action.payload };
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearUserInfo: (state) => {
      state.userInfo = null;
      state.loading = false;
      state.error = null;
      state.initialized = false;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.userInfo = null;
      state.isAuthenticated = false;
      clearToken()
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeUserData.fulfilled, (state, action) => {
        state.userInfo = action.payload;
        state.loading = false;
        state.error = null;
        state.initialized = true;
        state.isAuthenticated = true;
      })
      .addCase(initializeUserData.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as {
          message: string;
          isAuthError: boolean;
        };
        state.error = payload.message;
        state.initialized = true; // 即使失败也标记为已初始化
        state.isAuthenticated = false;

        if (payload.isAuthError) {
          state.userInfo = null;
        }
      });
  },
});

export const {
  setUserInfo,
  setLoading,
  setError,
  clearUserInfo,
  updateUserInfo,
  logout,
} = userSlice.actions;

export const selectUserInfo = (state: { user: UserState }) =>
  state.user.userInfo;
export const selectIsLoading = (state: { user: UserState }) =>
  state.user.loading;
export const selectError = (state: { user: UserState }) => state.user.error;
export const selectIsInitialized = (state: { user: UserState }) =>
  state.user.initialized;

// 监听未授权事件
eventBus.on(HTTP_EVENTS.UNAUTHORIZED, () => {
  const store = require("../index").default;
  store.dispatch(logout());
});

export default userSlice.reducer;
