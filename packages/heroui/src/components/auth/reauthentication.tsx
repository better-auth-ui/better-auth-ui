import {
  getReauthenticationSignInURL,
  isReauthenticationSignInURL
} from "@better-auth-ui/core"
import { useAuth, useSignOut } from "@better-auth-ui/react"
import { Alert, Button, cn, Spinner } from "@heroui/react"
import { useSyncExternalStore } from "react"

const subscribeToLocation = () => () => undefined

function useIsReauthenticationSignIn() {
  return useSyncExternalStore(
    subscribeToLocation,
    () => isReauthenticationSignInURL(new URL(window.location.href)),
    () => false
  )
}

export type ReauthenticationActionProps = {
  className?: string
  showTitle?: boolean
}

/** Ask the user to explicitly start a full sign-in before continuing. */
export function ReauthenticationAction({
  className,
  showTitle = true
}: ReauthenticationActionProps) {
  const auth = useAuth()
  const signOut = useSignOut(auth.authClient)

  const handleReauthentication = () => {
    const signInURL = getReauthenticationSignInURL(
      new URL(window.location.href),
      `${auth.basePaths.auth}/${auth.viewPaths.auth.signIn}`
    )

    signOut.mutate(undefined, {
      onSuccess: () => auth.navigate({ to: signInURL })
    })
  }

  return (
    <div className={cn("flex flex-col items-start gap-3 p-4", className)}>
      <div className="flex flex-col gap-1">
        {showTitle && (
          <h3 className="text-sm font-medium">
            {auth.localization.settings.reauthenticationTitle}
          </h3>
        )}
        <p className="text-muted text-sm">
          {auth.localization.settings.reauthenticationDescription}
        </p>
      </div>

      <Button
        isDisabled={signOut.isPending}
        onPress={handleReauthentication}
        size="sm"
        variant="primary"
      >
        {signOut.isPending && <Spinner color="current" size="sm" />}
        {auth.localization.settings.reauthenticationAction}
      </Button>
    </div>
  )
}

/** Explain why the user reached the normal sign-in page. */
export function ReauthenticationNotice() {
  const { localization } = useAuth()
  const isReauthenticationSignIn = useIsReauthenticationSignIn()

  if (!isReauthenticationSignIn) return null

  return (
    <Alert status="default">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>{localization.settings.reauthenticationTitle}</Alert.Title>
        <Alert.Description>
          {localization.settings.reauthenticationDescription}
        </Alert.Description>
      </Alert.Content>
    </Alert>
  )
}
