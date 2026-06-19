import type { apiKeyClient } from "@better-auth/api-key/client"
import type { passkeyClient } from "@better-auth/passkey/client"
import type { createAuthClient } from "better-auth/client"
import type {
  magicLinkClient,
  multiSessionClient,
  organizationClient,
  usernameClient
} from "better-auth/client/plugins"

// Sanitizes AuthClient to be agnostic.
export type OmitUseKeys<T> = {
  [K in keyof T as K extends `use${string}` ? never : K]: T[K]
}

export type AuthClient = OmitUseKeys<ReturnType<typeof createAuthClient>>

/**
 * Unwraps a Better Auth client method's `data` payload.
 *
 * Pass the method type directly, e.g. `TAuthClient["getSession"]` or
 * `TAuthClient["passkey"]["listUserPasskeys"]`. Keeping it method-typed
 * preserves IntelliSense on the derived types.
 */
export type InferData<TMethod> = TMethod extends (
  ...args: infer _Args
) => Promise<infer TResult extends { data: unknown }>
  ? TResult["data"]
  : never

export type MagicLinkAuthClient = OmitUseKeys<
  ReturnType<
    typeof createAuthClient<{ plugins: [ReturnType<typeof magicLinkClient>] }>
  >
>

export type MultiSessionAuthClient = OmitUseKeys<
  ReturnType<
    typeof createAuthClient<{
      plugins: [ReturnType<typeof multiSessionClient>]
    }>
  >
>

export type PasskeyAuthClient = OmitUseKeys<
  ReturnType<
    typeof createAuthClient<{ plugins: [ReturnType<typeof passkeyClient>] }>
  >
>

export type ApiKeyAuthClient = OmitUseKeys<
  ReturnType<
    typeof createAuthClient<{ plugins: [ReturnType<typeof apiKeyClient>] }>
  >
>

export type UsernameAuthClient = OmitUseKeys<
  ReturnType<
    typeof createAuthClient<{ plugins: [ReturnType<typeof usernameClient>] }>
  >
>

export type OrganizationAuthClient = OmitUseKeys<
  ReturnType<
    typeof createAuthClient<{
      plugins: [ReturnType<typeof organizationClient<object>>]
    }>
  >
>
