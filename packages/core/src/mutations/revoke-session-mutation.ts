import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { AuthClient } from "../lib/auth-client"
import { authMutationKeys } from "../lib/auth-mutation-keys"
import { authQueryKeys } from "../lib/auth-query-keys"

export type RevokeSessionParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["revokeSession"]
>[0]

export type RevokeSessionOptions<TAuthClient extends AuthClient> = Omit<
  ReturnType<typeof revokeSessionOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/**
 * Mutation options factory for revoking a user session.
 *
 * @param authClient - The Better Auth client.
 */
export function revokeSessionOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  userId?: string
) {
  const mutationKey = authMutationKeys.revokeSession

  const mutationFn = (params: RevokeSessionParams<TAuthClient>) =>
    authClient.revokeSession({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey,
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
