import { getProviderId } from "@better-auth-ui/core"
import { useAuth } from "@better-auth-ui/react"
import { useMemo } from "react"
import { cn } from "../../lib/cn"
import { Box } from "../../primitives/styled"
import { ProviderButton } from "./provider-button"

export type SocialLayout = "auto" | "horizontal" | "vertical" | "grid"

export type ProviderButtonsProps = {
  socialLayout?: SocialLayout
}

/**
 * Social provider sign-in buttons. Each button owns its own sign-in mutation
 * and reads shared pending state from React Query. `"auto"` picks horizontal
 * when there are four or more providers, otherwise vertical.
 */
export function ProviderButtons({
  socialLayout = "auto"
}: ProviderButtonsProps) {
  const { socialProviders } = useAuth()

  const resolvedSocialLayout = useMemo<Exclude<SocialLayout, "auto">>(() => {
    if (socialLayout === "auto") {
      return socialProviders?.length && socialProviders.length >= 4
        ? "horizontal"
        : "vertical"
    }
    return socialLayout
  }, [socialLayout, socialProviders?.length])

  return (
    <Box
      className={cn(
        "gap-3",
        resolvedSocialLayout === "grid" && "flex-row flex-wrap",
        resolvedSocialLayout === "vertical" && "flex-col",
        resolvedSocialLayout === "horizontal" && "flex-row flex-wrap"
      )}
    >
      {socialProviders?.map((provider) => (
        <ProviderButton
          key={getProviderId(provider)}
          provider={provider}
          display={
            resolvedSocialLayout === "vertical"
              ? "full"
              : resolvedSocialLayout === "grid"
                ? "name"
                : "icon"
          }
          className={cn(
            resolvedSocialLayout === "grid" ? "w-[48%]" : "w-full",
            resolvedSocialLayout === "horizontal" && "flex-1"
          )}
        />
      ))}
    </Box>
  )
}
