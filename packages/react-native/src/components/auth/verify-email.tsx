import { useAuth, useSendVerificationEmail } from "@better-auth-ui/react"
import { useEffect, useState } from "react"
import { cn } from "../../lib/cn"
import { getPendingEmail } from "../../lib/pending-email"
import { Button } from "../../primitives/button"
import { Card, type CardVariant } from "../../primitives/card"
import { Description } from "../../primitives/description"
import { Link } from "../../primitives/link"
import { Box } from "../../primitives/styled"
import { toast } from "../../primitives/toast"
import { OpenEmailButton } from "./open-email-button"

export type VerifyEmailProps = {
  className?: string
  variant?: CardVariant
}

/** Seconds the resend button stays disabled to prevent spamming the endpoint. */
const RESEND_COOLDOWN_SECONDS = 60

/**
 * Render a card prompting the user to verify their email, with a resend button
 * that is rate-limited by a cooldown timer.
 *
 * The target email is read from the in-memory pending-email store (set when
 * sign-up or sign-in redirects here); the OpenEmail/Resend controls are only
 * shown when an email is stored. The resend button is disabled while a
 * cooldown is active and shows the remaining seconds.
 *
 * @param className - Additional CSS classes applied to the outer card container
 * @param variant - Variant to apply to the card
 * @returns The verify-email card React element
 */
export function VerifyEmail({ className, variant }: VerifyEmailProps) {
  const { authClient, baseURL, localization, redirectTo } = useAuth()

  const [email, setEmail] = useState(() => getPendingEmail() ?? "")
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS)

  useEffect(() => {
    setEmail(getPendingEmail() ?? "")
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
    <Card className={cn("w-full max-w-sm gap-4", className)} variant={variant}>
      <Card.Header>
        <Card.Title className="mb-1">
          {localization.auth.verifyEmail}
        </Card.Title>
      </Card.Header>

      <Card.Content className="gap-4">
        <Description className="text-sm">
          {localization.auth.checkYourEmail}
        </Description>

        {email && (
          <Box className="flex-col gap-3">
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
              {isCoolingDown
                ? localization.auth.resendIn.replace(
                    "{{seconds}}",
                    String(cooldown)
                  )
                : localization.auth.resend}
            </Button>
          </Box>
        )}
      </Card.Content>

      <Card.Footer className="flex-col gap-3">
        <Description className="text-sm">
          {localization.auth.alreadyVerifiedYourEmail}{" "}
          <Link view="signIn" className="text-sm">
            {localization.auth.signIn}
          </Link>
        </Description>
      </Card.Footer>
    </Card>
  )
}
