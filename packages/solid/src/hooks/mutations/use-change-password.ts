import {
  type AuthClient,
  type ChangePasswordOptions,
  changePasswordOptions
} from "@better-auth-ui/core"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseChangePasswordOptions<TAuthClient extends AuthClient> = Accessor<
  ChangePasswordOptions<TAuthClient>
>

export function useChangePassword<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UseChangePasswordOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...changePasswordOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
