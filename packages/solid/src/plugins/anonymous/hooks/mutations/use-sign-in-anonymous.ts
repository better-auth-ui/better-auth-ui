import {
  type AnonymousAuthClient,
  type SignInAnonymousOptions,
  signInAnonymousOptions
} from "@better-auth-ui/core/plugins/anonymous"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseSignInAnonymousOptions<TAuthClient extends AnonymousAuthClient> =
  Accessor<SignInAnonymousOptions<TAuthClient>>

/** Create a mutation for signing in with an anonymous guest account. */
export function useSignInAnonymous<TAuthClient extends AnonymousAuthClient>(
  authClient: TAuthClient,
  options?: UseSignInAnonymousOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...signInAnonymousOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
