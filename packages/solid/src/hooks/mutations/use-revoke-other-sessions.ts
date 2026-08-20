import {
  type AuthClient,
  type RevokeOtherSessionsOptions,
  revokeOtherSessionsOptions
} from "@better-auth-ui/core"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../queries/use-session"

export type UseRevokeOtherSessionsOptions<TAuthClient extends AuthClient> =
  Accessor<RevokeOtherSessionsOptions<TAuthClient>>

export function useRevokeOtherSessions<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UseRevokeOtherSessionsOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useMutation(
    () => ({
      ...revokeOtherSessionsOptions(authClient, session.data?.user.id),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
