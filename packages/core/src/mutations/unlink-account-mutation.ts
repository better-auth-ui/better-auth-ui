import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { AuthClient } from "../lib/auth-client"
import { authMutationKeys } from "../lib/auth-mutation-keys"
import { authQueryKeys } from "../lib/auth-query-keys"

export type UnlinkAccountParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["unlinkAccount"]
>[0]

type UnlinkAccountMutationOptions<TAuthClient extends AuthClient> = ReturnType<
  typeof unlinkAccountOptions<TAuthClient>
>

export type UnlinkAccountOptions<TAuthClient extends AuthClient> = Omit<
  UnlinkAccountMutationOptions<TAuthClient>,
  "mutationKey" | "mutationFn" | "meta"
> & {
  meta?: Record<string, unknown>
}

/**
 * Mutation options factory for unlinking a social provider from the current user.
 *
 * @param authClient - The Better Auth client.
 */
export function unlinkAccountOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  userId?: string
) {
  const mutationKey = authMutationKeys.unlinkAccount

  const mutationFn = (params: UnlinkAccountParams<TAuthClient>) =>
    authClient.unlinkAccount({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey,
    mutationFn,
    meta: {
      awaits: [authQueryKeys.listAccounts(userId)]
    }
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
