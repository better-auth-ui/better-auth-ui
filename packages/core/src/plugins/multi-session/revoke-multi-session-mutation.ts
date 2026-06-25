import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import { authMutationOptions } from "../../lib/auth-mutation-options"
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
  return {
    ...authMutationOptions(
      authClient.multiSession.revoke,
      multiSessionMutationKeys.revoke
    ),
    meta: {
      awaits: [multiSessionQueryKeys.lists(userId)]
    }
  } as MutationOptions<
    Awaited<ReturnType<TAuthClient["multiSession"]["revoke"]>>,
    BetterFetchError,
    RevokeMultiSessionParams<TAuthClient>
  >
}
