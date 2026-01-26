import { getProviderName } from "@better-auth-ui/core"
import type { SocialProvider } from "better-auth/social-providers"
import { providerIcons, useAuth } from "@better-auth-ui/react"
import { Button } from "@heroui/react"
import { useMemo } from "react"

import { cn } from "../../lib/utils"

export type ProviderButtonsProps = {
  isPending: boolean
  socialLayout?: SocialLayout
  signInSocial: (params: { provider: SocialProvider; callbackURL: string }) => void
}

export type SocialLayout = "auto" | "horizontal" | "vertical" | "grid"

/**
 * Render social provider sign-in buttons and handle initiation and pending state.
 *
 * @param isPending - Disables all provider buttons when true.
 * @param socialLayout - Preferred layout for the buttons; `"auto"` picks `"horizontal"` when there are four or more providers, otherwise `"vertical"`.
 * @param signInSocial - Callback invoked with the provider and callbackURL when a button is clicked.
 * @returns The JSX element that renders the configured social provider buttons.
 */
export function ProviderButtons({
  isPending,
  socialLayout = "auto",
  signInSocial
}: ProviderButtonsProps) {
  const { baseURL, localization, redirectTo, socialProviders } = useAuth()

  const callbackURL = `${baseURL}${redirectTo}`

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
    <div
      className={cn(
        "gap-3",
        resolvedSocialLayout === "grid" && "grid grid-cols-2",
        resolvedSocialLayout === "vertical" && "flex flex-col",
        resolvedSocialLayout === "horizontal" && "flex flex-wrap"
      )}
    >
      {socialProviders?.map((provider) => {
        const ProviderIcon = providerIcons[provider]

        return (
          <Button
            key={provider}
            className={cn(
              "w-full",
              resolvedSocialLayout === "horizontal" && "flex-1"
            )}
            variant="tertiary"
            isPending={isPending}
            onPress={() => signInSocial({ provider, callbackURL })}
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
    </div>
  )
}
