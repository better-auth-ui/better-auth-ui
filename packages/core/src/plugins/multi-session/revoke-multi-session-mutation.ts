import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { MultiSessionAuthClient } from "./multi-session-auth-client"
import { multiSessionMutationKeys } from "./multi-session-mutation-keys"
import { multiSessionQueryKeys } from "./multi-session-query-keys"

export type RevokeMultiSessionParams<
  TAuthClient extends MultiSessionAuthClient
> = Parameters<TAuthClient["multiSession"]["revoke"]>[0]

export type RevokeMultiSessionOptions<
  TAuthClient extends MultiSessionAuthClient
> = Omit<
  ReturnType<typeof revokeMultiSessionOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/**
 * Mutation options factory for revoking a multi-session session.
 *
 * @param authClient - The Better Auth multi-session client.
 * @param userId - The current signed-in user's ID. Used for cache partitioning.
 */
export function revokeMultiSessionOptions<
  TAuthClient extends MultiSessionAuthClient
>(authClient: TAuthClient, userId?: string) {
  const mutationKey = multiSessionMutationKeys.revoke

  const mutationFn = (params: RevokeMultiSessionParams<TAuthClient>) =>
    authClient.multiSession.revoke({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey,
    mutationFn,
    meta: {
      awaits: [multiSessionQueryKeys.lists(userId)]
    }
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
