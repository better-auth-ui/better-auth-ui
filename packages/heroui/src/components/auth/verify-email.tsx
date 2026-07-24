import { useAuth, useSendVerificationEmail } from "@better-auth-ui/react"
import {
  Button,
  Card,
  type CardProps,
  cn,
  Description,
  Link,
  Spinner,
  toast,
  useIsHydrated
} from "@heroui/react"
import { useEffect, useState } from "react"

import { OpenEmailButton } from "./open-email-button"

export type VerifyEmailProps = {
  className?: string
  variant?: CardProps["variant"]
}

/** Seconds the resend button stays disabled to prevent spamming the endpoint. */
const RESEND_COOLDOWN_SECONDS = 60

/**
 * Render a card prompting the user to verify their email, with a resend button
 * that is rate-limited by a cooldown timer.
 *
 * The target email is read from `sessionStorage` (set when sign-up or sign-in
 * redirects here); the OpenEmail/Resend controls are only shown when an email
 * is stored. The resend button is disabled while a cooldown is active and shows
 * the remaining seconds.
 *
 * @param className - Additional CSS classes applied to the outer card container
 * @param variant - Variant to apply to the card
 * @returns The verify-email card React element
 */
export function VerifyEmail({ className, variant }: VerifyEmailProps) {
  const {
    authClient,
    basePaths,
    baseURL,
    localization,
    redirectTo,
    viewPaths
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
    <Card
      className={cn("w-full max-w-sm gap-4 md:p-6", className)}
      variant={variant}
    >
      <Card.Header>
        <Card.Title className="text-xl font-semibold mb-1">
          {localization.auth.verifyEmail}
        </Card.Title>
      </Card.Header>

      <Card.Content className="gap-4">
        <Description className="text-sm">
          {localization.auth.checkYourEmail}
        </Description>

        {email && (
          <div className="flex flex-col gap-3">
            <OpenEmailButton email={email} />

            <Button
              className="w-full"
              variant="tertiary"
              isDisabled={!email || isCoolingDown || isPending}
              isPending={isPending}
              onPress={() =>
                sendVerificationEmail({
                  email,
                  callbackURL: `${baseURL}${redirectTo}`
                })
              }
            >
              {isPending && <Spinner color="current" size="sm" />}

              {isCoolingDown
                ? localization.auth.resendIn.replace(
                    "{{seconds}}",
                    String(cooldown)
                  )
                : localization.auth.resend}
            </Button>
          </div>
        )}
      </Card.Content>

      <Card.Footer className="flex-col gap-3">
        <Description className="text-sm">
          {localization.auth.alreadyVerifiedYourEmail}{" "}
          <Link
            href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
            className="text-accent no-underline hover:underline decoration-accent-hover"
          >
            {localization.auth.signIn}
          </Link>
        </Description>
      </Card.Footer>
    </Card>
  )
}
