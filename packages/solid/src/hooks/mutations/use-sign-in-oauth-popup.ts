import {
  type OAuthPopupAuthClient,
  type SignInOAuthPopupOptions,
  signInOAuthPopupOptions
} from "@better-auth-ui/core"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseSignInOAuthPopupOptions<
  TAuthClient extends OAuthPopupAuthClient
> = Accessor<SignInOAuthPopupOptions<TAuthClient>>

/** Create a mutation for Better Auth's experimental OAuth popup flow. */
export function useSignInOAuthPopup<TAuthClient extends OAuthPopupAuthClient>(
  authClient: TAuthClient,
  options?: UseSignInOAuthPopupOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...signInOAuthPopupOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
