import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TestLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="start/[id]"
        options={{
          presentation: "fullScreenModal",
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}

