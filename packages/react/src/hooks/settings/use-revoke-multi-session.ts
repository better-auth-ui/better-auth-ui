import { useAuth } from "@better-auth-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useState } from "react"

/**
 * Hook to revoke a device session in multi-session mode.
 *
 * @returns An object with `revokingSession` and `revokeSession(sessionToken)`:
 * - `revokingSession` — the session token currently being revoked, or `null`.
 * - `revokeSession(sessionToken)` — function that revokes the session identified by `sessionToken`.
 */
export function useRevokeMultiSession() {
  const queryClient = useQueryClient()
  const { authClient, toast } = useAuth()

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
        await queryClient.invalidateQueries({ queryKey: ["auth"] })
      }

      setRevokingSession(null)
    },
    [authClient, queryClient, toast]
  )

  return { revokingSession, revokeSession }
}
