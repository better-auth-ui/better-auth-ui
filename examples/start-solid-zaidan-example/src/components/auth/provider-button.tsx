import { getProviderName } from "@better-auth-ui/core"
import { useAuth } from "@better-auth-ui/solid"
import type { SocialProvider } from "better-auth/social-providers"
import type { ComponentProps } from "solid-js"
import { createSignal } from "solid-js"
import { Button } from "@/components/ui/button"
import { resolveSocialAuthParams, type SocialAuthView } from "./sign-in-path"

export type ProviderButtonProps = {
  display?: "full" | "icon" | "name"
  provider: SocialProvider
  view?: SocialAuthView
} & Omit<ComponentProps<typeof Button>, "children" | "disabled" | "onClick">

export function ProviderButton(props: ProviderButtonProps) {
  const auth = useAuth()
  const [isPending, setIsPending] = createSignal(false)
  const display = () => props.display ?? "full"
  const providerName = () => getProviderName(props.provider)
  const label = () =>
    auth.localization.auth.continueWith.replace("{{provider}}", providerName())
  const signInSocial = async () => {
    if (isPending()) return

    setIsPending(true)

    try {
      await auth.authClient.signIn.social(
        resolveSocialAuthParams({
          provider: props.provider,
          basePaths: auth.basePaths,
          baseURL: auth.baseURL,
          redirectTo: auth.redirectTo,
          view: props.view ?? "signIn",
          viewPaths: auth.viewPaths
        }) as Parameters<typeof auth.authClient.signIn.social>[0]
      )
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button
      aria-label={providerName()}
      class={props.class}
      disabled={isPending()}
      onClick={signInSocial}
      type="button"
      variant={props.variant ?? "outline"}
    >
      <span aria-hidden>{providerName().slice(0, 1)}</span>
      {isPending()
        ? `${providerName()}…`
        : display() === "full"
          ? label()
          : display() === "name"
            ? providerName()
            : null}
    </Button>
  )
}
