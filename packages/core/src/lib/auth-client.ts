import type { createAuthClient } from "better-auth/client"

// Sanitizes AuthClient to be agnostic.
export type OmitUseKeys<T> = {
  [K in keyof T as K extends `use${string}` ? never : K]: T[K]
}

export type AuthClient = Pick<
  OmitUseKeys<ReturnType<typeof createAuthClient>>,
  "getSession"
>

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
