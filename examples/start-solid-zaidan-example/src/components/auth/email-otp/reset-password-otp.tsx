import {
  getAuthLinkURL,
  isPasswordCompromisedError,
  validateEmailAddress,
  validateStringLength
} from "@better-auth-ui/core"
import {
  type EmailOtpAuthClient,
  resetPasswordOtpOptions
} from "@better-auth-ui/core/plugins/email-otp"
import { AuthLink, useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import { createMutation } from "@tanstack/solid-query"
import { Show } from "solid-js"
import { toast } from "solid-sonner"

import { OpenEmailButton } from "@/components/auth/open-email-button"
import { OtpField } from "@/components/auth/otp-field"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { FieldGroup } from "@/components/ui/field"
import { emailOtpPlugin } from "@/lib/auth/email-otp-plugin"
import { cn } from "@/lib/utils"
import {
  createAuthForm,
  setAuthFormServerError,
  submitAuthForm
} from "../auth-form"
import { PasswordStrengthMeter } from "../password-strength-meter"
import { RESET_PASSWORD_OTP_STORAGE_KEY } from "./forgot-password-otp"

export type ResetPasswordOtpProps = {
  class?: string
}

/**
 * Reset a password with an emailed code.
 *
 * Replaces the built-in `<ResetPassword />` view when the email-OTP plugin
 * runs with `passwordReset: true`. There is no token in the URL — the code
 * and the new password are submitted together. The address comes from the
 * forgot-password step, and is asked for again when it isn't there (e.g. the
 * user finishes on another tab).
 */
export function ResetPasswordOtp(props: ResetPasswordOtpProps) {
  const auth = useAuth()
  const { localization: emailOtpLocalization, otpLength } =
    useAuthPlugin(emailOtpPlugin)

  const storedEmail =
    typeof sessionStorage === "undefined"
      ? ""
      : (sessionStorage.getItem(RESET_PASSWORD_OTP_STORAGE_KEY) ?? "")

  const hasStoredEmail = Boolean(storedEmail)
  const resetPassword = createMutation(() => ({
    ...resetPasswordOtpOptions(auth.authClient as EmailOtpAuthClient),
    onError: (error) => {
      // The haveIBeenPwned plugin rejects on the password itself, so it
      // belongs against the field rather than in a toast.
      if (isPasswordCompromisedError(error)) {
        setAuthFormServerError(
          form,
          { fields: { password: auth.localization.auth.passwordCompromised } },
          auth.localization.auth.passwordCompromised
        )
      }
      form.setFieldValue("code", "")
    },
    onSuccess: () => {
      sessionStorage.removeItem(RESET_PASSWORD_OTP_STORAGE_KEY)
      toast.success(auth.localization.auth.passwordResetSuccess)
      auth.navigate({
        to: `${auth.basePaths.auth}/${auth.viewPaths.auth.signIn}`
      })
    }
  }))

  const validatePassword = (value: string) =>
    validateStringLength(value, {
      maxLength: auth.emailAndPassword?.maxPasswordLength,
      maxLengthMessage: auth.localization.auth.tooLong.replace(
        "{{max}}",
        String(auth.emailAndPassword?.maxPasswordLength)
      ),
      minLength: auth.emailAndPassword?.minPasswordLength,
      minLengthMessage: auth.localization.auth.tooShort.replace(
        "{{min}}",
        String(auth.emailAndPassword?.minPasswordLength)
      ),
      requiredMessage: auth.localization.auth.fieldRequired
    })
  const form = createAuthForm(() => ({
    defaultValues: {
      code: "",
      confirmPassword: "",
      email: storedEmail,
      password: ""
    },
    onSubmit: async ({ value }) => {
      await resetPassword.mutateAsync({
        email: value.email,
        otp: value.code,
        password: value.password
      } as Parameters<typeof resetPassword.mutateAsync>[0])
    }
  }))
  const email = form.useSelector((state) => state.values.email)
  const password = form.useSelector((state) => state.values.password)

  return (
    <Card class={cn("w-full max-w-sm", props.class)}>
      <CardHeader>
        <CardTitle class="text-xl font-semibold">
          {auth.localization.auth.resetPassword}
        </CardTitle>

        <Show when={hasStoredEmail && email()}>
          <CardDescription>
            {emailOtpLocalization.codeSentTo.replace("{{email}}", email())}
          </CardDescription>
        </Show>
      </CardHeader>

      <CardContent>
        <form.AppForm>
          <form.AuthFormRoot aria-label={auth.localization.auth.resetPassword}>
            <FieldGroup>
              <Show when={!hasStoredEmail}>
                <form.AppField
                  name="email"
                  validators={{
                    onChange: ({ value }) =>
                      validateEmailAddress(value, {
                        invalidMessage: auth.localization.auth.invalidEmail,
                        requiredMessage: auth.localization.auth.fieldRequired
                      })
                  }}
                >
                  {(field) => (
                    <field.AuthFormTextField
                      autocomplete="email"
                      disabled={resetPassword.isPending}
                      id="reset-password-email"
                      label={auth.localization.auth.email}
                      placeholder={auth.localization.auth.emailPlaceholder}
                      type="email"
                    />
                  )}
                </form.AppField>
              </Show>

              <form.AppField
                name="code"
                validators={{
                  onChange: ({ value }) =>
                    value.length === otpLength
                      ? undefined
                      : emailOtpLocalization.codeLengthMismatch.replace(
                          "{{length}}",
                          String(otpLength)
                        )
                }}
              >
                {(field) => (
                  <OtpField
                    autofocus={hasStoredEmail}
                    disabled={resetPassword.isPending}
                    id="reset-password-code"
                    label={emailOtpLocalization.code}
                    length={otpLength}
                    name={field().name}
                    onInput={field().handleChange}
                    onComplete={() => void submitAuthForm(form)}
                    value={field().state.value}
                  />
                )}
              </form.AppField>

              <form.AppField
                name="password"
                validators={{
                  onChange: ({ value }) => validatePassword(value)
                }}
              >
                {(field) => (
                  <>
                    <field.AuthFormTextField
                      autocomplete="new-password"
                      disabled={resetPassword.isPending}
                      id="reset-password-password"
                      label={auth.localization.auth.newPassword}
                      placeholder={
                        auth.localization.auth.newPasswordPlaceholder
                      }
                      type="password"
                    />
                    <PasswordStrengthMeter password={password()} />
                  </>
                )}
              </form.AppField>

              <Show when={auth.emailAndPassword?.confirmPassword}>
                <form.AppField
                  name="confirmPassword"
                  validators={{
                    onChangeListenTo: ["password"],
                    onChange: ({ value }) =>
                      value === password()
                        ? undefined
                        : auth.localization.auth.passwordsDoNotMatch
                  }}
                >
                  {(field) => (
                    <field.AuthFormTextField
                      autocomplete="new-password"
                      disabled={resetPassword.isPending}
                      id="reset-password-confirm"
                      label={auth.localization.auth.confirmPassword}
                      placeholder={
                        auth.localization.auth.confirmPasswordPlaceholder
                      }
                      type="password"
                    />
                  )}
                </form.AppField>
              </Show>

              <form.AuthFormSubmitButton
                class="w-full"
                disabled={resetPassword.isPending}
              >
                {auth.localization.auth.resetPassword}
              </form.AuthFormSubmitButton>

              <Show when={email()}>
                <OpenEmailButton email={email()} variant="secondary" />
              </Show>
              <form.AuthFormServerError />
            </FieldGroup>
          </form.AuthFormRoot>
        </form.AppForm>
      </CardContent>

      <CardFooter class="justify-center">
        <p class="text-sm text-muted-foreground">
          {auth.localization.auth.rememberYourPassword}{" "}
          <AuthLink
            class="underline underline-offset-4"
            href={getAuthLinkURL(
              `${auth.basePaths.auth}/${auth.viewPaths.auth.signIn}`,
              auth.redirectTo
            )}
          >
            {auth.localization.auth.signIn}
          </AuthLink>
        </p>
      </CardFooter>
    </Card>
  )
}
