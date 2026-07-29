import { getAuthLinkURL } from "@better-auth-ui/core"
import {
  AuthLink,
  type EmailOtpAuthClient,
  requestPasswordResetOtpOptions,
  useAuth,
  useAuthPlugin,
  useFetchOptions
} from "@better-auth-ui/solid"
import { createMutation } from "@tanstack/solid-query"
import { createSignal, Show } from "solid-js"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Field,
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

  const [emailError, setEmailError] = createSignal<string>()

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

  const submit = (event: SubmitEvent & { currentTarget: HTMLFormElement }) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    requestReset.mutate({
      email: formData.get("email") as string,
      fetchOptions
    } as Parameters<typeof requestReset.mutate>[0])
  }

  return (
    <Card class={cn("w-full max-w-sm", props.class)}>
      <CardHeader>
        <CardTitle class="text-xl font-semibold">
          {auth.localization.auth.forgotPassword}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form
          aria-label={auth.localization.auth.forgotPassword}
          onSubmit={submit}
        >
          <FieldGroup>
            <Field data-invalid={Boolean(emailError())}>
              <FieldLabel for="forgot-password-email">
                {auth.localization.auth.email}
              </FieldLabel>

              <Input
                aria-invalid={Boolean(emailError())}
                autocomplete="email"
                disabled={requestReset.isPending}
                id="forgot-password-email"
                name="email"
                onInput={() => setEmailError(undefined)}
                onInvalid={(event) => {
                  event.preventDefault()
                  setEmailError(event.currentTarget.validationMessage)
                }}
                placeholder={auth.localization.auth.emailPlaceholder}
                required
                type="email"
              />

              <Show when={emailError()}>
                {(message) => <FieldError>{message()}</FieldError>}
              </Show>
            </Field>

            <Button
              class="w-full"
              disabled={requestReset.isPending}
              type="submit"
            >
              <Show when={requestReset.isPending}>
                <Spinner />
              </Show>

              {emailOtpLocalization.sendCode}
            </Button>
          </FieldGroup>
        </form>
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
