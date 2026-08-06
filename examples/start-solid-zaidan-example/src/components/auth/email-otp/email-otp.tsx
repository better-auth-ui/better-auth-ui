import {
  type EmailOtpAuthClient,
  sendVerificationOtpOptions,
  signInEmailOtpOptions
} from "@better-auth-ui/core/plugins/email-otp"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import { createMutation } from "@tanstack/solid-query"
import { createSignal, Show } from "solid-js"

import { OpenEmailButton } from "@/components/auth/open-email-button"
import { OtpField } from "@/components/auth/otp-field"
import {
  ProviderButtons,
  type SocialLayout
} from "@/components/auth/provider-buttons"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
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
import { useResendCooldown } from "@/lib/auth/use-resend-cooldown"
import { useSignInContinuation } from "@/lib/auth/use-sign-in-continuation"
import { cn } from "@/lib/utils"

export type EmailOtpProps = {
  class?: string
  socialLayout?: SocialLayout
  socialPosition?: "bottom" | "top"
}

/**
 * Passwordless sign-in with an emailed one-time code.
 *
 * Two steps on one route: enter an email, then enter the code that arrives.
 * The email step never reveals whether an account exists — the server decides
 * whether the code creates an account, mirroring `emailOTP({ disableSignUp })`.
 */
export function EmailOtp(props: EmailOtpProps) {
  const auth = useAuth()
  const { localization: emailOtpLocalization, otpLength } =
    useAuthPlugin(emailOtpPlugin)
  const continueSignIn = useSignInContinuation()
  const { cooldown, isCoolingDown, startCooldown } = useResendCooldown()

  const [email, setEmail] = createSignal("")
  const [emailError, setEmailError] = createSignal<string>()
  const [code, setCode] = createSignal("")
  const [codeSent, setCodeSent] = createSignal(false)

  const otpClient = () => auth.authClient as EmailOtpAuthClient

  const sendCode = createMutation(() => ({
    ...sendVerificationOtpOptions(otpClient()),
    onSuccess: () => {
      setCodeSent(true)
      startCooldown()
    }
  }))

  const signIn = createMutation(() => ({
    ...signInEmailOtpOptions(otpClient()),
    onError: () => setCode(""),
    onSuccess: (data) => continueSignIn(data)
  }))

  const isPending = () => sendCode.isPending || signIn.isPending

  const requestCode = () =>
    sendCode.mutate({ email: email(), type: "sign-in" } as Parameters<
      typeof sendCode.mutate
    >[0])

  const verifyCode = (completedCode: string) => {
    if (isPending()) return

    signIn.mutate({ email: email(), otp: completedCode } as Parameters<
      typeof signIn.mutate
    >[0])
  }

  const submit = (event: SubmitEvent & { currentTarget: HTMLFormElement }) => {
    event.preventDefault()

    if (!codeSent()) {
      requestCode()
      return
    }

    verifyCode(code())
  }

  const socialPosition = () => props.socialPosition ?? "bottom"
  const showSeparator = () => Boolean(auth.socialProviders?.length)

  return (
    <Card class={cn("w-full max-w-sm", props.class)}>
      <CardHeader>
        <CardTitle class="text-xl font-semibold">
          {auth.localization.auth.signIn}
        </CardTitle>

        <Show when={codeSent()}>
          <CardDescription>
            {emailOtpLocalization.codeSentTo.replace("{{email}}", email())}
          </CardDescription>
        </Show>
      </CardHeader>

      <CardContent>
        <div class="flex flex-col gap-6">
          <Show
            when={
              socialPosition() === "top" &&
              !codeSent() &&
              auth.socialProviders?.length
            }
          >
            <ProviderButtons socialLayout={props.socialLayout} />

            <Show when={showSeparator()}>
              <div class="text-center text-muted-foreground text-xs">
                {auth.localization.auth.or}
              </div>
            </Show>
          </Show>

          <form aria-label={auth.localization.auth.signIn} onSubmit={submit}>
            <FieldGroup>
              <Show
                when={codeSent()}
                fallback={
                  <Field data-invalid={Boolean(emailError())}>
                    <FieldLabel for="email-otp-email">
                      {auth.localization.auth.email}
                    </FieldLabel>

                    <Input
                      aria-invalid={Boolean(emailError())}
                      autocomplete="email"
                      disabled={isPending()}
                      id="email-otp-email"
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
                }
              >
                <OtpField
                  autofocus
                  disabled={isPending()}
                  id="email-otp-code"
                  label={emailOtpLocalization.code}
                  length={otpLength}
                  name="otp"
                  onInput={setCode}
                  onComplete={verifyCode}
                  value={code()}
                />
              </Show>

              <div class="flex flex-col gap-3">
                <Button
                  class="w-full"
                  disabled={
                    isPending() || (codeSent() && code().length !== otpLength)
                  }
                  type="submit"
                >
                  <Show when={isPending()}>
                    <Spinner />
                  </Show>

                  {codeSent()
                    ? emailOtpLocalization.verifyCode
                    : emailOtpLocalization.sendCode}
                </Button>

                <Show when={codeSent()}>
                  <OpenEmailButton email={email()} variant="secondary" />

                  <Button
                    class="w-full"
                    disabled={isPending() || isCoolingDown()}
                    onClick={requestCode}
                    type="button"
                    variant="outline"
                  >
                    {isCoolingDown()
                      ? auth.localization.auth.resendIn.replace(
                          "{{seconds}}",
                          String(cooldown())
                        )
                      : auth.localization.auth.resend}
                  </Button>

                  <Button
                    class="w-full"
                    disabled={isPending()}
                    onClick={() => {
                      setCodeSent(false)
                      setCode("")
                    }}
                    type="button"
                    variant="ghost"
                  >
                    {emailOtpLocalization.useDifferentEmail}
                  </Button>
                </Show>
              </div>
            </FieldGroup>
          </form>

          <Show
            when={
              socialPosition() === "bottom" &&
              !codeSent() &&
              auth.socialProviders?.length
            }
          >
            <Show when={showSeparator()}>
              <div class="text-center text-muted-foreground text-xs">
                {auth.localization.auth.or}
              </div>
            </Show>

            <ProviderButtons socialLayout={props.socialLayout} />
          </Show>
        </div>
      </CardContent>
    </Card>
  )
}
