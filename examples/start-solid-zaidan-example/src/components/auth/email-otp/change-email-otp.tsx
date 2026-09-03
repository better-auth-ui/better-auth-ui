import { validateEmailAddress } from "@better-auth-ui/core"
import {
  changeEmailOtpOptions,
  type EmailOtpAuthClient,
  requestEmailChangeOtpOptions,
  sendVerificationOtpOptions
} from "@better-auth-ui/core/plugins/email-otp"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/solid"
import { createMutation } from "@tanstack/solid-query"
import { createSignal, Show } from "solid-js"
import { toast } from "solid-sonner"

import { OpenEmailButton } from "@/components/auth/open-email-button"
import { OtpField } from "@/components/auth/otp-field"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { emailOtpPlugin } from "@/lib/auth/email-otp-plugin"
import { cn } from "@/lib/utils"
import { createAuthForm, submitAuthForm } from "../auth-form"

type ChangeEmailStep = "email" | "currentCode" | "newCode"

export type ChangeEmailOtpProps = {
  class?: string
}

/** Change the account email with verification codes. */
export function ChangeEmailOtp(props: ChangeEmailOtpProps = {}) {
  const auth = useAuth()
  const {
    localization: emailOtpLocalization,
    otpLength,
    verifyCurrentEmail
  } = useAuthPlugin(emailOtpPlugin)
  const otpClient = () => auth.authClient as EmailOtpAuthClient
  const session = useSession(otpClient())
  const currentEmail = () => session.data?.user.email
  const [step, setStep] = createSignal<ChangeEmailStep>("email")

  const resetFlow = () => {
    form.reset()
    setStep("email")
  }
  const sendCode = createMutation(() => ({
    ...sendVerificationOtpOptions(otpClient())
  }))
  const requestChange = createMutation(() => ({
    ...requestEmailChangeOtpOptions(otpClient()),
    onError: () => form.setFieldValue("code", ""),
    onSuccess: () => {
      form.setFieldValue("code", "")
      setStep("newCode")
    }
  }))
  const changeEmail = createMutation(() => ({
    ...changeEmailOtpOptions(otpClient()),
    onError: () => form.setFieldValue("code", ""),
    onSuccess: () => {
      toast.success(auth.localization.settings.changeEmailSuccess)
      resetFlow()
    }
  }))
  const isPending = () =>
    sendCode.isPending || requestChange.isPending || changeEmail.isPending

  const form = createAuthForm(() => ({
    defaultValues: { code: "", email: "" },
    onSubmit: async ({ value }) => {
      if (step() === "email") {
        const current = currentEmail()
        if (verifyCurrentEmail && current) {
          await sendCode.mutateAsync({
            email: current,
            type: "change-email"
          } as Parameters<typeof sendCode.mutateAsync>[0])
          setStep("currentCode")
          return
        }
        await requestChange.mutateAsync({ newEmail: value.email } as Parameters<
          typeof requestChange.mutateAsync
        >[0])
        return
      }
      if (step() === "currentCode") {
        await requestChange.mutateAsync({
          newEmail: value.email,
          otp: value.code
        } as Parameters<typeof requestChange.mutateAsync>[0])
        return
      }
      await changeEmail.mutateAsync({
        newEmail: value.email,
        otp: value.code
      } as Parameters<typeof changeEmail.mutateAsync>[0])
    }
  }))
  const code = form.useSelector((state) => state.values.code)
  const email = form.useSelector((state) => state.values.email)
  const codeTarget = () => (step() === "currentCode" ? currentEmail() : email())
  const submitCode = async (completedCode: string) => {
    if (isPending() || step() === "email") return
    form.setFieldValue("code", completedCode)
    await submitAuthForm(form)
  }

  return (
    <div class={cn(props.class)}>
      <h2 class="mb-3 text-sm font-semibold">
        {auth.localization.settings.changeEmail}
      </h2>
      <form.AppForm>
        <form.AuthFormRoot>
          <Card>
            <CardContent class="flex flex-col gap-6">
              <Show
                when={step() === "email"}
                fallback={
                  <div class="flex flex-col gap-3">
                    <p class="text-muted-foreground text-sm">
                      {emailOtpLocalization.confirmEmailDescription.replace(
                        "{{email}}",
                        codeTarget() ?? ""
                      )}
                    </p>
                    <form.AppField
                      name="code"
                      validators={{
                        onChange: ({ value }) =>
                          value.length === otpLength
                            ? undefined
                            : emailOtpLocalization.codeLengthMismatch.replace(
                                "{{length}}",
                                String(otpLength)
                              )
                      }}
                    >
                      {(field) => (
                        <OtpField
                          autofocus
                          disabled={isPending()}
                          id="change-email-code"
                          label={
                            step() === "currentCode"
                              ? emailOtpLocalization.confirmCurrentEmail
                              : emailOtpLocalization.confirmNewEmail
                          }
                          length={otpLength}
                          name={field().name}
                          onInput={field().handleChange}
                          onComplete={(value) => void submitCode(value)}
                          value={field().state.value}
                        />
                      )}
                    </form.AppField>
                    <Show when={codeTarget()}>
                      {(target) => (
                        <OpenEmailButton email={target()} variant="secondary" />
                      )}
                    </Show>
                  </div>
                }
              >
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
                      disabled={isPending() || !session.data}
                      id="settings-email"
                      label={auth.localization.auth.email}
                      placeholder={auth.localization.auth.emailPlaceholder}
                      type="email"
                    />
                  )}
                </form.AppField>
              </Show>
            </CardContent>
            <CardFooter class="gap-3">
              <Show when={step() !== "email"}>
                <Button
                  disabled={isPending()}
                  onClick={resetFlow}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  {auth.localization.settings.cancel}
                </Button>
              </Show>
              <form.AuthFormSubmitButton
                disabled={
                  isPending() ||
                  !session.data ||
                  (step() !== "email" && code().length !== otpLength)
                }
                size="sm"
              >
                {step() === "email"
                  ? auth.localization.settings.updateEmail
                  : emailOtpLocalization.verifyCode}
              </form.AuthFormSubmitButton>
              <form.AuthFormServerError />
            </CardFooter>
          </Card>
        </form.AuthFormRoot>
      </form.AppForm>
    </div>
  )
}
