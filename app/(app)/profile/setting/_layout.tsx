import { Stack } from "expo-router";

export default function SettingLayout() {
  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
