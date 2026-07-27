import { authQueryKeys } from "@better-auth-ui/core"
import { anonymousMutationKeys } from "@better-auth-ui/core/plugins"
import { type QueryClient, useMutation } from "@tanstack/react-query"

import type { AnonymousAuthClient } from "../../lib/auth-client"
import { authMutationOptions } from "../auth-mutation-options"

export type SignInAnonymousParams<TAuthClient extends AnonymousAuthClient> =
  Parameters<TAuthClient["signIn"]["anonymous"]>[0]

export type SignInAnonymousOptions<TAuthClient extends AnonymousAuthClient> =
  Omit<
    ReturnType<typeof signInAnonymousOptions<TAuthClient>>,
    "mutationKey" | "mutationFn" | "meta"
  >

/** Build mutation options for signing in with an anonymous guest account. */
export function signInAnonymousOptions<TAuthClient extends AnonymousAuthClient>(
  authClient: TAuthClient
) {
  return authMutationOptions(
    authClient.signIn.anonymous,
    anonymousMutationKeys.signIn
  )
}

/**
 * Sign in with a new anonymous guest account.
 *
 * The session query is refreshed before success callbacks run.
 */
export function useSignInAnonymous<TAuthClient extends AnonymousAuthClient>(
  authClient: TAuthClient,
  options?: SignInAnonymousOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    {
      ...signInAnonymousOptions(authClient),
      ...options,
      meta: {
        awaits: [authQueryKeys.session]
      }
    },
    queryClient
  )
}
