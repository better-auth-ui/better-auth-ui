import type { createAuthClient } from "better-auth/client"

export type AuthClientFrom<
  // biome-ignore lint/suspicious/noExplicitAny: createAuthClient factories use framework-specific option params
  TCreateAuthClient extends (...args: any[]) => unknown
> = ReturnType<TCreateAuthClient>

export type AuthClient = AuthClientFrom<typeof createAuthClient>

/**
 * Unwraps a Better Auth client method's `data` payload.
 *
 * Pass the method type directly, e.g. `TAuthClient["getSession"]`. Keeping it
 * method-typed preserves IntelliSense on the derived types.
 */
export type InferData<TMethod> = TMethod extends (
  ...args: infer _Args
) => Promise<infer TResult extends { data: unknown }>
  ? TResult["data"]
  : never
