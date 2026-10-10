import { useAuth, useSession } from "@better-auth-ui/react"
import { useEffect } from "react"
import { useAuthNavigation } from "../../navigation/navigation-context"
import { getNavigationPath } from "../../navigation/route-config"
import type { ViewTarget } from "../../navigation/types"

export function useNativeAuthenticate(target: ViewTarget) {
  const { authClient, basePaths, viewPaths } = useAuth()
  const navigation = useAuthNavigation()
  const session = useSession(authClient)
  const redirectTo =
    navigation.getPath?.() ??
    getNavigationPath(target, {
      basePaths,
      viewPaths: {
        auth: { ...viewPaths.auth },
        settings: { ...viewPaths.settings },
        admin: { ...viewPaths.admin }
      }
    })
  useEffect(() => {
    if (!session.data && !session.isPending && !session.error)
      navigation.push("signIn", { replace: true, params: { redirectTo } })
  }, [session.data, session.isPending, session.error, navigation, redirectTo])
  return session
}
