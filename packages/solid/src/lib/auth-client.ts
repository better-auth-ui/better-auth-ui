import type { apiKeyClient } from "@better-auth/api-key/client"
import type { passkeyClient } from "@better-auth/passkey/client"
import type { AuthClientFrom } from "@better-auth-ui/core"
import type {
  magicLinkClient,
  multiSessionClient,
  organizationClient,
  usernameClient
} from "better-auth/client/plugins"
import type { createAuthClient } from "better-auth/solid"

export type { AuthClientFrom, InferData } from "@better-auth-ui/core"

export type AuthClient = AuthClientFrom<typeof createAuthClient>

export type MagicLinkAuthClient = AuthClientFrom<
  typeof createAuthClient<{ plugins: [ReturnType<typeof magicLinkClient>] }>
>

export type MultiSessionAuthClient = AuthClientFrom<
  typeof createAuthClient<{ plugins: [ReturnType<typeof multiSessionClient>] }>
>

export type PasskeyAuthClient = AuthClientFrom<
  typeof createAuthClient<{ plugins: [ReturnType<typeof passkeyClient>] }>
>

export type ApiKeyAuthClient = AuthClientFrom<
  typeof createAuthClient<{ plugins: [ReturnType<typeof apiKeyClient>] }>
>

export type UsernameAuthClient = AuthClientFrom<
  typeof createAuthClient<{ plugins: [ReturnType<typeof usernameClient>] }>
>

export type OrganizationAuthClient = AuthClientFrom<
  typeof createAuthClient<{
    plugins: [ReturnType<typeof organizationClient<object>>]
  }>
>
