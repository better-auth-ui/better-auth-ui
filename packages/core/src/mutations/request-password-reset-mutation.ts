import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { AuthClient } from "../lib/auth-client"
import { authMutationKeys } from "../lib/auth-mutation-keys"

export type RequestPasswordResetParams<TAuthClient extends AuthClient> =
  Parameters<TAuthClient["requestPasswordReset"]>[0]

export type RequestPasswordResetOptions<TAuthClient extends AuthClient> = Omit<
  ReturnType<typeof requestPasswordResetOptions<TAuthClient>>,
  "mutationKey" | "mutationFn"
>

/**
 * Mutation options factory for requesting a password reset email.
 *
 * @param authClient - The Better Auth client.
 */
export function requestPasswordResetOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = authMutationKeys.requestPasswordReset

  const mutationFn = (params: RequestPasswordResetParams<TAuthClient>) =>
    authClient.requestPasswordReset({
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
