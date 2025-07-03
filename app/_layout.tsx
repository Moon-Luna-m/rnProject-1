import StripeProvider from "@/components/wallet/StripeProvider";
import { Providers } from "@/store/provider";
import i18n from "@/utils/i18n";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { I18nContext } from "react-i18next";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const [loaded] = useFonts({
    outFitBold: require("../assets/fonts/Outfit-Bold.ttf"),
    outFitMedium: require("../assets/fonts/Outfit-Medium.ttf"),
    outFitRegular: require("../assets/fonts/Outfit-Regular.ttf"),
    outFitSemiBold: require("../assets/fonts/Outfit-SemiBold.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <I18nContext.Provider value={{ i18n }}>
          <Providers>
            <PaperProvider>
              <ThemeProvider
                value={Object.assign(DefaultTheme, {
                  colors: {
                    ...DefaultTheme.colors,
                    background: "white",
                  },
                })}
              >
                <StripeProvider />
              </ThemeProvider>
            </PaperProvider>
          </Providers>
        </I18nContext.Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
