import { getProviderName } from "@better-auth-ui/core"
import { useAuth } from "@better-auth-ui/solid"
import type { SocialProvider } from "better-auth/social-providers"
import type { ComponentProps } from "solid-js"
import { createSignal } from "solid-js"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { LastUsedBadge } from "./last-login-method/last-used-badge"
import { resolveSocialAuthParams, type SocialAuthView } from "./sign-in-path"

export type ProviderButtonProps = {
  display?: "full" | "icon" | "name"
  provider: SocialProvider
  view?: SocialAuthView
} & Omit<ComponentProps<typeof Button>, "children" | "disabled" | "onClick">

function GitHubIcon(props: ComponentProps<"svg">) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" {...props}>
      <path
        d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.17 1.18A10.97 10.97 0 0 1 12 6.02c.98 0 1.96.13 2.88.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.35.78 1.05.78 2.12v3.14c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"
        fill="currentColor"
      />
    </svg>
  )
}

function GoogleIcon(props: ComponentProps<"svg">) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" {...props}>
      <path
        d="M21.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.34a4.56 4.56 0 0 1-1.98 2.99v2.48h3.2c1.87-1.72 3-4.26 3-7.48Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.96-.9 6.61-2.42l-3.2-2.48c-.88.59-2.01.94-3.41.94-2.61 0-4.82-1.76-5.61-4.13H3.08v2.56A9.99 9.99 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.39 13.91A6 6 0 0 1 6.08 12c0-.66.11-1.3.31-1.91V7.53H3.08A9.99 9.99 0 0 0 2 12c0 1.61.39 3.14 1.08 4.47l3.31-2.56Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.96c1.47 0 2.78.5 3.82 1.49l2.86-2.86C16.95 2.98 14.69 2 12 2a9.99 9.99 0 0 0-8.92 5.53l3.31 2.56C7.18 7.72 9.39 5.96 12 5.96Z"
        fill="#EA4335"
      />
    </svg>
  )
}

function ProviderIcon(props: { provider: SocialProvider }) {
  if (props.provider === "github") return <GitHubIcon class="size-4" />
  if (props.provider === "google") return <GoogleIcon class="size-4" />

  return <span aria-hidden>{getProviderName(props.provider).slice(0, 1)}</span>
}

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
      class={cn("relative overflow-visible", props.class)}
      disabled={isPending()}
      onClick={signInSocial}
      type="button"
      variant={props.variant ?? "outline"}
    >
      {isPending() ? <Spinner /> : <ProviderIcon provider={props.provider} />}
      {isPending()
        ? null
        : display() === "full"
          ? label()
          : display() === "name"
            ? providerName()
            : null}
      {display() === "icon" || isPending() ? (
        <span class="sr-only">{label()}</span>
      ) : null}
      {(props.view ?? "signIn") !== "signUp" ? (
        <LastUsedBadge floating method={props.provider} />
      ) : null}
    </Button>
  )
}
