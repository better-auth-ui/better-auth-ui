import {
  type EmailOtpAuthClient,
  resetPasswordOtpOptions,
  useAuth,
  useAuthPlugin
} from "@better-auth-ui/solid"
import { createMutation } from "@tanstack/solid-query"
import { Link } from "@tanstack/solid-router"
import { createSignal, Show } from "solid-js"
import { toast } from "solid-sonner"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

  const [email] = createSignal(storedEmail)
  const [code, setCode] = createSignal("")
  const [passwordError, setPasswordError] = createSignal<string>()

  const resetPassword = createMutation(() => ({
    ...resetPasswordOtpOptions(auth.authClient as EmailOtpAuthClient),
    onError: () => setCode(""),
    onSuccess: () => {
      sessionStorage.removeItem(RESET_PASSWORD_OTP_STORAGE_KEY)
      toast.success(auth.localization.auth.passwordResetSuccess)
      auth.navigate({
        to: `${auth.basePaths.auth}/${auth.viewPaths.auth.signIn}`
      })
    }
  }))

  const submit = (event: SubmitEvent & { currentTarget: HTMLFormElement }) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (
      auth.emailAndPassword?.confirmPassword &&
      password !== confirmPassword
    ) {
      toast.error(auth.localization.auth.passwordsDoNotMatch)
      return
    }

    if (code().length !== otpLength) {
      toast.error(
        emailOtpLocalization.codeLengthMismatch.replace(
          "{{length}}",
          String(otpLength)
        )
      )
      return
    }

    resetPassword.mutate({
      email: email() || (formData.get("email") as string),
      otp: code(),
      password
    } as Parameters<typeof resetPassword.mutate>[0])
  }

  return (
    <Card class={cn("w-full max-w-sm", props.class)}>
      <CardHeader>
        <CardTitle class="text-xl font-semibold">
          {auth.localization.auth.resetPassword}
        </CardTitle>

        <Show when={email()}>
          <CardDescription>
            {emailOtpLocalization.codeSentTo.replace("{{email}}", email())}
          </CardDescription>
        </Show>
      </CardHeader>

      <CardContent>
        <form
          aria-label={auth.localization.auth.resetPassword}
          onSubmit={submit}
        >
          <div class="grid gap-3">
            <Show when={!email()}>
              <Label for="reset-password-email">
                {auth.localization.auth.email}
              </Label>

              <Input
                autocomplete="email"
                disabled={resetPassword.isPending}
                id="reset-password-email"
                name="email"
                placeholder={auth.localization.auth.emailPlaceholder}
                required
                type="email"
              />
            </Show>

            <OtpField
              autofocus={Boolean(email())}
              disabled={resetPassword.isPending}
              id="reset-password-code"
              label={emailOtpLocalization.code}
              length={otpLength}
              name="otp"
              onInput={setCode}
              value={code()}
            />

            <Label for="reset-password-password">
              {auth.localization.auth.newPassword}
            </Label>

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
              {(message) => (
                <p class="text-sm text-destructive" role="alert">
                  {message()}
                </p>
              )}
            </Show>

            <Show when={auth.emailAndPassword?.confirmPassword}>
              <Label for="reset-password-confirm">
                {auth.localization.auth.confirmPassword}
              </Label>

              <Input
                autocomplete="new-password"
                disabled={resetPassword.isPending}
                id="reset-password-confirm"
                maxLength={auth.emailAndPassword?.maxPasswordLength}
                minLength={auth.emailAndPassword?.minPasswordLength}
                name="confirmPassword"
                placeholder={auth.localization.auth.confirmPasswordPlaceholder}
                required
                type="password"
              />
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
          </div>
        </form>
      </CardContent>

      <CardFooter class="justify-center">
        <p class="text-sm text-muted-foreground">
          {auth.localization.auth.rememberYourPassword}{" "}
          <Link
            class="underline underline-offset-4"
            params={{ path: auth.viewPaths.auth.signIn }}
            to="/auth/$path"
          >
            {auth.localization.auth.signIn}
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
