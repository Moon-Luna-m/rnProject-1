import { StripeProvider as Provier } from "@stripe/stripe-react-native";
import Constants from "expo-constants";
import { Slot } from "expo-router";

export default function StripeProvider() {
  
  return (
    <Provier
      publishableKey={Constants.expoConfig?.extra?.stripe.publidKey}
      urlScheme="exp://192.168.5.68:8081"
    >
      <Slot />
    </Provier>
  );
}
