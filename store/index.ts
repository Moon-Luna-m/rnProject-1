import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import notificationReducer from './slices/notificationSlice';
import tabIconsReducer from './slices/tabIconsSlice';
import userReducer from './slices/userSlice';

// 创建根 reducer
const rootReducer = combineReducers({
  notification: notificationReducer,
  user: userReducer,
  tabIcons: tabIconsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

// 创建 store 实例
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略某些非序列化的 action 或 state 路径
        ignoredActions: ['notification/showNotification'],
        ignoredPaths: ['notification.details'],
      },
    }),
});

export type AppDispatch = typeof store.dispatch;

// 使用贯穿整个应用的类型化版本的 hooks
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store; 