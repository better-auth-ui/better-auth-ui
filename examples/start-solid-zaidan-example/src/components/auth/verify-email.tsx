import {
  createAuthMutation,
  sendVerificationEmailOptions,
  useAuth
} from "@better-auth-ui/solid"
import { Link } from "@tanstack/solid-router"
import { createSignal, onCleanup, onMount } from "solid-js"
import { isServer } from "solid-js/web"
import { toast } from "solid-sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { OpenEmailButton } from "./open-email-button"

export type VerifyEmailProps = {
  class?: string
}

/** Seconds the resend button stays disabled to prevent spamming the endpoint. */
const RESEND_COOLDOWN_SECONDS = 60

/**
 * Verify-email view. The target email is read from `sessionStorage` (set when
 * sign-up or sign-in redirects here); if none is stored the user is redirected
 * back to sign-in. Offers a button to open the user's email provider plus a
 * resend button rate-limited by a cooldown timer.
 */
export function VerifyEmail(props: VerifyEmailProps) {
  const auth = useAuth()

  const [email, setEmail] = createSignal(
    (!isServer && sessionStorage.getItem("better-auth-ui.verify-email")) || ""
  )
  const [cooldown, setCooldown] = createSignal(RESEND_COOLDOWN_SECONDS)

  const sendVerificationEmail = createAuthMutation(() => ({
    ...sendVerificationEmailOptions(auth.authClient),
    onSuccess: () => {
      toast.success(auth.localization.auth.verificationEmailSent)
      setCooldown(RESEND_COOLDOWN_SECONDS)
    }
  }))

  onMount(() => {
    const storedEmail = sessionStorage.getItem("better-auth-ui.verify-email")

    if (!storedEmail) {
      auth.navigate({
        to: `${auth.basePaths.auth}/${auth.viewPaths.auth.signIn}`
      })
      return
    }

    setEmail(storedEmail)

    const interval = setInterval(() => {
      setCooldown((current) => (current > 0 ? current - 1 : 0))
    }, 1000)

    onCleanup(() => clearInterval(interval))
  })

  const isCoolingDown = () => cooldown() > 0

  const resend = () => {
    sendVerificationEmail.mutate({
      callbackURL: `${auth.baseURL}${auth.redirectTo}`,
      email: email()
    } as Parameters<typeof sendVerificationEmail.mutate>[0])
  }

  return (
    <Card class={cn("w-full max-w-sm", props.class)}>
      <CardHeader>
        <CardTitle class="text-xl font-semibold">
          {auth.localization.auth.verifyEmail}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div class="flex flex-col gap-4">
          <p class="text-sm text-muted-foreground">
            {auth.localization.auth.checkYourEmail}
          </p>

          <div class="flex flex-col gap-3">
            <OpenEmailButton email={email()} />

            <Button
              disabled={
                !email() || isCoolingDown() || sendVerificationEmail.isPending
              }
              onClick={resend}
              type="button"
              variant="outline"
            >
              {isCoolingDown()
                ? auth.localization.auth.resendIn.replace(
                    "{{seconds}}",
                    String(cooldown())
                  )
                : auth.localization.auth.resend}
            </Button>
          </div>
        </div>

        <div class="mt-4 flex w-full flex-col items-center gap-3">
          <p class="text-center text-sm text-muted-foreground">
            {auth.localization.auth.alreadyVerifiedYourEmail}{" "}
            <Link
              class="underline underline-offset-4"
              params={{ path: auth.viewPaths.auth.signIn }}
              to="/auth/$path"
            >
              {auth.localization.auth.signIn}
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
