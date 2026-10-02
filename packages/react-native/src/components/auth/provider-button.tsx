import {
  type AuthSocialProvider,
  authMutationKeys,
  getProviderId,
  getProviderName,
  isCustomSocialProvider
} from "@better-auth-ui/core"
import { useAuth, useSignInSocial } from "@better-auth-ui/react"
import { useIsMutating } from "@tanstack/react-query"
import type { SocialProvider } from "better-auth/social-providers"
import { providerIcons } from "../../lib/provider-icons"
import { useThemeColors } from "../../lib/theme-colors"
import { Button, type ButtonProps } from "../../primitives/button"

export type ProviderButtonProps = {
  provider: AuthSocialProvider
  display?: "full" | "name" | "icon"
} & Omit<ButtonProps, "children" | "onPress" | "isPending" | "isDisabled">

/**
 * Social provider sign-in button. `display`: `"full"` (e.g. "Continue with
 * Google"), `"name"` (provider name), or `"icon"` (icon only).
 */
export function ProviderButton({
  provider,
  display = "full",
  variant = "tertiary",
  ...props
}: ProviderButtonProps) {
  const { authClient, baseURL, localization, redirectTo } = useAuth()
  const colors = useThemeColors()

  const callbackURL = `${baseURL}${redirectTo}`

  const { mutate: signInSocial } = useSignInSocial(authClient)

  const providerId = getProviderId(provider)
  // Custom providers may supply their own icon element; built-in providers
  // resolve to this package's react-native-svg icon set.
  const customIcon = isCustomSocialProvider(provider)
    ? provider.icon
    : undefined
  const ProviderIcon = providerIcons[providerId as SocialProvider]

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
      aria-label={getProviderName(provider)}
      {...props}
    >
      {customIcon ??
        (ProviderIcon ? (
          <ProviderIcon width={20} height={20} color={colors.foreground} />
        ) : null)}

      {display === "full"
        ? localization.auth.continueWith.replace(
            "{{provider}}",
            getProviderName(provider)
          )
        : display === "name"
          ? getProviderName(provider)
          : null}
    </Button>
  )
}
