import { initializeFirebase } from "@/firebase.config";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../store";
import {
  initializeUserData,
  selectError,
  selectIsInitialized,
  selectIsLoading,
} from "../store/slices/userSlice";

interface InitializationWrapperProps {
  children: React.ReactNode;
}

export function InitializationWrapper({
  children,
}: InitializationWrapperProps) {
  const dispatch = useAppDispatch();
  const isInitialized = useAppSelector(selectIsInitialized);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const {t} = useTranslation()

  useEffect(() => {
    // 初始化 Firebase
    try {
      initializeFirebase();
    } catch (error) {
      console.error("Firebase 初始化失败:", error);
    }
  }, []);

  useEffect(() => {
    if (!isInitialized && !isLoading) {
      dispatch(initializeUserData());
    }
  }, [dispatch, isInitialized, isLoading]);

  // if (error) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "red" }}>
  //       <Text style={{ color: "red", marginBottom: 10 }}>初始化失败</Text>
  //       <Text style={{ color: "gray" }}>{error}</Text>
  //       <Button mode="contained" onPress={() => dispatch(initializeUserData())}>重试</Button>
  //     </View>
  //   );
  // }

  // if (!isInitialized || isLoading) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
  //       <ActivityIndicator size="large" color="#007AFF" />
  //       <Text style={{ marginTop: 10, color: "gray" }}>
  //         {t("common.loading")}
  //       </Text>
  //     </View>
  //   );
  // }

  return <>{children}</>;
}
