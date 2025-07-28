import { initializeFirebase } from "@/firebase.config";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";
import { maybeCompleteAuthSession } from "expo-web-browser";
import {
  User as FirebaseUser,
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Platform } from "react-native";

initializeFirebase();

const auth = getAuth();

maybeCompleteAuthSession();

export function useGoogleAuth() {
  const { t } = useTranslation();
  const [userInfo, setUserInfo] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const redirectUri = __DEV__
    ? "http://localhost:8081/oauth2/callback/google"
    : Constants.expoConfig?.extra?.google.authCallback;
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: Constants.expoConfig?.extra?.google.webClientId,
    androidClientId: Constants.expoConfig?.extra?.google.androidClientId,
    scopes: ["profile", "email"],
    redirectUri,
    responseType: "id_token",
    usePKCE: true,
  });

  GoogleSignin.configure({
    webClientId: Constants.expoConfig?.extra?.google.webClientId,
  });

  const login = async () => {
    try {
      setLoading(true);
      setError(null);

      if (Platform.OS === "web") {
        if (!request) {
          throw new Error(t("auth.google.errors.requestNotReady"));
        }
        await promptAsync();
      } else {
        await GoogleSignin.hasPlayServices();
        await GoogleSignin.signIn();
        const { idToken, accessToken } = await GoogleSignin.getTokens();
        if (!idToken) {
          throw new Error(t("auth.google.errors.noIdToken"));
        }
        const credential = GoogleAuthProvider.credential(idToken, accessToken);
        const userCredential = await signInWithCredential(auth, credential);
        setUserInfo(userCredential.user);
      }
    } catch (e) {
      Alert.alert(
        t("auth.google.alerts.failed.title"),
        e instanceof Error ? e.message : t("auth.google.alerts.failed.message")
      );
      setError(
        e instanceof Error ? e : new Error(t("auth.google.errors.default"))
      );
    } finally {
      setLoading(false);
    }
  };

  const exchangeIdTokenForCredential = async (id_token: string) => {
    try {
      const credential = GoogleAuthProvider.credential(id_token);
      const userCredential = await signInWithCredential(auth, credential);
      setUserInfo(userCredential.user);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      exchangeIdTokenForCredential(id_token);
    }
  }, [response]);

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setUserInfo(null);
    } catch (e) {
      Alert.alert(
        t("auth.alerts.failed.title"),
        e instanceof Error ? e.message : t("auth.alerts.failed.message")
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    logout,
    userInfo,
    loading,
    error,
  };
}
