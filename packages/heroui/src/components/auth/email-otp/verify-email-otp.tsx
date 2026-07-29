import { getAuthLinkURL } from "@better-auth-ui/core"
import type { EmailOtpAuthClient } from "@better-auth-ui/core/plugins/email-otp"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useSendVerificationOtp,
  useVerifyEmailOtp
} from "@better-auth-ui/react/plugins/email-otp"
import {
  Button,
  Card,
  type CardProps,
  cn,
  Description,
  FieldError,
  Form,
  Input,
  Label,
  Link,
  Spinner,
  TextField,
  toast,
  useIsHydrated
} from "@heroui/react"
import { type SyntheticEvent, useEffect, useState } from "react"

import { emailOtpPlugin } from "../../../lib/auth/email-otp-plugin"
import {
  RESEND_COOLDOWN_SECONDS,
  useResendCooldown
} from "../../../lib/auth/use-resend-cooldown"
import { OpenEmailButton } from "../open-email-button"
import { OtpField } from "../otp-field"

/** `sessionStorage` key the sign-up and sign-in flows store the pending address under. */
export const VERIFY_EMAIL_STORAGE_KEY = "better-auth-ui.verify-email"

export type VerifyEmailOtpProps = {
  className?: string
  variant?: CardProps["variant"]
}

/**
 * Verify an email address with a code instead of a link.
 *
 * Replaces the built-in `<VerifyEmail />` view when the email-OTP plugin runs
 * with `emailVerification: true`. The address comes from session storage when
 * sign-up or sign-in put it there; otherwise the user types it and requests a
 * code. Sign-up already triggered a send, so the resend button starts on
 * cooldown just like the link-based view.
 *
 * @param className - Additional CSS classes applied to the card.
 * @param variant - Card variant.
 */
export function VerifyEmailOtp({ className, variant }: VerifyEmailOtpProps) {
  const {
    authClient,
    basePaths,
    localization,
    navigate,
    redirectTo,
    viewPaths
  } = useAuth()
  const { localization: emailOtpLocalization, otpLength } =
    useAuthPlugin(emailOtpPlugin)

  const otpClient = authClient as EmailOtpAuthClient
  const isHydrated = useIsHydrated()

  const [email, setEmail] = useState(
    (isHydrated && sessionStorage.getItem(VERIFY_EMAIL_STORAGE_KEY)) || ""
  )
  const [code, setCode] = useState("")

  const { cooldown, isCoolingDown, startCooldown } = useResendCooldown()

  // Sign-up already sent a code to this address, so restoring it also starts
  // the cooldown — otherwise the hydrated render would offer an immediate
  // resend and walk straight into the server's rate limit.
  useEffect(() => {
    const pendingEmail = sessionStorage.getItem(VERIFY_EMAIL_STORAGE_KEY) ?? ""
    setEmail(pendingEmail)

    if (pendingEmail) startCooldown(RESEND_COOLDOWN_SECONDS)
  }, [startCooldown])

  const { mutate: sendVerificationOtp, isPending: isSending } =
    useSendVerificationOtp(otpClient, {
      onSuccess: (_data, { email: sentTo }) => {
        sessionStorage.setItem(VERIFY_EMAIL_STORAGE_KEY, sentTo)
        setEmail(sentTo)
        startCooldown()
        toast.success(emailOtpLocalization.codeSent)
      }
    })

  const { mutate: verifyEmailOtp, isPending: isVerifying } = useVerifyEmailOtp(
    otpClient,
    {
      onError: () => setCode(""),
      onSuccess: () => {
        sessionStorage.removeItem(VERIFY_EMAIL_STORAGE_KEY)
        toast.success(emailOtpLocalization.emailVerified)
        navigate({ to: redirectTo })
      }
    }
  )

  const isPending = isSending || isVerifying

  const verifyCode = (completedCode: string) => {
    if (isPending || !email) return

    verifyEmailOtp({ email, otp: completedCode })
  }

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!email) {
      const formData = new FormData(e.currentTarget)
      sendVerificationOtp({
        email: formData.get("email") as string,
        type: "email-verification"
      })
      return
    }

    verifyCode(code)
  }

  return (
    <Card
      className={cn("w-full max-w-sm gap-4 md:p-6", className)}
      variant={variant}
    >
      <Card.Header>
        <Card.Title className="text-xl font-semibold mb-1">
          {localization.auth.verifyEmail}
        </Card.Title>

        {email && (
          <Card.Description>
            {emailOtpLocalization.codeSentTo.replace("{{email}}", email)}
          </Card.Description>
        )}
      </Card.Header>

      <Card.Content className="gap-4">
        <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {email ? (
            <OtpField
              autoFocus
              isDisabled={isPending}
              label={emailOtpLocalization.code}
              length={otpLength}
              name="otp"
              value={code}
              variant={variant}
              onChange={setCode}
              onComplete={verifyCode}
            />
          ) : (
            <TextField
              name="email"
              type="email"
              autoComplete="email"
              isDisabled={isPending}
              validate={(value) => {
                if (!value) return localization.auth.fieldRequired
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                  return localization.auth.invalidEmail
              }}
            >
              <Label>{localization.auth.email}</Label>

              <Input
                placeholder={localization.auth.emailPlaceholder}
                required
                variant={variant === "transparent" ? "primary" : "secondary"}
              />

              <FieldError />
            </TextField>
          )}

          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full"
              isDisabled={Boolean(email) && code.length !== otpLength}
              isPending={isPending}
            >
              {isPending && <Spinner color="current" size="sm" />}

              {email
                ? emailOtpLocalization.verifyCode
                : emailOtpLocalization.sendCode}
            </Button>

            {email && <OpenEmailButton email={email} variant="secondary" />}

            {email && (
              <Button
                className="w-full"
                variant="tertiary"
                isDisabled={isPending || isCoolingDown}
                onPress={() =>
                  sendVerificationOtp({ email, type: "email-verification" })
                }
              >
                {isCoolingDown
                  ? localization.auth.resendIn.replace(
                      "{{seconds}}",
                      String(cooldown)
                    )
                  : localization.auth.resend}
              </Button>
            )}
          </div>
        </Form>
      </Card.Content>

      <Card.Footer className="flex-col gap-3">
        <Description className="text-sm">
          {localization.auth.alreadyVerifiedYourEmail}{" "}
          <Link
            href={getAuthLinkURL(
              `${basePaths.auth}/${viewPaths.auth.signIn}`,
              redirectTo
            )}
            className="text-accent no-underline hover:underline decoration-accent-hover"
          >
            {localization.auth.signIn}
          </Link>
        </Description>
      </Card.Footer>
    </Card>
  )
}
