"use client"

import {
  type EmailOtpAuthClient,
  useAuth,
  useAuthPlugin,
  useSendVerificationOtp,
  useVerifyEmailOtp
} from "@better-auth-ui/react"
import { type SyntheticEvent, useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { emailOtpPlugin } from "@/lib/auth/email-otp-plugin"
import {
  RESEND_COOLDOWN_SECONDS,
  useResendCooldown
} from "@/lib/auth/use-resend-cooldown"
import { cn } from "@/lib/utils"
import { OtpField } from "../otp-field"
import { useIsHydrated } from "../use-is-hydrated"

/** `sessionStorage` key the sign-up and sign-in flows store the pending address under. */
export const VERIFY_EMAIL_STORAGE_KEY = "better-auth-ui.verify-email"

export type VerifyEmailOtpProps = {
  className?: string
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
 */
export function VerifyEmailOtp({ className }: VerifyEmailOtpProps) {
  const {
    authClient,
    basePaths,
    localization,
    navigate,
    redirectTo,
    viewPaths,
    Link
  } = useAuth()
  const { localization: emailOtpLocalization, otpLength } =
    useAuthPlugin(emailOtpPlugin)

  const otpClient = authClient as EmailOtpAuthClient
  const isHydrated = useIsHydrated()

  const [email, setEmail] = useState(
    (isHydrated && sessionStorage.getItem(VERIFY_EMAIL_STORAGE_KEY)) || ""
  )
  const [code, setCode] = useState("")
  const [fieldErrors, setFieldErrors] = useState<{ email?: string }>({})

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

    verifyEmailOtp({ email, otp: code })
  }

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader>
        <CardTitle className="text-xl">
          {localization.auth.verifyEmail}
        </CardTitle>

        {email && (
          <CardDescription>
            {emailOtpLocalization.codeSentTo.replace("{{email}}", email)}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {email ? (
              <OtpField
                autoFocus
                disabled={isPending}
                label={emailOtpLocalization.code}
                length={otpLength}
                name="otp"
                value={code}
                onChange={setCode}
              />
            ) : (
              <Field data-invalid={!!fieldErrors.email}>
                <FieldLabel htmlFor="email">
                  {localization.auth.email}
                </FieldLabel>

                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder={localization.auth.emailPlaceholder}
                  required
                  disabled={isPending}
                  onChange={() =>
                    setFieldErrors((prev) => ({ ...prev, email: undefined }))
                  }
                  onInvalid={(e) => {
                    e.preventDefault()

                    setFieldErrors((prev) => ({
                      ...prev,
                      email: (e.target as HTMLInputElement).validationMessage
                    }))
                  }}
                  aria-invalid={!!fieldErrors.email}
                />

                <FieldError>{fieldErrors.email}</FieldError>
              </Field>
            )}

            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                disabled={
                  isPending || (Boolean(email) && code.length !== otpLength)
                }
              >
                {isPending && <Spinner />}

                {email
                  ? emailOtpLocalization.verifyCode
                  : emailOtpLocalization.sendCode}
              </Button>

              {email && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending || isCoolingDown}
                  onClick={() =>
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
          </FieldGroup>
        </form>

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
