import type { MultiSessionAuthClient } from "@better-auth-ui/core/plugins/multi-session"
import {
  type RevokeMultiSessionOptions,
  revokeMultiSessionOptions
} from "@better-auth-ui/core/plugins/multi-session"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseRevokeMultiSessionOptions<
  TAuthClient extends MultiSessionAuthClient
> = Accessor<RevokeMultiSessionOptions<TAuthClient>>

export function useRevokeMultiSession<
  TAuthClient extends MultiSessionAuthClient
>(
  authClient: TAuthClient,
  options?: UseRevokeMultiSessionOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useMutation(() => {
    const userId = session.data?.user.id

    return {
      ...revokeMultiSessionOptions(authClient, userId),
      ...(options?.() ?? {})
    }
  }, queryClient)
}
