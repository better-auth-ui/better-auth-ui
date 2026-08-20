import {
  type AuthClient,
  type RevokeSessionsOptions,
  revokeSessionsOptions
} from "@better-auth-ui/core"
import { type QueryClient, useMutation } from "@tanstack/react-query"

/** Create a mutation for revoking all sessions, including the current one. */
export function useRevokeSessions<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: RevokeSessionsOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    {
      ...revokeSessionsOptions(authClient),
      ...options
    },
    queryClient
  )
}
