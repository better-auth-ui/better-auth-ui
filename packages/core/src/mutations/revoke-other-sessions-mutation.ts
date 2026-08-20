import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { AuthClient } from "../lib/auth-client"
import { authMutationKeys } from "../lib/auth-mutation-keys"
import { authQueryKeys } from "../lib/auth-query-keys"

export type RevokeOtherSessionsParams<TAuthClient extends AuthClient> =
  Parameters<TAuthClient["revokeOtherSessions"]>[0]

export type RevokeOtherSessionsOptions<TAuthClient extends AuthClient> = Omit<
  ReturnType<typeof revokeOtherSessionsOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/** Mutation options factory for revoking every session except the current one. */
export function revokeOtherSessionsOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  userId?: string
) {
  const mutationFn = (
    // biome-ignore lint/suspicious/noConfusingVoidType: void allows no-arg mutate
    params?: RevokeOtherSessionsParams<TAuthClient> | void
  ) =>
    authClient.revokeOtherSessions({
      ...(params ?? {}),
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey: authMutationKeys.revokeOtherSessions,
    mutationFn,
    meta: {
      awaits: [authQueryKeys.listSessions(userId)]
    }
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
