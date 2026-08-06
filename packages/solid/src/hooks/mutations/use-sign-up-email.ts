import {
  type AuthClient,
  type SignUpEmailOptions,
  signUpEmailOptions
} from "@better-auth-ui/core"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseSignUpEmailOptions<TAuthClient extends AuthClient> = Accessor<
  SignUpEmailOptions<TAuthClient>
>

export function useSignUpEmail<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UseSignUpEmailOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...signUpEmailOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
