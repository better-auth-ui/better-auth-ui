import { expoClient } from "@better-auth/expo/client"
import { createAuthClient } from "better-auth/react"
import * as SecureStore from "expo-secure-store"
import { Platform } from "react-native"

/**
 * Point this at your Better Auth server. On a simulator `localhost` works; on a
 * device set `EXPO_PUBLIC_API_URL` to your machine's LAN IP.
 */
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000"

/**
 * Better Auth client for Expo. The `expoClient` plugin persists the session in
 * `expo-secure-store`; `@better-auth-ui/react-native` reads session state from
 * it via the shared react-query hooks. On web (`expo start --web`, used here to
 * preview the UI) SecureStore is unavailable, so the plugin is omitted and the
 * browser's default cookie storage is used.
 */
export const authClient = createAuthClient({
  baseURL: `${API_URL}/api/auth`,
  plugins:
    Platform.OS === "web"
      ? []
      : [
          expoClient({
            scheme: "betterauthuiexpo",
            storagePrefix: "betterauthuiexpo",
            storage: SecureStore
          })
        ]
})
