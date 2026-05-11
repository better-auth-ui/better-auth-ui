import { resetPasswordOptions, useAuth } from "@better-auth-ui/solid"
import { createMutation } from "@tanstack/solid-query"
import { createSignal, Show } from "solid-js"
import { Button } from "@/components/ui/button"
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
    <form aria-label="Reset password" onSubmit={submitPasswordReset}>
      <h1>Reset password</h1>
      <p>Choose a new password for your account.</p>
      <Label for="reset-password-new">New password</Label>
      <Input
        autocomplete="new-password"
        id="reset-password-new"
        maxLength={auth.emailAndPassword.maxPasswordLength}
        minLength={auth.emailAndPassword.minPasswordLength}
        name="password"
        onInput={(event) => setPassword(event.currentTarget.value)}
        required
        type="password"
        value={password()}
      />
      <Label for="reset-password-confirm">Confirm password</Label>
      <Input
        autocomplete="new-password"
        id="reset-password-confirm"
        maxLength={auth.emailAndPassword.maxPasswordLength}
        minLength={auth.emailAndPassword.minPasswordLength}
        name="confirmPassword"
        onInput={(event) => setConfirmPassword(event.currentTarget.value)}
        required
        type="password"
        value={confirmPassword()}
      />
      <Button disabled={resetPassword.isPending} type="submit">
        {resetPassword.isPending ? "Resetting…" : "Reset password"}
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
          Password reset successfully. You can sign in with your new password.
        </p>
      </Show>
      <Show when={resetPassword.isError}>
        <p role="alert">Unable to reset your password. Try again.</p>
      </Show>
    </form>
  )
}
