import { useAuth } from "@better-auth-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useState } from "react"

/**
 * Provides functionality to set an active session from device sessions in multi-session mode.
 *
 * @returns An object containing the pending session token and a function to set the active session
 */
export function useSetActiveSession() {
  const queryClient = useQueryClient()
  const { authClient, toast } = useAuth()

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
