import { resetPasswordOptions, useAuth } from "@better-auth-ui/solid"
import { createMutation } from "@tanstack/solid-query"
import { createSignal, Show } from "solid-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type ResetPasswordProps = {
  token?: string
}

const tokenFromLocation = () => {
  if (typeof window === "undefined") return undefined

  return new URLSearchParams(window.location.search).get("token") ?? undefined
}

export function ResetPassword(props: ResetPasswordProps) {
  const auth = useAuth()
  const [password, setPassword] = createSignal("")
  const [confirmPassword, setConfirmPassword] = createSignal("")
  const [tokenError, setTokenError] = createSignal(false)
  const [passwordsDoNotMatch, setPasswordsDoNotMatch] = createSignal(false)
  const resetPassword = createMutation(() =>
    resetPasswordOptions(auth.authClient)
  )

  const submitPasswordReset = (event: SubmitEvent) => {
    event.preventDefault()
    const token = props.token ?? tokenFromLocation()

    setTokenError(!token)
    setPasswordsDoNotMatch(password() !== confirmPassword())

    if (!token || password() !== confirmPassword()) return

    resetPassword.mutate({ token, newPassword: password() })
  }

  return (
    <Card class="w-full max-w-sm">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">
          {auth.localization.auth.resetPassword}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form aria-label="Reset password" onSubmit={submitPasswordReset}>
          <div class="flex flex-col gap-6">
            <div class="grid gap-3">
              <Label for="reset-password-new">
                {auth.localization.auth.newPassword}
              </Label>
              <Input
                autocomplete="new-password"
                id="reset-password-new"
                maxLength={auth.emailAndPassword.maxPasswordLength}
                minLength={auth.emailAndPassword.minPasswordLength}
                name="password"
                onInput={(event) => setPassword(event.currentTarget.value)}
                placeholder={auth.localization.auth.newPasswordPlaceholder}
                required
                type="password"
                value={password()}
              />
            </div>
            <div class="grid gap-3">
              <Label for="reset-password-confirm">
                {auth.localization.auth.confirmPassword}
              </Label>
              <Input
                autocomplete="new-password"
                id="reset-password-confirm"
                maxLength={auth.emailAndPassword.maxPasswordLength}
                minLength={auth.emailAndPassword.minPasswordLength}
                name="confirmPassword"
                onInput={(event) =>
                  setConfirmPassword(event.currentTarget.value)
                }
                placeholder={auth.localization.auth.confirmPasswordPlaceholder}
                required
                type="password"
                value={confirmPassword()}
              />
            </div>
            <Button disabled={resetPassword.isPending} type="submit">
              {resetPassword.isPending
                ? `${auth.localization.auth.resetPassword}…`
                : auth.localization.auth.resetPassword}
            </Button>
            <Show when={tokenError()}>
              <p role="alert">
                Reset token is required. Open the link from your email.
              </p>
            </Show>
            <Show when={passwordsDoNotMatch()}>
              <p role="alert">Passwords do not match.</p>
            </Show>
            <Show when={resetPassword.isSuccess}>
              <p role="status">
                Password reset successfully. You can sign in with your new
                password.
              </p>
            </Show>
            <Show when={resetPassword.isError}>
              <p role="alert">Unable to reset your password. Try again.</p>
            </Show>
          </div>
        </form>

        <div class="mt-4 flex w-full flex-col items-center gap-3">
          <p class="text-center text-sm text-muted-foreground">
            {auth.localization.auth.rememberYourPassword}{" "}
            <a
              class="underline underline-offset-4"
              href={`${auth.basePaths.auth}/${auth.viewPaths.auth.signIn}`}
            >
              {auth.localization.auth.signIn}
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
