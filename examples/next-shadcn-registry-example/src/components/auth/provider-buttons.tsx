"use client"

import type { AnyAuthConfig } from "@better-auth-ui/react"
import { providerIcons } from "@better-auth-ui/react"
import { getProviderName } from "@better-auth-ui/react/core"
import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { useAuth } from "@/hooks/auth/use-auth"
import { cn } from "@/lib/utils"

export type ProviderButtonsProps = AnyAuthConfig & {
  isPending: boolean
  socialLayout?: SocialLayout
  signInSocial: (formData: FormData) => void
}

export type SocialLayout = "auto" | "horizontal" | "vertical" | "grid"

/**
 * Render social provider sign-in buttons and handle sign-in initiation and pending state.
 *
 * @param isPending - When true, disables all provider buttons.
 * @param socialLayout - Preferred layout for the provider buttons; when set to `"auto"` the layout is chosen based on the number of available providers.
 * @param signInSocial - The function to call when a social provider button is clicked.
 */
export function ProviderButtons({
  isPending,
  socialLayout = "auto",
  signInSocial,
  ...config
}: ProviderButtonsProps) {
  const { localization, socialProviders } = useAuth(config)

  const resolvedSocialLayout = useMemo(() => {
    if (socialLayout === "auto") {
      if (socialProviders?.length && socialProviders.length >= 4) {
        return "horizontal"
      }

      return "vertical"
    }

    return socialLayout
  }, [socialLayout, socialProviders?.length])

  return (
    <form action={signInSocial}>
      <Field
        className={cn(
          "gap-3",
          resolvedSocialLayout === "grid" && "grid grid-cols-2",
          resolvedSocialLayout === "vertical" && "flex-col",
          resolvedSocialLayout === "horizontal" && "flex-row flex-wrap"
        )}
      >
        {socialProviders?.map((provider) => {
          const ProviderIcon = providerIcons[provider]

          return (
            <Button
              key={provider}
              name="provider"
              value={provider}
              className={cn(
                "flex-1",
                resolvedSocialLayout === "horizontal" && "flex-1"
              )}
              variant="outline"
              type="submit"
              disabled={isPending}
            >
              <ProviderIcon />

              {resolvedSocialLayout === "vertical"
                ? localization.auth.continueWith.replace(
                    "{{provider}}",
                    getProviderName(provider)
                  )
                : resolvedSocialLayout === "grid"
                  ? getProviderName(provider)
                  : null}
            </Button>
          )
        })}
      </Field>
    </form>
  )
}
