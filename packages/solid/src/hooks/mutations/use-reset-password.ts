import {
  type AuthClient,
  type ResetPasswordOptions,
  resetPasswordOptions
} from "@better-auth-ui/core"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseResetPasswordOptions<TAuthClient extends AuthClient> = Accessor<
  ResetPasswordOptions<TAuthClient>
>

export function useResetPassword<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UseResetPasswordOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...resetPasswordOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
