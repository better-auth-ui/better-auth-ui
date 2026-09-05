import { getAuthLinkURL, validateEmailAddress } from "@better-auth-ui/core"
import type { EmailOtpAuthClient } from "@better-auth-ui/core/plugins/email-otp"
import { useAuth, useAuthPlugin, useFetchOptions } from "@better-auth-ui/react"
import { useRequestPasswordResetOtp } from "@better-auth-ui/react/plugins/email-otp"
import {
  Card,
  type CardProps,
  cn,
  Description,
  Input,
  Label,
  Link,
  TextField
} from "@heroui/react"

import { emailOtpPlugin } from "../../../lib/auth/email-otp-plugin"
import { useAuthForm } from "../auth-form"

/** `sessionStorage` key the reset-code form reads the pending address from. */
export const RESET_PASSWORD_OTP_STORAGE_KEY =
  "better-auth-ui.reset-password-otp"

export type ForgotPasswordOtpProps = {
  className?: string
  variant?: CardProps["variant"]
}

/**
 * Request a password-reset code instead of a reset link.
 *
 * Replaces the built-in `<ForgotPassword />` view when the email-OTP plugin
 * runs with `passwordReset: true`. On success the address is stored and the
 * user continues on `/auth/reset-password`, which asks for the code and the
 * new password — the reset-link-sent view is skipped entirely.
 *
 * @param className - Additional CSS classes applied to the card.
 * @param variant - Card variant.
 */
export function ForgotPasswordOtp({
  className,
  variant
}: ForgotPasswordOtpProps) {
  const {
    authClient,
    basePaths,
    localization,
    navigate,
    plugins,
    redirectTo,
    viewPaths
  } = useAuth()
  const { localization: emailOtpLocalization } = useAuthPlugin(emailOtpPlugin)

  const { fetchOptions, resetFetchOptions } = useFetchOptions()

  const { mutateAsync: requestPasswordResetOtp, isPending } =
    useRequestPasswordResetOtp(authClient as EmailOtpAuthClient, {
      onError: () => resetFetchOptions(),
      onSuccess: (_data, { email }) => {
        sessionStorage.setItem(RESET_PASSWORD_OTP_STORAGE_KEY, email)
        navigate({ to: `${basePaths.auth}/${viewPaths.auth.resetPassword}` })
      }
    })

  const form = useAuthForm({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) =>
      await requestPasswordResetOtp({
        email: value.email,
        fetchOptions
      })
  })

  const Captcha = plugins.find(
    (plugin) => plugin.captchaComponent
  )?.captchaComponent

  return (
    <Card
      className={cn("w-full max-w-sm gap-4 md:p-6", className)}
      variant={variant}
    >
      <Card.Header>
        <Card.Title className="text-xl font-semibold mb-1">
          {localization.auth.forgotPassword}
        </Card.Title>
      </Card.Header>

      <Card.Content className="gap-4">
        <form.AppForm>
          <form.AuthFormRoot className="flex flex-col gap-4">
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

            <form.AuthFormServerError />

            {Captcha && <div className="flex justify-center">{Captcha}</div>}

            <form.AuthFormSubmitButton
              isPending={isPending}
              className="w-full"
              isDisabled={isPending}
            >
              {emailOtpLocalization.sendCode}
            </form.AuthFormSubmitButton>
          </form.AuthFormRoot>
        </form.AppForm>
      </Card.Content>

      <Card.Footer className="flex-col gap-3">
        <Description className="text-sm">
          {localization.auth.rememberYourPassword}{" "}
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
