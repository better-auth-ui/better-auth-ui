import { Button } from "../../primitives/button"
import { Txt } from "../../primitives/styled"
import { getAuthRedirectAction, getViewURL } from "@better-auth-ui/core"
import { useAuth, useSession } from "@better-auth-ui/react"
import { useEffect, useRef } from "react"
import { ActivityIndicator } from "react-native"
import { useAuthNavigation } from "../../navigation/navigation-context"
import { Box } from "../../primitives/styled"

export function AuthRedirect({ className }: { className?: string }) {
  const { authClient, baseURL, basePaths, viewPaths, localization } = useAuth()
  const navigation = useAuthNavigation()
  const { data: session, isPending, error, refetch } = useSession(authClient)
  const redirected = useRef(false)
  useEffect(() => {
    if (isPending || error || redirected.current) return
    const url = new URL(
      getViewURL(
        baseURL || "https://better-auth-ui.local",
        basePaths.auth,
        viewPaths.auth.redirect
      )
    )
    const redirectTo = navigation.getParam("redirectTo")
    if (redirectTo) url.searchParams.set("redirectTo", redirectTo)
    const action = getAuthRedirectAction(
      url,
      Boolean(session),
      getViewURL("", basePaths.auth, viewPaths.auth.signIn)
    )
    redirected.current = true
    navigation.navigate({ to: action.to, replace: true })
  }, [
    baseURL,
    basePaths.auth,
    viewPaths.auth.redirect,
    viewPaths.auth.signIn,
    session,
    isPending,
    error,
    navigation
  ])
  if (error)
    return (
      <Box className={className}>
        <Txt accessibilityRole="alert">{error.message}</Txt>
        <Button
          onPress={() => {
            void refetch()
          }}
        >
          {localization.auth.callbackContinue}
        </Button>
      </Box>
    )
  return (
    <Box className={className}>
      <ActivityIndicator />
    </Box>
  )
}
