import {
  type AuthClient,
  type RequestPasswordResetOptions,
  requestPasswordResetOptions
} from "@better-auth-ui/core"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseRequestPasswordResetOptions<TAuthClient extends AuthClient> =
  Accessor<RequestPasswordResetOptions<TAuthClient>>

export function useRequestPasswordReset<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UseRequestPasswordResetOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...requestPasswordResetOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
