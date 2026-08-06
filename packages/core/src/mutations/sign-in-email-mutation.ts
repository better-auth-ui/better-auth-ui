import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { AuthClient } from "../lib/auth-client"
import { authMutationKeys } from "../lib/auth-mutation-keys"
import { authQueryKeys } from "../lib/auth-query-keys"

export type SignInEmailParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["signIn"]["email"]
>[0]

export type SignInEmailOptions<TAuthClient extends AuthClient> = Omit<
  ReturnType<typeof signInEmailOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/**
 * Mutation options factory for email/password sign-in.
 *
 * @param authClient - The Better Auth client.
 */
export function signInEmailOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = authMutationKeys.signIn.email

  const mutationFn = (params: SignInEmailParams<TAuthClient>) =>
    authClient.signIn.email({
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
