import { getAuthLinkURL } from "@better-auth-ui/core"
import {
  AuthLink,
  type EmailOtpAuthClient,
  resetPasswordOtpOptions,
  useAuth,
  useAuthPlugin
} from "@better-auth-ui/solid"
import { createMutation } from "@tanstack/solid-query"
import { createSignal, Show } from "solid-js"
import { toast } from "solid-sonner"

import { OpenEmailButton } from "@/components/auth/open-email-button"
import { OtpField } from "@/components/auth/otp-field"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
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
  const [email, setEmail] = createSignal(storedEmail)
  const [code, setCode] = createSignal("")
  const [passwordError, setPasswordError] = createSignal<string>()
  let formRef: HTMLFormElement | undefined
  let submissionLocked = false

  const resetPassword = createMutation(() => ({
    ...resetPasswordOtpOptions(auth.authClient as EmailOtpAuthClient),
    onError: () => {
      submissionLocked = false
      setCode("")
    },
    onSuccess: () => {
      sessionStorage.removeItem(RESET_PASSWORD_OTP_STORAGE_KEY)
      toast.success(auth.localization.auth.passwordResetSuccess)
      auth.navigate({
        to: `${auth.basePaths.auth}/${auth.viewPaths.auth.signIn}`
      })
    }
  }))

  const submitReset = (
    form: HTMLFormElement,
    submittedCode: string,
    reportErrors: boolean
  ) => {
    if (resetPassword.isPending || submissionLocked) return

    const formData = new FormData(form)
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (
      auth.emailAndPassword?.confirmPassword &&
      password !== confirmPassword
    ) {
      if (reportErrors) {
        toast.error(auth.localization.auth.passwordsDoNotMatch)
      }
      return
    }

    if (submittedCode.length !== otpLength) {
      if (reportErrors) {
        toast.error(
          emailOtpLocalization.codeLengthMismatch.replace(
            "{{length}}",
            String(otpLength)
          )
        )
      }
      return
    }

    submissionLocked = true
    resetPassword.mutate({
      email: hasStoredEmail ? email() : (formData.get("email") as string),
      otp: submittedCode,
      password
    } as Parameters<typeof resetPassword.mutate>[0])
  }

  const tryAutoSubmit = (completedCode?: string) => {
    if (!formRef?.matches(":valid")) return

    const formData = new FormData(formRef)
    const submittedCode = completedCode ?? String(formData.get("otp") ?? "")

    submitReset(formRef, submittedCode, false)
  }

  const submit = (event: SubmitEvent & { currentTarget: HTMLFormElement }) => {
    event.preventDefault()
    submitReset(event.currentTarget, code(), true)
  }

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
        <form
          ref={formRef}
          aria-label={auth.localization.auth.resetPassword}
          onSubmit={submit}
        >
          <FieldGroup>
            <Show when={!hasStoredEmail}>
              <Field>
                <FieldLabel for="reset-password-email">
                  {auth.localization.auth.email}
                </FieldLabel>

                <Input
                  autocomplete="email"
                  disabled={resetPassword.isPending}
                  id="reset-password-email"
                  name="email"
                  onInput={(event) => setEmail(event.currentTarget.value)}
                  placeholder={auth.localization.auth.emailPlaceholder}
                  required
                  type="email"
                  value={email()}
                />
              </Field>
            </Show>

            <OtpField
              autofocus={hasStoredEmail}
              disabled={resetPassword.isPending}
              id="reset-password-code"
              label={emailOtpLocalization.code}
              length={otpLength}
              name="otp"
              onInput={setCode}
              onComplete={tryAutoSubmit}
              value={code()}
            />

            <Field data-invalid={Boolean(passwordError())}>
              <FieldLabel for="reset-password-password">
                {auth.localization.auth.newPassword}
              </FieldLabel>

              <Input
                aria-invalid={Boolean(passwordError())}
                autocomplete="new-password"
                disabled={resetPassword.isPending}
                id="reset-password-password"
                maxLength={auth.emailAndPassword?.maxPasswordLength}
                minLength={auth.emailAndPassword?.minPasswordLength}
                name="password"
                onInput={() => setPasswordError(undefined)}
                onInvalid={(event) => {
                  event.preventDefault()
                  setPasswordError(event.currentTarget.validationMessage)
                }}
                placeholder={auth.localization.auth.newPasswordPlaceholder}
                required
                type="password"
              />

              <Show when={passwordError()}>
                {(message) => <FieldError>{message()}</FieldError>}
              </Show>
            </Field>

            <Show when={auth.emailAndPassword?.confirmPassword}>
              <Field>
                <FieldLabel for="reset-password-confirm">
                  {auth.localization.auth.confirmPassword}
                </FieldLabel>

                <Input
                  autocomplete="new-password"
                  disabled={resetPassword.isPending}
                  id="reset-password-confirm"
                  maxLength={auth.emailAndPassword?.maxPasswordLength}
                  minLength={auth.emailAndPassword?.minPasswordLength}
                  name="confirmPassword"
                  placeholder={
                    auth.localization.auth.confirmPasswordPlaceholder
                  }
                  required
                  type="password"
                />
              </Field>
            </Show>

            <Button
              class="w-full"
              disabled={resetPassword.isPending}
              type="submit"
            >
              <Show when={resetPassword.isPending}>
                <Spinner />
              </Show>

              {auth.localization.auth.resetPassword}
            </Button>

            <Show when={email()}>
              <OpenEmailButton email={email()} variant="secondary" />
            </Show>
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
