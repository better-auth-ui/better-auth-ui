import {
  type AuthSocialProvider,
  type AuthView,
  authMutationKeys,
  getProviderId,
  getProviderName,
  type OAuthPopupAuthClient
} from "@better-auth-ui/core"
import {
  renderProviderIcon,
  useAuth,
  useSignInOAuthPopup,
  useSignInSocial
} from "@better-auth-ui/react"
import { Button, type ButtonProps, cn, Spinner } from "@heroui/react"
import { useIsMutating } from "@tanstack/react-query"
import { LastUsedBadge } from "./last-login-method/last-used-badge"

export type ProviderButtonProps = {
  provider: AuthSocialProvider
  display?: "full" | "name" | "icon"
  view?: AuthView
} & Omit<ButtonProps, "children" | "onPress" | "isPending" | "isDisabled">

/**
 * Social provider sign-in button.
 *
 * @param provider - Provider to sign in with.
 * @param display - `"full"` (e.g. "Continue with Google"), `"name"` (just the provider name), or `"icon"` (icon only).
 */
export function ProviderButton({
  provider,
  display = "full",
  view = "signIn",
  variant = "tertiary",
  className,
  ...props
}: ProviderButtonProps) {
  const {
    authClient,
    baseURL,
    localization,
    navigate,
    redirectTo,
    socialSignInMode
  } = useAuth()

  const callbackURL = `${baseURL}${redirectTo}`

  const { mutate: signInSocial, isPending: signInSocialPending } =
    useSignInSocial(authClient)
  const { mutate: signInPopup, isPending: signInPopupPending } =
    useSignInOAuthPopup(authClient as OAuthPopupAuthClient)

  const providerId = getProviderId(provider)
  const providerIcon = renderProviderIcon(provider)

  const signInMutating = useIsMutating({
    mutationKey: authMutationKeys.signIn.all
  })
  const signUpMutating = useIsMutating({
    mutationKey: authMutationKeys.signUp.all
  })
  const isPending = signInMutating + signUpMutating > 0

  const handleSignIn = () => {
    if (socialSignInMode === "popup") {
      signInPopup(
        {
          provider: providerId,
          callbackURL,
          requestSignUp: view === "signUp"
        },
        { onSuccess: () => navigate({ to: redirectTo }) }
      )
      return
    }

    signInSocial({ provider: providerId, callbackURL })
  }

  return (
    <Button
      variant={variant}
      isPending={isPending}
      onPress={handleSignIn}
      className={cn("relative overflow-visible", className)}
      {...props}
    >
      {signInSocialPending || signInPopupPending ? (
        <Spinner color="current" size="sm" />
      ) : (
        providerIcon
      )}

      {display === "full"
        ? localization.auth.continueWith.replace(
            "{{provider}}",
            getProviderName(provider)
          )
        : display === "name"
          ? getProviderName(provider)
          : null}

      {display === "icon" && (
        <span className="sr-only">{getProviderName(provider)}</span>
      )}

      {view !== "signUp" && <LastUsedBadge method={providerId} floating />}
    </Button>
  )
}
