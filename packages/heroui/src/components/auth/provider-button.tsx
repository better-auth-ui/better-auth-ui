import {
  type AuthSocialProvider,
  type AuthView,
  authMutationKeys,
  getProviderId,
  getProviderName
} from "@better-auth-ui/core"
import {
  renderProviderIcon,
  useAuth,
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
  const { authClient, baseURL, localization, redirectTo } = useAuth()

  const callbackURL = `${baseURL}${redirectTo}`

  const { mutate: signInSocial, isPending: signInSocialPending } =
    useSignInSocial(authClient)

  const providerId = getProviderId(provider)
  const providerIcon = renderProviderIcon(provider)

  const signInMutating = useIsMutating({
    mutationKey: authMutationKeys.signIn.all
  })
  const signUpMutating = useIsMutating({
    mutationKey: authMutationKeys.signUp.all
  })
  const isPending = signInMutating + signUpMutating > 0

  return (
    <Button
      variant={variant}
      isPending={isPending}
      onPress={() => signInSocial({ provider: providerId, callbackURL })}
      className={cn("relative overflow-visible", className)}
      {...props}
    >
      {signInSocialPending ? (
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
