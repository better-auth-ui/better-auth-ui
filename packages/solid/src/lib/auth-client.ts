import type { apiKeyClient } from "@better-auth/api-key/client"
import type { oauthProviderClient } from "@better-auth/oauth-provider/client"
import type { passkeyClient } from "@better-auth/passkey/client"
import type {
  AdminClientOptions,
  adminClient,
  deviceAuthorizationClient,
  emailOTPClient,
  lastLoginMethodClient,
  magicLinkClient,
  multiSessionClient,
  oneTapClient,
  organizationClient,
  twoFactorClient,
  usernameClient
} from "better-auth/client/plugins"
import type { createAuthClient } from "better-auth/solid"

export type AuthClient = ReturnType<typeof createAuthClient>

export type AdminAuthClient = ReturnType<
  typeof createAuthClient<{
    plugins: [ReturnType<typeof adminClient<AdminClientOptions>>]
  }>
>

export type MagicLinkAuthClient = ReturnType<
  typeof createAuthClient<{ plugins: [ReturnType<typeof magicLinkClient>] }>
>

export type EmailOtpAuthClient = ReturnType<
  typeof createAuthClient<{ plugins: [ReturnType<typeof emailOTPClient>] }>
>

export type TwoFactorAuthClient = ReturnType<
  typeof createAuthClient<{ plugins: [ReturnType<typeof twoFactorClient>] }>
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

export type OneTapAuthClient = ReturnType<
  typeof createAuthClient<{ plugins: [ReturnType<typeof oneTapClient>] }>
>

export type PasskeyAuthClient = ReturnType<
  typeof createAuthClient<{ plugins: [ReturnType<typeof passkeyClient>] }>
>

export type ApiKeyAuthClient = ReturnType<
  typeof createAuthClient<{ plugins: [ReturnType<typeof apiKeyClient>] }>
>

export type OAuthProviderAuthClient = ReturnType<
  typeof createAuthClient<{
    plugins: [ReturnType<typeof oauthProviderClient>]
  }>
>

/**
 * Auth client typed with both plugins the OAuth account chooser needs.
 *
 * `oauthProviderClient()` forwards the signed authorization query and
 * `multiSessionClient()` lists and switches device sessions, so the chooser
 * gets exact endpoint types instead of a widening cast.
 */
export type OAuthProviderMultiSessionAuthClient = ReturnType<
  typeof createAuthClient<{
    plugins: [
      ReturnType<typeof oauthProviderClient>,
      ReturnType<typeof multiSessionClient>
    ]
  }>
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
