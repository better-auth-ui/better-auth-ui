import {
  type AuthClient,
  authQueryKeys,
  type RevokeSessionOptions,
  revokeSessionOptions
} from "@better-auth-ui/core"
import { useMutation } from "@tanstack/solid-query"
import { useSession } from "../../hooks/queries/use-session"

export type { RevokeSessionParams } from "@better-auth-ui/core"

export function useRevokeSession<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: RevokeSessionOptions<TAuthClient>
) {
  const session = useSession(authClient)

  return useMutation(() => {
    const userId = session.data?.user.id

    return {
      ...revokeSessionOptions(authClient),
      ...options,
      meta: {
        awaits: [authQueryKeys.listSessions(userId)]
      }
    }
  })
}

export const revokeSessionMutation = useRevokeSession
