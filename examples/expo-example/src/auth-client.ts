import { apiKeyClient } from "@better-auth/api-key/client"
import { ssoClient } from "@better-auth/sso/client"
import { expoClient } from "@better-auth/expo/client"
import {
  adminClient,
  anonymousClient,
  deviceAuthorizationClient,
  emailOTPClient,
  lastLoginMethodClient,
  phoneNumberClient,
  twoFactorClient,
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

export const authClient = createAuthClient({
  baseURL: `${API_URL}/api/auth`,
  plugins: [
    adminClient(),
    anonymousClient(),
    deviceAuthorizationClient(),
    emailOTPClient(),
    lastLoginMethodClient(),
    phoneNumberClient(),
    twoFactorClient(),
    ssoClient(),
    apiKeyClient(),
    organizationClient({
      teams: { enabled: true },
      dynamicAccessControl: { enabled: true }
    }),
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
