import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { AuthClient } from "../lib/auth-client"
import { authMutationKeys } from "../lib/auth-mutation-keys"
import { authQueryKeys } from "../lib/auth-query-keys"

export type SignUpEmailParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["signUp"]["email"]
>[0]

export type SignUpEmailOptions<TAuthClient extends AuthClient> = Omit<
  ReturnType<typeof signUpEmailOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/**
 * Mutation options factory for email/password sign-up.
 *
 * @param authClient - The Better Auth client.
 */
export function signUpEmailOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = authMutationKeys.signUp.email

  const mutationFn = (params: SignUpEmailParams<TAuthClient>) =>
    authClient.signUp.email({
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
