"use client"

import { useAuth, useSendVerificationEmail } from "@better-auth-ui/react"
import { useEffect, useState, useSyncExternalStore } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldDescription } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { OpenEmailButton } from "./open-email-button"

export type VerifyEmailProps = {
  className?: string
}

/** Seconds the resend button stays disabled to prevent spamming the endpoint. */
const RESEND_COOLDOWN_SECONDS = 60

/**
 * Returns `true` once the component is mounted on the client (hydrated) and
 * `false` while rendering on the server, so client-only reads (e.g.
 * `sessionStorage`) stay safe during SSR.
 *
 * @returns Whether the component has hydrated on the client.
 */
function useIsHydrated() {
  const subscribe = () => () => {}
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}

/**
 * Render a card prompting the user to verify their email, with a resend button
 * that is rate-limited by a cooldown timer.
 *
 * The target email is read from `sessionStorage` (set when sign-up or sign-in
 * redirects here); the OpenEmail/Resend controls are only shown when an email
 * is stored. The resend button is disabled while a cooldown is active and shows
 * the remaining seconds.
 *
 * @param className - Additional CSS classes applied to the card
 * @returns The verify-email card React element
 */
export function VerifyEmail({ className }: VerifyEmailProps) {
  const {
    authClient,
    basePaths,
    baseURL,
    localization,
    redirectTo,
    viewPaths,
    Link
  } = useAuth()

  const isHydrated = useIsHydrated()
  const [email, setEmail] = useState(
    (isHydrated && sessionStorage.getItem("better-auth-ui.verify-email")) || ""
  )
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS)

  useEffect(() => {
    setEmail(sessionStorage.getItem("better-auth-ui.verify-email") ?? "")
  }, [])

  useEffect(() => {
    if (cooldown <= 0 || !email) return

    const interval = setInterval(() => {
      setCooldown((current) => (current > 0 ? current - 1 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [cooldown, email])

  const { mutate: sendVerificationEmail, isPending } = useSendVerificationEmail(
    authClient,
    {
      onSuccess: () => {
        toast.success(localization.auth.verificationEmailSent)
        setCooldown(RESEND_COOLDOWN_SECONDS)
      }
    }
  )

  const isCoolingDown = cooldown > 0

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {localization.auth.verifyEmail}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-4">
          <FieldDescription>
            {localization.auth.checkYourEmail}
          </FieldDescription>

          {email && (
            <div className="flex flex-col gap-3">
              <OpenEmailButton email={email} />

              <Button
                type="button"
                variant="outline"
                disabled={!email || isCoolingDown || isPending}
                onClick={() =>
                  sendVerificationEmail({
                    email,
                    callbackURL: `${baseURL}${redirectTo}`
                  })
                }
              >
                {isPending && <Spinner />}

                {isCoolingDown
                  ? localization.auth.resendIn.replace(
                      "{{seconds}}",
                      String(cooldown)
                    )
                  : localization.auth.resend}
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 items-center w-full mt-4">
          <FieldDescription className="text-center">
            {localization.auth.alreadyVerifiedYourEmail}{" "}
            <Link
              href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
              className="underline underline-offset-4"
            >
              {localization.auth.signIn}
            </Link>
          </FieldDescription>
        </div>
      </CardContent>
    </Card>
  )
}
