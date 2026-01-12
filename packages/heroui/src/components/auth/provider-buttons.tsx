import { getProviderName } from "@better-auth-ui/core"
import { providerIcons, useAuth } from "@better-auth-ui/react"
import { Button, Fieldset, Form } from "@heroui/react"
import { useMemo } from "react"

import { cn } from "../../lib/utils"

export type ProviderButtonsProps = {
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
    <Form action={signInSocial}>
      <Fieldset.Actions
        className={cn(
          "gap-3",
          resolvedSocialLayout === "grid" && "grid grid-cols-2",
          resolvedSocialLayout === "vertical" && "flex-col",
          resolvedSocialLayout === "horizontal" && "flex-wrap"
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
                "w-full",
                resolvedSocialLayout === "horizontal" && "flex-1"
              )}
              variant="tertiary"
              type="submit"
              isPending={isPending}
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
      </Fieldset.Actions>
    </Form>
  )
}
