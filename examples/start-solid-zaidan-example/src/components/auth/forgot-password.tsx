import { getViewURL } from "@better-auth-ui/core"
import {
  AuthLink,
  type AuthPlugin,
  useAuth,
  useFetchOptions,
  useRequestPasswordReset
} from "@better-auth-ui/solid"
import { createSignal, Show } from "solid-js"
import { RESET_LINK_SENT_STORAGE_KEY } from "@/components/auth/reset-link-sent"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
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
  const requestReset = useRequestPasswordReset(auth.authClient, () => ({
    onError: () => {
      resetFetchOptions()
    },
    onSuccess: (_data, variables) => {
      sessionStorage.setItem(RESET_LINK_SENT_STORAGE_KEY, variables.email)
      auth.navigate({
        to: `${auth.basePaths.auth}/${auth.viewPaths.auth.resetLinkSent}`
      })
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
      redirectTo:
        props.redirectTo ??
        getViewURL(
          auth.baseURL,
          auth.basePaths.auth,
          auth.viewPaths.auth.resetPassword
        )
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
            <Field data-invalid={Boolean(emailError())}>
              <FieldLabel for="forgot-password-email">
                {auth.localization.auth.email}
              </FieldLabel>
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
                {(message) => <FieldError>{message()}</FieldError>}
              </Show>
            </Field>
            <Show when={captchaComponent()} keyed>
              {(Captcha) => <Captcha />}
            </Show>
            <Button disabled={requestReset.isPending} type="submit">
              {requestReset.isPending
                ? `${auth.localization.auth.sendResetLink}…`
                : auth.localization.auth.sendResetLink}
            </Button>
            <Show when={requestReset.isError}>
              <Alert variant="destructive">
                <AlertDescription>
                  Unable to send a reset link. Try again.
                </AlertDescription>
              </Alert>
            </Show>
          </div>
        </form>

        <div class="mt-4 flex w-full flex-col items-center gap-3">
          <p class="text-center text-sm text-muted-foreground">
            {auth.localization.auth.rememberYourPassword}{" "}
            <AuthLink
              class="underline underline-offset-4"
              href={`${auth.basePaths.auth}/${auth.viewPaths.auth.signIn}`}
            >
              {auth.localization.auth.signIn}
            </AuthLink>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
