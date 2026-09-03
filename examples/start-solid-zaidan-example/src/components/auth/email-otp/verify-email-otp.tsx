import { getAuthLinkURL, validateEmailAddress } from "@better-auth-ui/core"
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
import { FieldGroup } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { emailOtpPlugin } from "@/lib/auth/email-otp-plugin"
import {
  RESEND_COOLDOWN_SECONDS,
  useResendCooldown
} from "@/lib/auth/use-resend-cooldown"
import { cn } from "@/lib/utils"
import { createAuthForm, submitAuthForm } from "../auth-form"

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
  const [codeSent, setCodeSent] = createSignal(Boolean(storedEmail))

  const { cooldown, isCoolingDown, startCooldown } = useResendCooldown(
    storedEmail ? RESEND_COOLDOWN_SECONDS : 0
  )

  const otpClient = () => auth.authClient as EmailOtpAuthClient

  const sendCode = createMutation(() => ({
    ...sendVerificationOtpOptions(otpClient()),
    onSuccess: (_data, variables) => {
      const sentTo = (variables as { email: string }).email
      sessionStorage.setItem(VERIFY_EMAIL_STORAGE_KEY, sentTo)
      form.setFieldValue("email", sentTo)
      setCodeSent(true)
      startCooldown()
      toast.success(emailOtpLocalization.codeSent)
    }
  }))

  const verifyEmail = createMutation(() => ({
    ...verifyEmailOtpOptions(otpClient()),
    onError: () => form.setFieldValue("code", ""),
    onSuccess: () => {
      sessionStorage.removeItem(VERIFY_EMAIL_STORAGE_KEY)
      toast.success(emailOtpLocalization.emailVerified)
      auth.navigate({ to: auth.redirectTo })
    }
  }))

  const isPending = () => sendCode.isPending || verifyEmail.isPending

  const form = createAuthForm(() => ({
    defaultValues: { code: "", email: storedEmail },
    onSubmit: async ({ value }) => {
      if (!storedEmail && !sessionStorage.getItem(VERIFY_EMAIL_STORAGE_KEY)) {
        await sendCode.mutateAsync({
          email: value.email,
          type: "email-verification"
        } as Parameters<typeof sendCode.mutateAsync>[0])
        return
      }
      await verifyEmail.mutateAsync({
        email: value.email,
        otp: value.code
      } as Parameters<typeof verifyEmail.mutateAsync>[0])
    }
  }))
  const email = () => form.state.values.email
  const code = () => form.state.values.code
  const verifyCode = async (completedCode: string) => {
    if (isPending() || !email()) return
    form.setFieldValue("code", completedCode)
    await submitAuthForm(form)
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
        <form.AppForm>
          <form.AuthFormRoot aria-label={auth.localization.auth.verifyEmail}>
            <FieldGroup>
              <Show
                when={codeSent()}
                fallback={
                  <form.AppField
                    name="email"
                    validators={{
                      onChange: ({ value }) =>
                        validateEmailAddress(value, {
                          invalidMessage: auth.localization.auth.invalidEmail,
                          requiredMessage: auth.localization.auth.fieldRequired
                        })
                    }}
                  >
                    {(field) => (
                      <field.AuthFormTextField
                        autocomplete="email"
                        disabled={isPending()}
                        id="verify-email-address"
                        label={auth.localization.auth.email}
                        placeholder={auth.localization.auth.emailPlaceholder}
                        type="email"
                      />
                    )}
                  </form.AppField>
                }
              >
                <OtpField
                  autofocus
                  disabled={isPending()}
                  id="verify-email-code"
                  label={emailOtpLocalization.code}
                  length={otpLength}
                  name="otp"
                  onInput={(value) => form.setFieldValue("code", value)}
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
                    onClick={() =>
                      void sendCode.mutateAsync({
                        email: email(),
                        type: "email-verification"
                      } as Parameters<typeof sendCode.mutateAsync>[0])
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
              <form.AuthFormServerError />
            </FieldGroup>
          </form.AuthFormRoot>
        </form.AppForm>
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
