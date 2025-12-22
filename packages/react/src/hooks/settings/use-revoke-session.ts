import type { AnyAuthConfig } from "@better-auth-ui/react"
import { useCallback, useState } from "react"

import { useAuth } from "../auth/use-auth"
import { useListDeviceSessions } from "./use-list-device-sessions"

/**
 * Provides functionality to revoke a session from device sessions in multi-session mode.
 *
 * @param config - Optional auth configuration forwarded to the auth hook
 * @returns An object containing the revoking session token and a function to revoke a session
 */
export function useRevokeSession(config?: AnyAuthConfig) {
  const { authClient, toast } = useAuth(config)
  const { refetch: refetchSession } = authClient.useSession()
  const { refetch: refetchDeviceSessions } = useListDeviceSessions(config)

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
        await refetchSession()
        await refetchDeviceSessions()
      }

      setRevokingSession(null)
    },
    [authClient, refetchSession, refetchDeviceSessions, toast]
  )

  return { revokingSession, revokeSession }
}
