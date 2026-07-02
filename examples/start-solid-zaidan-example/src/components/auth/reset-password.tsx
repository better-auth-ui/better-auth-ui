import { useAuth, useResetPassword } from "@better-auth-ui/solid"
import { Link } from "@tanstack/solid-router"
import { Eye, EyeOff } from "lucide-solid"
import { createSignal, Show } from "solid-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export type ResetPasswordProps = {
  class?: string
  token?: string
}

const tokenFromLocation = () => {
  if (typeof window === "undefined") return undefined

  return new URLSearchParams(window.location.search).get("token")
}

export function ResetPassword(props: ResetPasswordProps) {
  const auth = useAuth()
  const [password, setPassword] = createSignal("")
  const [passwordError, setPasswordError] = createSignal<string>()
  const [confirmPassword, setConfirmPassword] = createSignal("")
  const [confirmPasswordError, setConfirmPasswordError] = createSignal<string>()
  const [tokenError, setTokenError] = createSignal<string>()
  const [isPasswordVisible, setIsPasswordVisible] = createSignal(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    createSignal(false)
  const resetPassword = useResetPassword(auth.authClient)

  const submitPasswordReset = (event: SubmitEvent) => {
    event.preventDefault()
    const token = props.token ?? tokenFromLocation()

    setTokenError(
      token ? undefined : auth.localization.auth.invalidResetPasswordToken
    )
    setConfirmPasswordError(
      password() === confirmPassword()
        ? undefined
        : auth.localization.auth.passwordsDoNotMatch
    )

    if (!token || password() !== confirmPassword()) return

    resetPassword.mutate({ token, newPassword: password() })
  }

  return (
    <Card class={cn("w-full max-w-sm", props.class)}>
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
              <div class="relative">
                <Input
                  aria-invalid={Boolean(passwordError())}
                  autocomplete="new-password"
                  class="pr-12"
                  id="reset-password-new"
                  maxLength={auth.emailAndPassword.maxPasswordLength}
                  minLength={auth.emailAndPassword.minPasswordLength}
                  name="password"
                  onInput={(event) => {
                    setPassword(event.currentTarget.value)
                    setPasswordError(undefined)
                    setConfirmPasswordError(undefined)
                  }}
                  onInvalid={(event) => {
                    event.preventDefault()
                    setPasswordError(event.currentTarget.validationMessage)
                  }}
                  placeholder={auth.localization.auth.newPasswordPlaceholder}
                  required
                  type={isPasswordVisible() ? "text" : "password"}
                  value={password()}
                />

                <Button
                  aria-label={
                    isPasswordVisible()
                      ? auth.localization.auth.hidePassword
                      : auth.localization.auth.showPassword
                  }
                  class="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={() => setIsPasswordVisible((visible) => !visible)}
                  size="icon-sm"
                  title={
                    isPasswordVisible()
                      ? auth.localization.auth.hidePassword
                      : auth.localization.auth.showPassword
                  }
                  type="button"
                  variant="ghost"
                >
                  {isPasswordVisible() ? (
                    <EyeOff aria-hidden class="size-4" />
                  ) : (
                    <Eye aria-hidden class="size-4" />
                  )}
                </Button>
              </div>

              <Show when={passwordError()}>
                {(message) => (
                  <p class="text-sm text-destructive" role="alert">
                    {message()}
                  </p>
                )}
              </Show>
            </div>
            <div class="grid gap-3">
              <Label for="reset-password-confirm">
                {auth.localization.auth.confirmPassword}
              </Label>
              <div class="relative">
                <Input
                  aria-invalid={Boolean(confirmPasswordError())}
                  autocomplete="new-password"
                  class="pr-12"
                  id="reset-password-confirm"
                  maxLength={auth.emailAndPassword.maxPasswordLength}
                  minLength={auth.emailAndPassword.minPasswordLength}
                  name="confirmPassword"
                  onInput={(event) => {
                    setConfirmPassword(event.currentTarget.value)
                    setConfirmPasswordError(undefined)
                  }}
                  onInvalid={(event) => {
                    event.preventDefault()
                    setConfirmPasswordError(
                      event.currentTarget.validationMessage
                    )
                  }}
                  placeholder={
                    auth.localization.auth.confirmPasswordPlaceholder
                  }
                  required
                  type={isConfirmPasswordVisible() ? "text" : "password"}
                  value={confirmPassword()}
                />

                <Button
                  aria-label={
                    isConfirmPasswordVisible()
                      ? auth.localization.auth.hidePassword
                      : auth.localization.auth.showPassword
                  }
                  class="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={() =>
                    setIsConfirmPasswordVisible((visible) => !visible)
                  }
                  size="icon-sm"
                  title={
                    isConfirmPasswordVisible()
                      ? auth.localization.auth.hidePassword
                      : auth.localization.auth.showPassword
                  }
                  type="button"
                  variant="ghost"
                >
                  {isConfirmPasswordVisible() ? (
                    <EyeOff aria-hidden class="size-4" />
                  ) : (
                    <Eye aria-hidden class="size-4" />
                  )}
                </Button>
              </div>

              <Show when={confirmPasswordError()}>
                {(message) => (
                  <p class="text-sm text-destructive" role="alert">
                    {message()}
                  </p>
                )}
              </Show>
            </div>
            <Button disabled={resetPassword.isPending} type="submit">
              {resetPassword.isPending
                ? `${auth.localization.auth.resetPassword}…`
                : auth.localization.auth.resetPassword}
            </Button>
            <Show when={tokenError()}>
              {(message) => <p role="alert">{message()}</p>}
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
            <Link
              class="underline underline-offset-4"
              params={{ path: auth.viewPaths.auth.signIn }}
              to="/auth/$path"
            >
              {auth.localization.auth.signIn}
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
