import {
  type AuthClient,
  type SignInEmailOptions,
  signInEmailOptions
} from "@better-auth-ui/core"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseSignInEmailOptions<TAuthClient extends AuthClient> = Accessor<
  SignInEmailOptions<TAuthClient>
>

export function useSignInEmail<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UseSignInEmailOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...signInEmailOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
