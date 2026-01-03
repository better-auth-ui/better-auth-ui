import type { AnyAuthConfig } from "@better-auth-ui/react"
import { useCallback, useState } from "react"

import { useAuth } from "../auth/use-auth"
import { useListSessions } from "./use-list-sessions"

/**
 * Provides functionality to revoke an active session.
 * This is used to revoke sessions from the sessions list (devices where user is logged in).
 *
 * @param config - Optional auth configuration forwarded to the auth hook
 * @returns An object containing the revoking session token and a function to revoke a session
 */
export function useRevokeSession(config?: AnyAuthConfig) {
  const { authClient, toast } = useAuth(config)
  const { refetch } = useListSessions(config)

  const [revokingSession, setRevokingSession] = useState<string | null>(null)

  const revokeSession = useCallback(
    async (sessionToken: string) => {
      setRevokingSession(sessionToken)

      const { error } = await authClient.revokeSession({
        token: sessionToken
      })

      if (error) {
        toast.error(error.message || error.statusText)
      } else {
        await refetch()
      }

      setRevokingSession(null)
    },
    [authClient, refetch, toast]
  )

  return { revokingSession, revokeSession }
}
