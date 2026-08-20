import {
  type AuthClient,
  type RevokeSessionsOptions,
  revokeSessionsOptions
} from "@better-auth-ui/core"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseRevokeSessionsOptions<TAuthClient extends AuthClient> = Accessor<
  RevokeSessionsOptions<TAuthClient>
>

export function useRevokeSessions<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UseRevokeSessionsOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...revokeSessionsOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
