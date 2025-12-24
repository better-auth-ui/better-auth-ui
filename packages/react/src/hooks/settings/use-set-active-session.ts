import type { AnyAuthConfig } from "@better-auth-ui/react"
import { useCallback, useState } from "react"

import { useAuth } from "../auth/use-auth"

/**
 * Provides functionality to set an active session from device sessions in multi-session mode.
 *
 * @param config - Optional auth configuration forwarded to the auth hook
 * @returns An object containing the pending session token and a function to set the active session
 */
export function useSetActiveSession(config?: AnyAuthConfig) {
  const { authClient, queryClient, toast } = useAuth(config)

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
        await queryClient.invalidateQueries({ queryKey: ["auth"] })
      }

      setSettingActiveSession(null)
    },
    [authClient, queryClient, toast]
  )

  return { settingActiveSession, setActiveSession }
}
