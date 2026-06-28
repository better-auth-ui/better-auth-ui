import {
  type AuthClient,
  type SignOutOptions,
  signOutOptions
} from "@better-auth-ui/core"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseSignOutOptions<TAuthClient extends AuthClient> = Accessor<
  SignOutOptions<TAuthClient>
>

export function useSignOut<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UseSignOutOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...signOutOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
