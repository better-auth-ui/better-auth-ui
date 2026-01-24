import { useAuth, useSession } from "@better-auth-ui/react"
import { useCallback, useState } from "react"

/**
 * Hook that sets an active device session in multi-session mode.
 *
 * @returns An object with `settingActiveSession` — the session token currently being set or `null`, and `setActiveSession(sessionToken)` — function that makes the given session token the active session.
 */
export function useSetActiveSession() {
  const { authClient, toast } = useAuth()
  const { refetch } = useSession()

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
        window.scrollTo({ top: 0 })
        await refetch()
      }

      setSettingActiveSession(null)
    },
    [authClient, toast, refetch]
  )

  return { settingActiveSession, setActiveSession }
}
