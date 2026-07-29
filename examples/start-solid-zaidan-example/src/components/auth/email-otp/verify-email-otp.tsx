import { getAuthLinkURL } from "@better-auth-ui/core"
import {
  type EmailOtpAuthClient,
  sendVerificationOtpOptions,
  verifyEmailOtpOptions
} from "@better-auth-ui/core/plugins/email-otp"
import { AuthLink, useAuth, useAuthPlugin } from "@better-auth-ui/solid"
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
import {
  RESEND_COOLDOWN_SECONDS,
  useResendCooldown
} from "@/lib/auth/use-resend-cooldown"
import { cn } from "@/lib/utils"

/** `sessionStorage` key the sign-up and sign-in flows store the pending address under. */
export const VERIFY_EMAIL_STORAGE_KEY = "better-auth-ui.verify-email"

export type VerifyEmailOtpProps = {
  class?: string
}

/**
 * Verify an email address with a code instead of a link.
 *
 * Replaces the built-in `<VerifyEmail />` view when the email-OTP plugin runs
 * with `emailVerification: true`. The address comes from session storage when
 * sign-up or sign-in put it there; otherwise the user types it and requests a
 * code. Sign-up already triggered a send, so the resend button starts on
 * cooldown just like the link-based view.
 */
export function VerifyEmailOtp(props: VerifyEmailOtpProps) {
  const auth = useAuth()
  const { localization: emailOtpLocalization, otpLength } =
    useAuthPlugin(emailOtpPlugin)

  const storedEmail =
    typeof sessionStorage === "undefined"
      ? ""
      : (sessionStorage.getItem(VERIFY_EMAIL_STORAGE_KEY) ?? "")

  const [email, setEmail] = createSignal(storedEmail)
  const [emailError, setEmailError] = createSignal<string>()
  const [code, setCode] = createSignal("")
  const { cooldown, isCoolingDown, startCooldown } = useResendCooldown(
    storedEmail ? RESEND_COOLDOWN_SECONDS : 0
  )

  const otpClient = () => auth.authClient as EmailOtpAuthClient

  const sendCode = createMutation(() => ({
    ...sendVerificationOtpOptions(otpClient()),
    onSuccess: (_data, variables) => {
      const sentTo = (variables as { email: string }).email
      sessionStorage.setItem(VERIFY_EMAIL_STORAGE_KEY, sentTo)
      setEmail(sentTo)
      startCooldown()
      toast.success(emailOtpLocalization.codeSent)
    }
  }))

  const verifyEmail = createMutation(() => ({
    ...verifyEmailOtpOptions(otpClient()),
    onError: () => setCode(""),
    onSuccess: () => {
      sessionStorage.removeItem(VERIFY_EMAIL_STORAGE_KEY)
      toast.success(emailOtpLocalization.emailVerified)
      auth.navigate({ to: auth.redirectTo })
    }
  }))

  const isPending = () => sendCode.isPending || verifyEmail.isPending

  const verifyCode = (completedCode: string) => {
    if (isPending() || !email()) return

    verifyEmail.mutate({ email: email(), otp: completedCode } as Parameters<
      typeof verifyEmail.mutate
    >[0])
  }

  const submit = (event: SubmitEvent & { currentTarget: HTMLFormElement }) => {
    event.preventDefault()

    if (!email()) {
      const formData = new FormData(event.currentTarget)
      sendCode.mutate({
        email: formData.get("email") as string,
        type: "email-verification"
      } as Parameters<typeof sendCode.mutate>[0])
      return
    }

    verifyCode(code())
  }

  return (
    <Card class={cn("w-full max-w-sm", props.class)}>
      <CardHeader>
        <CardTitle class="text-xl font-semibold">
          {auth.localization.auth.verifyEmail}
        </CardTitle>

        <Show when={email()}>
          <CardDescription>
            {emailOtpLocalization.codeSentTo.replace("{{email}}", email())}
          </CardDescription>
        </Show>
      </CardHeader>

      <CardContent>
        <form aria-label={auth.localization.auth.verifyEmail} onSubmit={submit}>
          <FieldGroup>
            <Show
              when={email()}
              fallback={
                <Field data-invalid={Boolean(emailError())}>
                  <FieldLabel for="verify-email-address">
                    {auth.localization.auth.email}
                  </FieldLabel>

                  <Input
                    aria-invalid={Boolean(emailError())}
                    autocomplete="email"
                    disabled={isPending()}
                    id="verify-email-address"
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
              }
            >
              <OtpField
                autofocus
                disabled={isPending()}
                id="verify-email-code"
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
                  isPending() ||
                  (Boolean(email()) && code().length !== otpLength)
                }
                type="submit"
              >
                <Show when={isPending()}>
                  <Spinner />
                </Show>

                {email()
                  ? emailOtpLocalization.verifyCode
                  : emailOtpLocalization.sendCode}
              </Button>

              <Show when={email()}>
                <OpenEmailButton email={email()} variant="secondary" />

                <Button
                  class="w-full"
                  disabled={isPending() || isCoolingDown()}
                  onClick={() =>
                    sendCode.mutate({
                      email: email(),
                      type: "email-verification"
                    } as Parameters<typeof sendCode.mutate>[0])
                  }
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
              </Show>
            </div>
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter class="justify-center">
        <p class="text-sm text-muted-foreground">
          {auth.localization.auth.alreadyVerifiedYourEmail}{" "}
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
