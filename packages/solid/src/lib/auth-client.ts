import type { createAuthClient } from "better-auth/solid"

export type AuthClient = ReturnType<typeof createAuthClient>

export type InferData<TMethod> = TMethod extends (
  ...args: infer _Args
) => Promise<infer TResult extends { data: unknown }>
  ? TResult["data"]
  : never
