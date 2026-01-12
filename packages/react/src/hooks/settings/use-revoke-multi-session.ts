import { useAuth } from "@better-auth-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useState } from "react"

/**
 * Provides functionality to revoke a session from device sessions in multi-session mode.
 * This is used for the multi-session plugin where users can have multiple accounts on the same device.
 *
 * @returns An object containing the revoking session token and a function to revoke a session
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
