import {
  type AuthClient,
  type RevokeOtherSessionsOptions,
  revokeOtherSessionsOptions
} from "@better-auth-ui/core"
import { type QueryClient, useMutation } from "@tanstack/react-query"
import { useSession } from "../queries/use-session"

/** Create a mutation for revoking every session except the current one. */
export function useRevokeOtherSessions<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: RevokeOtherSessionsOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)

  return useMutation(
    {
      ...revokeOtherSessionsOptions(authClient, session?.user.id),
      ...options
    },
    queryClient
  )
}
