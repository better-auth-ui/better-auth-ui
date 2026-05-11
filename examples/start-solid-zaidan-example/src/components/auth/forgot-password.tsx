import { requestPasswordResetOptions, useAuth } from "@better-auth-ui/solid"
import { createMutation } from "@tanstack/solid-query"
import { createSignal, Show } from "solid-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type ForgotPasswordProps = {
  redirectTo?: string
}

export function ForgotPassword(props: ForgotPasswordProps) {
  const auth = useAuth()
  const [email, setEmail] = createSignal("")
  const requestReset = createMutation(() =>
    requestPasswordResetOptions(auth.authClient)
  )

  const submitPasswordReset = (event: SubmitEvent) => {
    event.preventDefault()

    requestReset.mutate({
      email: email(),
      redirectTo: props.redirectTo
    })
  }

  return (
    <form aria-label="Forgot password" onSubmit={submitPasswordReset}>
      <h1>Forgot password</h1>
      <p>Enter your email and we&apos;ll send a password reset link.</p>
      <Label for="forgot-password-email">Email</Label>
      <Input
        id="forgot-password-email"
        name="email"
        onInput={(event) => setEmail(event.currentTarget.value)}
        required
        type="email"
        value={email()}
      />
      <Button disabled={requestReset.isPending} type="submit">
        {requestReset.isPending ? "Sending…" : "Send reset link"}
      </Button>
      <Show when={requestReset.isSuccess}>
        <p role="status">Check your email for the reset link.</p>
      </Show>
      <Show when={requestReset.isError}>
        <p role="alert">Unable to send a reset link. Try again.</p>
      </Show>
    </form>
  )
}
