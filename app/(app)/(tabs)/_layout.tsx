import { CategoryModalProvider } from "@/components/providers/CategoryModalProvider";
import CategoryIcon from "@/components/tabs/CategoryIcon";
import CustomTab from "@/components/tabs/CustomTab";
import HomeIcon from "@/components/tabs/HomeIcon";
import ProfileIcon from "@/components/tabs/ProfileIcon";
import { createFontStyle } from "@/utils/typography";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AppLayout() {
  const insets = useSafeAreaInsets();

  return (
    <CategoryModalProvider>
      <Tabs
        initialRouteName="(home)/index"
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            minHeight: 64,
            paddingHorizontal: 24,
            paddingTop: 8,
            paddingBottom: 8 + insets.bottom,
            backgroundColor: "#FFFFFF",
          },
          tabBarButton: (props) => <CustomTab {...props} />,
          tabBarActiveTintColor: "#19DBF2",
          tabBarInactiveTintColor: "#0C0A09",
          tabBarLabelStyle: {
            fontSize: 12,
            ...createFontStyle("400"),
          },
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="(home)/index"
          options={{
            tabBarIcon: () => <HomeIcon />,
          }}
        />
        <Tabs.Screen
          name="category"
          options={{
            tabBarIcon: () => <CategoryIcon />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: () => <ProfileIcon />,
          }}
        />
      </Tabs>
    </CategoryModalProvider>
  );
}
