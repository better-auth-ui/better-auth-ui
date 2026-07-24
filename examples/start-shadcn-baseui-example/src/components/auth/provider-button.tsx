"use client"

import { authMutationKeys, getProviderName } from "@better-auth-ui/core"
import { providerIcons, useAuth, useSignInSocial } from "@better-auth-ui/react"
import { useIsMutating } from "@tanstack/react-query"
import type { SocialProvider } from "better-auth/social-providers"
import type { ComponentProps } from "react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export type ProviderButtonProps = {
  provider: SocialProvider
  display?: "full" | "name" | "icon"
} & Omit<ComponentProps<typeof Button>, "onClick" | "children" | "disabled">

/**
 * Social provider sign-in button.
 *
 * @param provider - Provider to sign in with.
 * @param display - `"full"` (e.g. "Continue with Google"), `"name"` (just the provider name), or `"icon"` (icon only).
 */
export function ProviderButton({
  provider,
  display = "full",
  variant = "outline",
  ...props
}: ProviderButtonProps) {
  const { authClient, baseURL, localization, redirectTo } = useAuth()

  const callbackURL = `${baseURL}${redirectTo}`

  const { mutate: signInSocial, isPending: signInSocialPending } =
    useSignInSocial(authClient)

  const ProviderIcon = providerIcons[provider]

  const signInMutating = useIsMutating({
    mutationKey: authMutationKeys.signIn.all
  })
  const signUpMutating = useIsMutating({
    mutationKey: authMutationKeys.signUp.all
  })
  const isPending = signInMutating + signUpMutating > 0

  return (
    <Button
      type="button"
      variant={variant}
      disabled={isPending}
      onClick={() => signInSocial({ provider, callbackURL })}
      {...props}
      aria-label={getProviderName(provider)}
    >
      {signInSocialPending ? (
        <Spinner />
      ) : ProviderIcon ? (
        <ProviderIcon />
      ) : null}

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
