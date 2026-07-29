import { getAuthLinkURL } from "@better-auth-ui/core"
import { AuthLink, useAuth } from "@better-auth-ui/solid"
import { createSignal, onMount, Show } from "solid-js"
import { isServer } from "solid-js/web"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { OpenEmailButton } from "./open-email-button"

/** `sessionStorage` key the forgot-password form stores the submitted email under. */
export const RESET_LINK_SENT_STORAGE_KEY = "better-auth-ui.reset-link-sent"

export type ResetLinkSentProps = {
  class?: string
}

/**
 * Reset-link-sent view. The target email is read from `sessionStorage` (set
 * when the forgot-password form redirects here); if none is stored the user
 * is redirected back to forgot-password. Offers a button to open the user's
 * email provider.
 */
export function ResetLinkSent(props: ResetLinkSentProps) {
  const auth = useAuth()

  const [email, setEmail] = createSignal(
    (!isServer && sessionStorage.getItem(RESET_LINK_SENT_STORAGE_KEY)) || ""
  )

  onMount(() => {
    const storedEmail = sessionStorage.getItem(RESET_LINK_SENT_STORAGE_KEY)

    if (!storedEmail) {
      auth.navigate({
        to: `${auth.basePaths.auth}/${auth.viewPaths.auth.forgotPassword}`
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
              ? auth.localization.auth.resetLinkSentTo.replace(
                  "{{email}}",
                  email()
                )
              : auth.localization.auth.passwordResetEmailSent}
          </p>

          <Show when={email()}>
            <OpenEmailButton email={email()} />
          </Show>
        </div>

        <div class="mt-4 flex w-full flex-col items-center gap-3">
          <p class="text-center text-sm text-muted-foreground">
            {auth.localization.auth.rememberYourPassword}{" "}
            <AuthLink
              class="underline underline-offset-4"
              href={getAuthLinkURL(
                `${auth.basePaths.auth}/${auth.viewPaths.auth.signIn}`,
                auth.redirectTo
              )}
            >
              {auth.localization.auth.signIn}
            </AuthLink>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
