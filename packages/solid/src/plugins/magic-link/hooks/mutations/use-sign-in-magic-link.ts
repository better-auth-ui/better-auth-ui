import type { MagicLinkAuthClient } from "@better-auth-ui/core/plugins/magic-link"
import {
  type SignInMagicLinkOptions,
  signInMagicLinkOptions
} from "@better-auth-ui/core/plugins/magic-link"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseSignInMagicLinkOptions<TAuthClient extends MagicLinkAuthClient> =
  Accessor<SignInMagicLinkOptions<TAuthClient>>

export function useSignInMagicLink<TAuthClient extends MagicLinkAuthClient>(
  authClient: TAuthClient,
  options?: UseSignInMagicLinkOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...signInMagicLinkOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
