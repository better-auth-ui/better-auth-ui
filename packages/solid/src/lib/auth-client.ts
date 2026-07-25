import type { apiKeyClient } from "@better-auth/api-key/client"
import type { passkeyClient } from "@better-auth/passkey/client"
import type {
  deviceAuthorizationClient,
  lastLoginMethodClient,
  magicLinkClient,
  multiSessionClient,
  organizationClient,
  usernameClient
} from "better-auth/client/plugins"
import type { createAuthClient } from "better-auth/solid"

export type AuthClient = ReturnType<typeof createAuthClient>

export type MagicLinkAuthClient = ReturnType<
  typeof createAuthClient<{ plugins: [ReturnType<typeof magicLinkClient>] }>
>

export type DeviceAuthorizationAuthClient = ReturnType<
  typeof createAuthClient<{
    plugins: [ReturnType<typeof deviceAuthorizationClient>]
  }>
>

export type LastLoginMethodAuthClient = ReturnType<
  typeof createAuthClient<{
    plugins: [ReturnType<typeof lastLoginMethodClient>]
  }>
>

export type MultiSessionAuthClient = ReturnType<
  typeof createAuthClient<{ plugins: [ReturnType<typeof multiSessionClient>] }>
>

export type PasskeyAuthClient = ReturnType<
  typeof createAuthClient<{ plugins: [ReturnType<typeof passkeyClient>] }>
>

export type ApiKeyAuthClient = ReturnType<
  typeof createAuthClient<{ plugins: [ReturnType<typeof apiKeyClient>] }>
>

export type UsernameAuthClient = ReturnType<
  typeof createAuthClient<{ plugins: [ReturnType<typeof usernameClient>] }>
>

export type OrganizationAuthClient = ReturnType<
  typeof createAuthClient<{
    plugins: [ReturnType<typeof organizationClient<object>>]
  }>
>

export type InferData<TMethod> = TMethod extends (
  ...args: infer _Args
) => Promise<infer TResult extends { data: unknown }>
  ? TResult["data"]
  : never
