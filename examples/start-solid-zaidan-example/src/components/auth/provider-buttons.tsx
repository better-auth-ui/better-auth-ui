import { useAuth } from "@better-auth-ui/solid"
import { For } from "solid-js"
import { cn } from "@/lib/utils"
import { ProviderButton } from "./provider-button"
import type { SocialAuthView } from "./sign-in-path"

export type SocialLayout = "auto" | "grid" | "horizontal" | "vertical"

export type ProviderButtonsProps = {
  socialLayout?: SocialLayout
  view?: SocialAuthView
}

export function ProviderButtons(props: ProviderButtonsProps) {
  const auth = useAuth()
  const resolvedSocialLayout = () => {
    const socialLayout = props.socialLayout ?? "auto"
    if (socialLayout !== "auto") return socialLayout

    return auth.socialProviders?.length && auth.socialProviders.length >= 4
      ? "horizontal"
      : "vertical"
  }

  return (
    <div
      class={cn(
        "gap-3",
        resolvedSocialLayout() === "grid" && "grid grid-cols-2",
        resolvedSocialLayout() === "vertical" && "flex flex-col",
        resolvedSocialLayout() === "horizontal" && "flex flex-row flex-wrap"
      )}
    >
      <For each={auth.socialProviders ?? []}>
        {(provider) => (
          <ProviderButton
            class={cn(resolvedSocialLayout() === "horizontal" && "flex-1")}
            display={
              resolvedSocialLayout() === "vertical"
                ? "full"
                : resolvedSocialLayout() === "grid"
                  ? "name"
                  : "icon"
            }
            provider={provider}
            view={props.view}
          />
        )}
      </For>
    </div>
  )
}
