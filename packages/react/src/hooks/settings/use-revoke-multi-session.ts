import { useAuth, useListDeviceSessions } from "@better-auth-ui/react"
import { useCallback, useState } from "react"

/**
 * Hook to revoke a device session in multi-session mode.
 *
 * @returns An object with `revokingSession` and `revokeSession(sessionToken)`:
 * - `revokingSession` — the session token currently being revoked, or `null`.
 * - `revokeSession(sessionToken)` — function that revokes the session identified by `sessionToken`.
 */
export function useRevokeMultiSession() {
  const { authClient, toast } = useAuth()
  const { refetch } = useListDeviceSessions()
  const [revokingSession, setRevokingSession] = useState<string | null>(null)

  const revokeSession = useCallback(
    async (sessionToken: string) => {
      setRevokingSession(sessionToken)

      const { error } = await authClient.multiSession.revoke({
        sessionToken
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
