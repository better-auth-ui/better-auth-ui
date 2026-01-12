"use client"

import { providerIcons, useAuth } from "@better-auth-ui/react"
import { getProviderName } from "@better-auth-ui/react/core"
import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { cn } from "@/lib/utils"

export type ProviderButtonsProps = {
  isPending: boolean
  socialLayout?: SocialLayout
  signInSocial: (formData: FormData) => void
}

export type SocialLayout = "auto" | "horizontal" | "vertical" | "grid"

/**
 * Render sign-in buttons for configured social providers.
 *
 * The rendered buttons submit a form to initiate social sign-in. The visual layout adapts based on `socialLayout` and the number of available providers.
 *
 * @param isPending - When true, disables all provider buttons.
 * @param socialLayout - Preferred layout for the provider buttons; when set to `"auto"` the layout is chosen based on the number of available providers.
 * @param signInSocial - Form action invoked when a provider button is submitted.
 * @returns A JSX form element containing provider sign-in buttons.
 */
export function ProviderButtons({
  isPending,
  socialLayout = "auto",
  signInSocial
}: ProviderButtonsProps) {
  const { localization, socialProviders } = useAuth()

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
