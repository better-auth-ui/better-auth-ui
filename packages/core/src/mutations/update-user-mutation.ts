import { authMutationKeys } from "@better-auth-ui/core"
import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/react"

import type { AuthClient } from "../lib/auth-client"

export type UpdateUserParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["updateUser"]
>[0]

export type UpdateUserOptions<TAuthClient extends AuthClient> = Omit<
  ReturnType<typeof updateUserOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/**
 * Mutation options factory for updating the authenticated user's profile.
 *
 * @param authClient - The Better Auth client.
 */
export function updateUserOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = authMutationKeys.updateUser

  const mutationFn = (params: UpdateUserParams<TAuthClient>) =>
    authClient.updateUser({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey,
    mutationFn
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
