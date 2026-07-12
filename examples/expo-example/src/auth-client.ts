import { expoClient } from "@better-auth/expo/client"
import {
  magicLinkClient,
  multiSessionClient,
  organizationClient,
  usernameClient
} from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import * as SecureStore from "expo-secure-store"
import { Platform } from "react-native"

/**
 * Point this at your Better Auth server. On a simulator `localhost` works; on a
 * device set `EXPO_PUBLIC_API_URL` to your machine's LAN IP.
 */
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000"

/**
 * Better Auth client for Expo. The feature client plugins (organization,
 * multi-session, magic-link, username) mirror the server plugins and expose the
 * `authClient.organization.*` / `.multiSession.*` / … namespaces the matching
 * `@better-auth-ui/react-native` screens call. The `expoClient` plugin persists
 * the session in `expo-secure-store` on native; on web (`expo start --web`, used
 * here to preview the UI) SecureStore is unavailable, so it is omitted and the
 * browser's default cookie storage is used.
 */
export const authClient = createAuthClient({
  baseURL: `${API_URL}/api/auth`,
  plugins: [
    organizationClient(),
    multiSessionClient(),
    magicLinkClient(),
    usernameClient(),
    ...(Platform.OS === "web"
      ? []
      : [
          expoClient({
            scheme: "betterauthuiexpo",
            storagePrefix: "betterauthuiexpo",
            storage: SecureStore
          })
        ])
  ]
})
