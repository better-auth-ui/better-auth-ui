import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { AuthClient } from "../lib/auth-client"
import { authMutationKeys } from "../lib/auth-mutation-keys"
import { authQueryKeys } from "../lib/auth-query-keys"

export type ChangeEmailParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["changeEmail"]
>[0]

export type ChangeEmailOptions<TAuthClient extends AuthClient> = Omit<
  ReturnType<typeof changeEmailOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/**
 * Mutation options factory for changing the current user's email address.
 *
 * @param authClient - The Better Auth client.
 */
export function changeEmailOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = authMutationKeys.changeEmail

  const mutationFn = (params: ChangeEmailParams<TAuthClient>) =>
    authClient.changeEmail({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey,
    mutationFn,
    meta: {
      awaits: [authQueryKeys.session]
    }
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
