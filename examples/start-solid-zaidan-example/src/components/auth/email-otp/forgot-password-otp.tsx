import { getAuthLinkURL, validateEmailAddress } from "@better-auth-ui/core"
import {
  type EmailOtpAuthClient,
  requestPasswordResetOtpOptions
} from "@better-auth-ui/core/plugins/email-otp"
import {
  AuthLink,
  useAuth,
  useAuthPlugin,
  useFetchOptions
} from "@better-auth-ui/solid"
import { createMutation } from "@tanstack/solid-query"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { emailOtpPlugin } from "@/lib/auth/email-otp-plugin"
import { cn } from "@/lib/utils"
import { createAuthForm } from "../auth-form"

/** `sessionStorage` key the reset-code form reads the pending address from. */
export const RESET_PASSWORD_OTP_STORAGE_KEY =
  "better-auth-ui.reset-password-otp"

export type ForgotPasswordOtpProps = {
  class?: string
}

/**
 * Request a password-reset code instead of a reset link.
 *
 * Replaces the built-in `<ForgotPassword />` view when the email-OTP plugin
 * runs with `passwordReset: true`. On success the address is stored and the
 * user continues on `/auth/reset-password`, which asks for the code and the
 * new password — the reset-link-sent view is skipped entirely.
 */
export function ForgotPasswordOtp(props: ForgotPasswordOtpProps) {
  const auth = useAuth()
  const { localization: emailOtpLocalization } = useAuthPlugin(emailOtpPlugin)
  const { fetchOptions, resetFetchOptions } = useFetchOptions()

  const requestReset = createMutation(() => ({
    ...requestPasswordResetOtpOptions(auth.authClient as EmailOtpAuthClient),
    onError: () => resetFetchOptions(),
    onSuccess: (_data, variables) => {
      sessionStorage.setItem(
        RESET_PASSWORD_OTP_STORAGE_KEY,
        (variables as { email: string }).email
      )
      auth.navigate({
        to: `${auth.basePaths.auth}/${auth.viewPaths.auth.resetPassword}`
      })
    }
  }))

  const form = createAuthForm(() => ({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) => {
      await requestReset.mutateAsync({
        email: value.email,
        fetchOptions: fetchOptions()
      } as Parameters<typeof requestReset.mutateAsync>[0])
    }
  }))

  return (
    <Card class={cn("w-full max-w-sm", props.class)}>
      <CardHeader>
        <CardTitle class="text-xl font-semibold">
          {auth.localization.auth.forgotPassword}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form.AppForm>
          <form.AuthFormRoot aria-label={auth.localization.auth.forgotPassword}>
            <div class="flex flex-col gap-6">
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
                    disabled={requestReset.isPending}
                    id="forgot-password-email"
                    label={auth.localization.auth.email}
                    placeholder={auth.localization.auth.emailPlaceholder}
                    type="email"
                  />
                )}
              </form.AppField>
              <form.AuthFormSubmitButton
                class="w-full"
                disabled={requestReset.isPending}
              >
                {emailOtpLocalization.sendCode}
              </form.AuthFormSubmitButton>
              <form.AuthFormServerError />
            </div>
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
