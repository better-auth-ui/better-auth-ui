"use client"

import { providerIcons, useAuth, useSignInSocial } from "@better-auth-ui/react"
import { getProviderName } from "@better-auth-ui/react/core"
import type { SocialProvider } from "better-auth/social-providers"
import { type ComponentProps, useState } from "react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export type ProviderButtonProps = {
  provider: SocialProvider
  label?: "continueWith" | "providerName" | "none"
  isDisabled?: boolean
} & Omit<ComponentProps<typeof Button>, "onClick" | "disabled" | "children">

/**
 * Render a single social provider sign-in button with its own mutation and pending state.
 *
 * @param provider - The social provider this button signs in with.
 * @param label - Label style: `"continueWith"` (e.g. "Continue with Google"), `"providerName"` (e.g. "Google"), or `"none"` (icon only).
 * @param isDisabled - External disabled state (e.g. the parent form is submitting).
 */
export function ProviderButton({
  provider,
  label = "continueWith",
  isDisabled,
  variant = "outline",
  ...props
}: ProviderButtonProps) {
  const { baseURL, localization, redirectTo } = useAuth()

  const callbackURL = `${baseURL}${redirectTo}`

  const [redirecting, setRedirecting] = useState(false)

  const { mutate: signInSocial, isPending } = useSignInSocial({
    onSuccess: () => {
      setRedirecting(true)

      setTimeout(() => {
        setRedirecting(false)
      }, 5000)
    }
  })

  const ProviderIcon = providerIcons[provider]

  const pending = isPending || redirecting

  return (
    <Button
      type="button"
      variant={variant}
      disabled={isDisabled || pending}
      onClick={() => signInSocial({ provider, callbackURL })}
      {...props}
    >
      {pending ? <Spinner /> : ProviderIcon ? <ProviderIcon /> : null}

      {label === "continueWith"
        ? localization.auth.continueWith.replace(
            "{{provider}}",
            getProviderName(provider)
          )
        : label === "providerName"
          ? getProviderName(provider)
          : null}
    </Button>
  )
}
