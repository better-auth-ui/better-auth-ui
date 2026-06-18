import { authMutationKeys, authQueryKeys } from "@better-auth-ui/core"
import {
  mutationOptions,
  type QueryClient,
  useMutation
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/client"

import type { AuthClient } from "../../lib/auth-client"

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

  return mutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >({
    mutationKey,
    mutationFn
  })
}

/**
 * Create a mutation for email/password sign-up.
 *
 * On success, `MutationInvalidator` awaits invalidation of the session
 * query so the new session is refetched (see `meta.awaits`).
 *
 * @param authClient - The Better Auth client.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useSignUpEmail<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: SignUpEmailOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    {
      ...signUpEmailOptions(authClient),
      ...options,
      meta: {
        awaits: [authQueryKeys.session]
      }
    },
    queryClient
  )
}
