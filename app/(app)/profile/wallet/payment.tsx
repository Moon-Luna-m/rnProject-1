import StripePayment from "@/components/payment/StripePayment.web";
import { Redirect } from "expo-router";
import { Platform } from "react-native";

export default function Payment() {
  if (Platform.OS === "web") {
    return <StripePayment />;
  }
  return <Redirect href="/" />;
}
