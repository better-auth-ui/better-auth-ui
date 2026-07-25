import type { apiKeyClient } from "@better-auth/api-key/client"
import type { passkeyClient } from "@better-auth/passkey/client"
import type {
  AdminClientOptions,
  adminClient,
  deviceAuthorizationClient,
  lastLoginMethodClient,
  magicLinkClient,
  multiSessionClient,
  organizationClient,
  usernameClient
} from "better-auth/client/plugins"
import type { createAuthClient } from "better-auth/react"

export type AuthClient = ReturnType<typeof createAuthClient>

// The per-plugin client types below are pure type-level declarations — no
// runtime code is emitted for them. This avoids relying on `/* @__PURE__ */`
// being honoured by every downstream bundler (RSC graphs, dev builds,
// Turbopack, older configs, etc.) and keeps the plugin packages out of
// consumers' runtime bundles entirely.

export type AdminAuthClient = ReturnType<
  typeof createAuthClient<{
    plugins: [ReturnType<typeof adminClient<AdminClientOptions>>]
  }>
>

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

/**
 * Unwraps a Better Auth client method's `data` payload.
 *
 * Pass the method type directly, e.g. `TAuthClient["getSession"]` or
 * `TAuthClient["passkey"]["listUserPasskeys"]`. Keeping it method-typed
 * (instead of a path-string utility) preserves IntelliSense on the derived
 * types.
 */
export type InferData<TMethod> = TMethod extends (
  ...args: infer _Args
) => Promise<infer TResult extends { data: unknown }>
  ? TResult["data"]
  : never
