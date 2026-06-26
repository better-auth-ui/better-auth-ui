import {
  type RevokeMultiSessionOptions,
  revokeMultiSessionOptions
} from "@better-auth-ui/core/plugins/multi-session"
import { useMutation } from "@tanstack/solid-query"
import { useSession } from "../../../../hooks/queries/use-session"
import type { MultiSessionAuthClient } from "../../multi-session-auth-client"

export function useRevokeMultiSession<
  TAuthClient extends MultiSessionAuthClient
>(authClient: TAuthClient, options?: RevokeMultiSessionOptions<TAuthClient>) {
  const session = useSession(authClient)

  return useMutation(() => {
    const userId = session.data?.user.id

    return {
      ...revokeMultiSessionOptions(authClient, userId),
      ...options
    }
  })
}
