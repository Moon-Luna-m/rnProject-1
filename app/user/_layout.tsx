import { selectUserInfo } from "@/store/slices/userSlice";
import { Redirect, Stack } from "expo-router";
import { useSelector } from "react-redux";

export default function UserLayout() {
  const userInfo = useSelector(selectUserInfo);
  
  if (userInfo) {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }}></Stack>;
}
