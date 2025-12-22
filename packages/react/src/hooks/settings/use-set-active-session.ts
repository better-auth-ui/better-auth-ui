import type { AnyAuthConfig } from "@better-auth-ui/react"
import { useCallback, useState } from "react"

import { useAuth } from "../auth/use-auth"
import { useListDeviceSessions } from "./use-list-device-sessions"

/**
 * Provides functionality to set an active session from device sessions in multi-session mode.
 *
 * @param config - Optional auth configuration forwarded to the auth hook
 * @returns An object containing the pending session token and a function to set the active session
 */
export function useSetActiveSession(config?: AnyAuthConfig) {
  const { authClient, toast } = useAuth(config)
  const { refetch: refetchSession } = authClient.useSession()
  const { refetch: refetchDeviceSessions } = useListDeviceSessions(config)

  const [settingActiveSession, setSettingActiveSession] = useState<
    string | null
  >(null)

  const setActiveSession = useCallback(
    async (sessionToken: string) => {
      setSettingActiveSession(sessionToken)

      const { error } = await authClient.multiSession.setActive({
        sessionToken
      })

      if (error) {
        toast.error(error.message || error.statusText)
      } else {
        await refetchSession()
        await refetchDeviceSessions()
      }

      setSettingActiveSession(null)
    },
    [authClient, refetchSession, refetchDeviceSessions, toast]
  )

  return { settingActiveSession, setActiveSession }
}
