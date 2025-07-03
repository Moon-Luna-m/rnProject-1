import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { eventBus } from "../../utils/eventBus";
import { HTTP_EVENTS } from "../../utils/http/request";
import { RootState } from "../index";
let storeInstance: any = null;
export interface NotificationState {
  message: string | null;
  type: "success" | "error" | "info" | "warning" | "loading" | "default" | null;
  visible: boolean;
  duration?: number | null; // null 表示手动控制，不自动隐藏
}

const initialState: NotificationState = {
  message: null,
  type: null, 
  visible: false,
  duration: 3000, // 默认显示3秒
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    showNotification: (
      state,
      action: PayloadAction<{
        message: string;
        type:
          | "success"
          | "error"
          | "info"
          | "warning"
          | "loading"
          | "NETWORK"
          | "TIMEOUT"
          | "BUSINESS"
          | "AUTH"
          | "default";
        duration?: number | null;
      }>
    ) => {
      state.message = action.payload.message;
      state.type =
        action.payload.type === "NETWORK" ||
        action.payload.type === "TIMEOUT" ||
        action.payload.type === "BUSINESS"
          ? "error"
          : action.payload.type === "AUTH"
          ? "warning"
          : (action.payload.type as NotificationState["type"]);
      state.duration = action.payload.duration ?? 3000;
      state.visible = true;
    },
    hideNotification: (state) => {
      state.visible = false;
      state.message = null;
      state.type = null;
    },
    manualShowNotification: (
      state,
      action: PayloadAction<{
        message: string;
        type: "success" | "error" | "info" | "warning" | "loading" | "default";
      }>
    ) => {
      state.message = action.payload.message;
      state.type = action.payload.type;
      state.duration = null; // 设置为 null，表示手动控制
      state.visible = true;
    },
  },
});

export const { showNotification, hideNotification, manualShowNotification } =
  notificationSlice.actions;

// Selector
export const selectNotification = (state: RootState) =>
  state.notification || initialState;

// 监听 HTTP 错误事件
eventBus.on(HTTP_EVENTS.ERROR, (error) => {
  if (!storeInstance) {
    storeInstance = require("../index").default;
  }
  storeInstance.dispatch(
    showNotification({
      message: error.message,
      type: error.type,
      duration: 3000,
    })
  );
});

export default notificationSlice.reducer;
