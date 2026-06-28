import {
  type AuthClient,
  type SignInSocialOptions,
  signInSocialOptions
} from "@better-auth-ui/core"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseSignInSocialOptions<TAuthClient extends AuthClient> = Accessor<
  SignInSocialOptions<TAuthClient>
>

export function useSignInSocial<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UseSignInSocialOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...signInSocialOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
