import {
  type SignInUsernameOptions,
  signInUsernameOptions,
  type UsernameAuthClient
} from "@better-auth-ui/core/plugins/username"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseSignInUsernameOptions<TAuthClient extends UsernameAuthClient> =
  Accessor<SignInUsernameOptions<TAuthClient>>

export function useSignInUsername<TAuthClient extends UsernameAuthClient>(
  authClient: TAuthClient,
  options?: UseSignInUsernameOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...signInUsernameOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
