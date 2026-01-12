import { useAuth, useListSessions } from "@better-auth-ui/react"
import { useCallback, useState } from "react"

/**
 * Revokes an active user session and refreshes the sessions list on success.
 *
 * @returns An object with:
 * - `revokingSession` — the token of the session currently being revoked, or `null` if none.
 * - `revokeSession(sessionToken)` — revokes the session identified by `sessionToken`.
 */
export function useRevokeSession() {
  const { authClient, toast } = useAuth()
  const { refetch } = useListSessions()

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
