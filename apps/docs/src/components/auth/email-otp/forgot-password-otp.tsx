"use client"

import { getAuthLinkURL, validateEmailAddress } from "@better-auth-ui/core"
import type { EmailOtpAuthClient } from "@better-auth-ui/core/plugins/email-otp"
import { useAuth, useAuthPlugin, useFetchOptions } from "@better-auth-ui/react"
import { useRequestPasswordResetOtp } from "@better-auth-ui/react/plugins/email-otp"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { emailOtpPlugin } from "@/lib/auth/email-otp-plugin"
import { cn } from "@/lib/utils"
import { isAuthFormFieldInvalid, useAuthForm } from "../auth-form"

/** `sessionStorage` key the reset-code form reads the pending address from. */
export const RESET_PASSWORD_OTP_STORAGE_KEY =
  "better-auth-ui.reset-password-otp"

export type ForgotPasswordOtpProps = {
  className?: string
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
 */
export function ForgotPasswordOtp({ className }: ForgotPasswordOtpProps) {
  const {
    authClient,
    basePaths,
    localization,
    navigate,
    plugins,
    redirectTo,
    viewPaths,
    Link
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
      await requestPasswordResetOtp({ email: value.email, fetchOptions })
  })

  const Captcha = plugins.find(
    (plugin) => plugin.captchaComponent
  )?.captchaComponent

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader>
        <CardTitle className="text-xl">
          {localization.auth.forgotPassword}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form.AppForm>
          <form.AuthFormRoot>
            <FieldGroup>
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
                {(field) => {
                  const isInvalid = isAuthFormFieldInvalid(field.state.meta)
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="email">
                        {localization.auth.email}
                      </FieldLabel>
                      <Input
                        id="email"
                        name={field.name}
                        type="email"
                        autoComplete="email"
                        placeholder={localization.auth.emailPlaceholder}
                        required
                        disabled={isPending}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        aria-invalid={isInvalid}
                      />
                      <field.AuthFormFieldError />
                    </Field>
                  )
                }}
              </form.AppField>

              {Captcha && <div className="flex justify-center">{Captcha}</div>}

              <form.AuthFormServerError />

              <form.AuthFormSubmitButton disabled={isPending}>
                {isPending && <Spinner />}

                {emailOtpLocalization.sendCode}
              </form.AuthFormSubmitButton>
            </FieldGroup>
          </form.AuthFormRoot>
        </form.AppForm>

        <div className="flex flex-col gap-3 items-center w-full mt-4">
          <FieldDescription className="text-center">
            {localization.auth.rememberYourPassword}{" "}
            <Link
              href={getAuthLinkURL(
                `${basePaths.auth}/${viewPaths.auth.signIn}`,
                redirectTo
              )}
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
