import {
  createAuthMutation,
  requestPasswordResetOptions,
  useAuth,
  useFetchOptions
} from "@better-auth-ui/solid"
import type { AuthPlugin } from "@better-auth-ui/solid/plugins"
import { Link } from "@tanstack/solid-router"
import { createSignal, Show } from "solid-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export type ForgotPasswordProps = {
  class?: string
  redirectTo?: string
}

export function ForgotPassword(props: ForgotPasswordProps) {
  const auth = useAuth()
  const { fetchOptions, resetFetchOptions } = useFetchOptions()
  const [email, setEmail] = createSignal("")
  const [emailError, setEmailError] = createSignal<string>()
  const requestReset = createAuthMutation(() => ({
    ...requestPasswordResetOptions(auth.authClient),
    onError: () => {
      resetFetchOptions()
    }
  }))

  const captchaComponent = () =>
    (auth.plugins as AuthPlugin[]).find((plugin) => plugin.captchaComponent)
      ?.captchaComponent

  const submitPasswordReset = (event: SubmitEvent) => {
    event.preventDefault()

    requestReset.mutate({
      email: email(),
      fetchOptions: fetchOptions(),
      redirectTo: props.redirectTo
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
        <form aria-label="Forgot password" onSubmit={submitPasswordReset}>
          <div class="flex flex-col gap-6">
            <div class="grid gap-3">
              <Label for="forgot-password-email">
                {auth.localization.auth.email}
              </Label>
              <Input
                aria-invalid={Boolean(emailError())}
                id="forgot-password-email"
                name="email"
                onInput={(event) => {
                  setEmail(event.currentTarget.value)
                  setEmailError(undefined)
                }}
                onInvalid={(event) => {
                  event.preventDefault()
                  setEmailError(event.currentTarget.validationMessage)
                }}
                placeholder={auth.localization.auth.emailPlaceholder}
                required
                type="email"
                value={email()}
              />

              <Show when={emailError()}>
                {(message) => (
                  <p class="text-sm text-destructive" role="alert">
                    {message()}
                  </p>
                )}
              </Show>
            </div>
            <Show when={captchaComponent()} keyed>
              {(Captcha) => <Captcha />}
            </Show>
            <Button disabled={requestReset.isPending} type="submit">
              {requestReset.isPending
                ? `${auth.localization.auth.sendResetLink}…`
                : auth.localization.auth.sendResetLink}
            </Button>
            <Show when={requestReset.isSuccess}>
              <p role="status">Check your email for the reset link.</p>
            </Show>
            <Show when={requestReset.isError}>
              <p role="alert">Unable to send a reset link. Try again.</p>
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
