import { selectIsLoading, selectUserInfo } from "@/store/slices/userSlice";
import { Redirect, Stack } from "expo-router";
import { Text } from "react-native";
import { useSelector } from "react-redux";

export default function AppLayout() {
  const userInfo = useSelector(selectUserInfo);
  const loading = useSelector(selectIsLoading);

  if (loading) {
    return <Text></Text>;
  }

  if (!userInfo) {
    return <Redirect href="/user/signIn" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="(tabs)"
    />
  );
}
