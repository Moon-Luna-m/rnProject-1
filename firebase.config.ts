import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { getApp, getApps, initializeApp } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebase?.apiKey,
  authDomain: Constants.expoConfig?.extra?.firebase?.authDomain,
  projectId: Constants.expoConfig?.extra?.firebase?.projectId,
  storageBucket: Constants.expoConfig?.extra?.firebase?.storageBucket,
  messagingSenderId: Constants.expoConfig?.extra?.firebase?.messagingSenderId,
  appId: Constants.expoConfig?.extra?.firebase?.appId,
};

const getReactNativePersistence = (firebaseAuth as any).getReactNativePersistence;

// 初始化 Firebase
export const initializeFirebase = () => {
  try {
    // 检查是否已经初始化
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

    if (Platform.OS !== 'web') {
      try {
        // 尝试获取现有的 auth 实例
        return firebaseAuth.getAuth(app);
      } catch (error) {
        // 如果不存在，则初始化新的 auth 实例
        return firebaseAuth.initializeAuth(app, {
          persistence: getReactNativePersistence(ReactNativeAsyncStorage),
        });
      }
    }
    return app;
  } catch (error) {
    console.error("Firebase 初始化错误:", error);
    throw error;
  }
}; 