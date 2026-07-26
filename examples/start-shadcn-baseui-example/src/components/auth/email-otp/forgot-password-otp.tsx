"use client"

import {
  type EmailOtpAuthClient,
  useAuth,
  useAuthPlugin,
  useFetchOptions,
  useRequestPasswordResetOtp
} from "@better-auth-ui/react"
import { type SyntheticEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { cn } from "@/lib/utils"

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
    viewPaths,
    Link
  } = useAuth()
  const { localization: emailOtpLocalization } = useAuthPlugin(emailOtpPlugin)

  const { fetchOptions, resetFetchOptions } = useFetchOptions()
  const [fieldErrors, setFieldErrors] = useState<{ email?: string }>({})

  const { mutate: requestPasswordResetOtp, isPending } =
    useRequestPasswordResetOtp(authClient as EmailOtpAuthClient, {
      onError: () => resetFetchOptions(),
      onSuccess: (_data, { email }) => {
        sessionStorage.setItem(RESET_PASSWORD_OTP_STORAGE_KEY, email)
        navigate({ to: `${basePaths.auth}/${viewPaths.auth.resetPassword}` })
      }
    })

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    requestPasswordResetOtp({
      email: formData.get("email") as string,
      fetchOptions
    })
  }

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
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field data-invalid={!!fieldErrors.email}>
              <FieldLabel htmlFor="email">{localization.auth.email}</FieldLabel>

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

            {Captcha && <div className="flex justify-center">{Captcha}</div>}

            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner />}

              {emailOtpLocalization.sendCode}
            </Button>
          </FieldGroup>
        </form>

        <div className="flex flex-col gap-3 items-center w-full mt-4">
          <FieldDescription className="text-center">
            {localization.auth.rememberYourPassword}{" "}
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
