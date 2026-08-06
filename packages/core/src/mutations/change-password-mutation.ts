import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { AuthClient } from "../lib/auth-client"
import { authMutationKeys } from "../lib/auth-mutation-keys"

export type ChangePasswordParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["changePassword"]
>[0]

export type ChangePasswordOptions<TAuthClient extends AuthClient> = Omit<
  ReturnType<typeof changePasswordOptions<TAuthClient>>,
  "mutationKey" | "mutationFn"
>

/**
 * Mutation options factory for changing the authenticated user's password.
 *
 * @param authClient - The Better Auth client.
 */
export function changePasswordOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = authMutationKeys.changePassword

  const mutationFn = (params: ChangePasswordParams<TAuthClient>) =>
    authClient.changePassword({
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
