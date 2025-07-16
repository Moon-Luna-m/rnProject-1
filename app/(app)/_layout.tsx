import { selectIsLoading, selectUserInfo } from "@/store/slices/userSlice";
import { Redirect, router, Stack, useGlobalSearchParams } from "expo-router";
import { Platform, Text } from "react-native";
import { useSelector } from "react-redux";
import "../../global.css";

export default function AppLayout() {
  const userInfo = useSelector(selectUserInfo);
  const loading = useSelector(selectIsLoading);
  const query = useGlobalSearchParams();

  if (loading) {
    return <Text></Text>;
  }

  if (!userInfo) {
    if (query.redirect) {
      if (Platform.OS === "web") {
        sessionStorage.setItem("url", query.redirect as string);
      }
    }
    return <Redirect href="/user/signIn" />;
  }

  if (Platform.OS === "web") {
    const redirect = sessionStorage.getItem("url");

    if (redirect) {
      try {
        sessionStorage.removeItem("url");
      } catch (e) {
        console.log(e);
      }
      router.push(redirect as any);
      return null;
    }
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="(tabs)"
    >
      <Stack.Screen
        name="(home)/chat"
        options={{
          headerShown: false,
          animation: "fade_from_bottom",
          animationDuration: 200,
        }}
      />
    </Stack>
  );
}
