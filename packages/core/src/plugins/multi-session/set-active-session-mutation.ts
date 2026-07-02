import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import { authQueryKeys } from "../../lib/auth-query-keys"
import type { MultiSessionAuthClient } from "./multi-session-auth-client"
import { multiSessionMutationKeys } from "./multi-session-mutation-keys"
import { multiSessionQueryKeys } from "./multi-session-query-keys"

export type SetActiveSessionParams<TAuthClient extends MultiSessionAuthClient> =
  Parameters<TAuthClient["multiSession"]["setActive"]>[0]

export type SetActiveSessionOptions<
  TAuthClient extends MultiSessionAuthClient
> = Omit<
  ReturnType<typeof setActiveSessionOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/**
 * Mutation options factory for setting the active multi-session session.
 *
 * @param authClient - The Better Auth multi-session client.
 * @param userId - The current signed-in user's ID. Used for cache partitioning.
 */
export function setActiveSessionOptions<
  TAuthClient extends MultiSessionAuthClient
>(authClient: TAuthClient, userId?: string) {
  const mutationKey = multiSessionMutationKeys.setActive

  const mutationFn = (params: SetActiveSessionParams<TAuthClient>) =>
    authClient.multiSession.setActive({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey,
    mutationFn,
    meta: {
      awaits: [authQueryKeys.session, multiSessionQueryKeys.lists(userId)]
    }
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
