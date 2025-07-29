import { useEffect } from "react";
import { Platform } from "react-native";

export default function OAuth2Callback() {
  useEffect(() => {
    if (!__DEV__ && Platform.OS === "web") {
      try {
        if (window.opener && window.location.hash) {
          window.opener.postMessage(window.location.href, "*");
          window.close();
        }
      } catch (err) {
        console.error("OAuth callback failed", err);
      }
    }
  }, []);

  return null;
}
