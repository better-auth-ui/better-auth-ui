import type {
  BetterAuthClientOptions,
  InferActions,
  InferClientAPI
} from "better-auth/client"

/**
 * Resolves the full client surface for a set of Better Auth client options:
 * the inferred server route API plus any client-only plugin actions.
 */
export type AuthClient<
  TOptions extends BetterAuthClientOptions = BetterAuthClientOptions
> = InferClientAPI<TOptions> & InferActions<TOptions>

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
