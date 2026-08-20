import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { AuthClient } from "../lib/auth-client"
import { authMutationKeys } from "../lib/auth-mutation-keys"
import { authQueryKeys } from "../lib/auth-query-keys"

export type UpdateSessionParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["updateSession"]
>[0]

export type UpdateSessionOptions<TAuthClient extends AuthClient> = Omit<
  ReturnType<typeof updateSessionOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/** Mutation options factory for updating additional fields on the current session. */
export function updateSessionOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  const mutationFn = (params: UpdateSessionParams<TAuthClient>) =>
    authClient.updateSession({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey: authMutationKeys.updateSession,
    mutationFn,
    meta: {
      awaits: [authQueryKeys.session]
    }
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
