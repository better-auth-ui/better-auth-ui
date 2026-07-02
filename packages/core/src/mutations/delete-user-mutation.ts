import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"

import type { AuthClient } from "../lib/auth-client"
import { deleteUserMutationKeys } from "../plugins/delete-user/delete-user-mutation-keys"

export type DeleteUserParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["deleteUser"]
>[0]

export type DeleteUserOptions<TAuthClient extends AuthClient> = Omit<
  ReturnType<typeof deleteUserOptions<TAuthClient>>,
  "mutationKey" | "mutationFn"
>

/**
 * Mutation options factory for deleting the authenticated user's account.
 *
 * @param authClient - The Better Auth client.
 */
export function deleteUserOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = deleteUserMutationKeys.deleteUser

  const mutationFn = (params: DeleteUserParams<TAuthClient>) =>
    authClient.deleteUser({
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
