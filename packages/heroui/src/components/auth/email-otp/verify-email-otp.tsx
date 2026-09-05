import { getAuthLinkURL, validateEmailAddress } from "@better-auth-ui/core"
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
  Input,
  Label,
  Link,
  TextField,
  toast,
  useIsHydrated
} from "@heroui/react"
import { useSelector } from "@tanstack/react-form"
import { useEffect, useState } from "react"

import { emailOtpPlugin } from "../../../lib/auth/email-otp-plugin"
import {
  RESEND_COOLDOWN_SECONDS,
  useResendCooldown
} from "../../../lib/auth/use-resend-cooldown"
import { setAuthFormServerError, useAuthForm } from "../auth-form"
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

  const { cooldown, isCoolingDown, startCooldown } = useResendCooldown()

  // Sign-up already sent a code to this address, so restoring it also starts
  // the cooldown — otherwise the hydrated render would offer an immediate
  // resend and walk straight into the server's rate limit.
  useEffect(() => {
    const pendingEmail = sessionStorage.getItem(VERIFY_EMAIL_STORAGE_KEY) ?? ""
    setEmail(pendingEmail)

    if (pendingEmail) startCooldown(RESEND_COOLDOWN_SECONDS)
  }, [startCooldown])

  const { mutateAsync: sendVerificationOtp, isPending: isSending } =
    useSendVerificationOtp(otpClient, {
      onSuccess: (_data, { email: sentTo }) => {
        sessionStorage.setItem(VERIFY_EMAIL_STORAGE_KEY, sentTo)
        setEmail(sentTo)
        startCooldown()
        toast.success(emailOtpLocalization.codeSent)
      }
    })

  const { mutateAsync: verifyEmailOtp, isPending: isVerifying } =
    useVerifyEmailOtp(otpClient, {
      onError: () => form.setFieldValue("code", ""),
      onSuccess: () => {
        sessionStorage.removeItem(VERIFY_EMAIL_STORAGE_KEY)
        toast.success(emailOtpLocalization.emailVerified)
        navigate({ to: redirectTo })
      }
    })

  const isPending = isSending || isVerifying

  const verifyCode = async (completedCode: string) => {
    if (isPending || !email) return

    return verifyEmailOtp({ email, otp: completedCode })
  }

  const form = useAuthForm({
    defaultValues: { code: "", email: "" },
    onSubmit: async ({ value }) => {
      if (!email) {
        await sendVerificationOtp({
          email: value.email,
          type: "email-verification"
        })
        return
      }

      await verifyCode(value.code)
    }
  })
  const codeComplete = useSelector(
    form.store,
    (state) => state.values.code.length === otpLength
  )

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
        <form.AppForm>
          <form.AuthFormRoot className="flex flex-col gap-4">
            {email ? (
              <form.AppField name="code">
                {(field) => (
                  <OtpField
                    autoFocus
                    isDisabled={isPending}
                    label={emailOtpLocalization.code}
                    length={otpLength}
                    name={field.name}
                    value={field.state.value}
                    variant={variant}
                    onChange={field.handleChange}
                    onComplete={(completedCode) =>
                      void verifyCode(completedCode).catch((error) =>
                        setAuthFormServerError(
                          form,
                          error,
                          localization.auth.callbackFailedTitle
                        )
                      )
                    }
                  />
                )}
              </form.AppField>
            ) : (
              <form.AppField
                name="email"
                validators={{
                  onChange: ({ value }) =>
                    validateEmailAddress(value, {
                      invalidMessage: localization.auth.invalidEmail,
                      requiredMessage: localization.auth.fieldRequired
                    })
                }}
              >
                {(field) => (
                  <TextField
                    name={field.name}
                    type="email"
                    autoComplete="email"
                    isDisabled={isPending}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                    validationBehavior="aria"
                  >
                    <Label>{localization.auth.email}</Label>

                    <Input
                      placeholder={localization.auth.emailPlaceholder}
                      required
                      variant={
                        variant === "transparent" ? "primary" : "secondary"
                      }
                    />

                    <field.AuthFormFieldError />
                  </TextField>
                )}
              </form.AppField>
            )}

            <form.AuthFormServerError />

            <div className="flex flex-col gap-3">
              <form.AuthFormSubmitButton
                isPending={isPending}
                className="w-full"
                isDisabled={isPending || (Boolean(email) && !codeComplete)}
              >
                {email
                  ? emailOtpLocalization.verifyCode
                  : emailOtpLocalization.sendCode}
              </form.AuthFormSubmitButton>

              {email && <OpenEmailButton email={email} variant="secondary" />}

              {email && (
                <Button
                  className="w-full"
                  variant="tertiary"
                  isDisabled={isPending || isCoolingDown}
                  onPress={() =>
                    void sendVerificationOtp({
                      email,
                      type: "email-verification"
                    }).catch((error) =>
                      setAuthFormServerError(
                        form,
                        error,
                        localization.auth.callbackFailedTitle
                      )
                    )
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
          </form.AuthFormRoot>
        </form.AppForm>
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
