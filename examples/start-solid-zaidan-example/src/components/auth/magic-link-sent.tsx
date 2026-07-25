import {
  magicLinkPlugin as coreMagicLinkPlugin,
  type MagicLinkLocalization,
  magicLinkLocalization
} from "@better-auth-ui/core/plugins"
import { useAuth } from "@better-auth-ui/solid"
import { Link } from "@tanstack/solid-router"
import { createSignal, onMount, Show } from "solid-js"
import { isServer } from "solid-js/web"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { OpenEmailButton } from "./open-email-button"

/** `sessionStorage` key the magic-link form stores the submitted email under. */
export const MAGIC_LINK_SENT_STORAGE_KEY = "better-auth-ui.magic-link-sent"

export type MagicLinkSentProps = {
  class?: string
}

/**
 * Magic-link-sent view. The target email is read from `sessionStorage` (set
 * when the magic-link form redirects here); if none is stored the user is
 * redirected back to the magic-link form. Offers a button to open the user's
 * email provider.
 */
export function MagicLinkSent(props: MagicLinkSentProps) {
  const auth = useAuth()
  const magicLinkPluginConfig = () =>
    auth.plugins.find((plugin) => plugin.id === coreMagicLinkPlugin.id)
  const magicLinkLabels = (): MagicLinkLocalization => ({
    ...magicLinkLocalization,
    ...(magicLinkPluginConfig()?.localization as
      | Partial<MagicLinkLocalization>
      | undefined)
  })
  const magicLinkPath = () =>
    magicLinkPluginConfig()?.viewPaths?.auth?.magicLink ?? "magic-link"

  const [email, setEmail] = createSignal(
    (!isServer && sessionStorage.getItem(MAGIC_LINK_SENT_STORAGE_KEY)) || ""
  )

  onMount(() => {
    const storedEmail = sessionStorage.getItem(MAGIC_LINK_SENT_STORAGE_KEY)

    if (!storedEmail) {
      auth.navigate({
        to: `${auth.basePaths.auth}/${magicLinkPath()}`
      })
      return
    }

    setEmail(storedEmail)
  })

  return (
    <Card class={cn("w-full max-w-sm", props.class)}>
      <CardHeader>
        <CardTitle class="text-xl font-semibold">
          {auth.localization.auth.checkYourEmailTitle}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div class="flex flex-col gap-4">
          <p class="text-sm text-muted-foreground" role="status">
            {email()
              ? magicLinkLabels().magicLinkSentTo.replace("{{email}}", email())
              : magicLinkLabels().magicLinkSent}
          </p>

          <Show when={email()}>
            <OpenEmailButton email={email()} />
          </Show>
        </div>

        <Show when={auth.emailAndPassword?.enabled}>
          <p class="mt-4 text-center text-muted-foreground text-sm">
            {auth.localization.auth.needToCreateAnAccount}{" "}
            <Link
              params={{ path: auth.viewPaths.auth.signUp }}
              to="/auth/$path"
            >
              {auth.localization.auth.signUp}
            </Link>
          </p>
        </Show>
      </CardContent>
    </Card>
  )
}
