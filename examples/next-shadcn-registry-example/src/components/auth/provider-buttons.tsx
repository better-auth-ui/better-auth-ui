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
 * Render a form containing social provider sign-in buttons with layout and disabled state management.
 *
 * @param isPending - If true, disables all provider buttons.
 * @param socialLayout - Preferred layout for the buttons; when `"auto"`, chooses `"horizontal"` if there are four or more providers, otherwise `"vertical"`.
 * @param signInSocial - Form action handler invoked when a provider button is submitted.
 * @returns A form element that contains one submit button per available social provider.
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