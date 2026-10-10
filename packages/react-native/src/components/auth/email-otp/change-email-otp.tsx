import {
  validateEmailAddress,
  validateStringLength
} from "@better-auth-ui/core"
import type { EmailOtpAuthClient } from "@better-auth-ui/core/plugins/email-otp"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import {
  useChangeEmailOtp,
  useRequestEmailChangeOtp,
  useSendVerificationOtp
} from "@better-auth-ui/react/plugins/email-otp"
import { useState } from "react"
import { emailOtpPlugin } from "../../../lib/auth/email-otp-plugin"
import type { CardSlotProps } from "../../../lib/auth-plugin"
import { useResendCooldown } from "../../../lib/auth/use-resend-cooldown"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Description } from "../../../primitives/description"
import { toast } from "../../../primitives/toast"
import { useAuthForm, setAuthFormServerError } from "../auth-form"

export function ChangeEmailOtp(props: CardSlotProps) {
  const { authClient, localization: authLocalization } = useAuth()
  const { localization, otpLength, verifyCurrentEmail } =
    useAuthPlugin(emailOtpPlugin)
  const { data: session } = useSession(authClient)
  const client = authClient as EmailOtpAuthClient
  const [step, setStep] = useState<"email" | "currentCode" | "newCode">("email")
  const [newEmail, setNewEmail] = useState("")
  const cooldown = useResendCooldown()
  const send = useSendVerificationOtp(client)
  const request = useRequestEmailChangeOtp(client)
  const change = useChangeEmailOtp(client)
  const pending = send.isPending || request.isPending || change.isPending
  const requestChange = async (email: string, otp?: string) => {
    await request.mutateAsync({ newEmail: email, ...(otp ? { otp } : {}) })
    form.setFieldValue("code", "")
    setNewEmail(email)
    setStep("newCode")
    cooldown.startCooldown()
  }
  const form = useAuthForm({
    defaultValues: { email: "", code: "" },
    onSubmit: async ({ value }) => {
      if (step === "email") {
        const email = value.email.trim()
        if (verifyCurrentEmail && session?.user.email) {
          await send.mutateAsync({
            email: session.user.email,
            type: "change-email"
          })
          setNewEmail(email)
          setStep("currentCode")
          cooldown.startCooldown()
        } else await requestChange(email)
      } else if (step === "currentCode")
        await requestChange(newEmail, value.code)
      else {
        await change.mutateAsync({ newEmail, otp: value.code })
        toast.success(authLocalization.settings.changeEmailSuccess)
        setStep("email")
        setNewEmail("")
        form.reset()
      }
    }
  })
  return (
    <Card className={props.className} variant={props.variant}>
      <Card.Header>
        <Card.Title>{authLocalization.settings.changeEmail}</Card.Title>
      </Card.Header>
      <Card.Content>
        <form.AppForm>
          <form.AuthFormRoot className="gap-4">
            {step === "email" ? (
              <form.AppField
                name="email"
                validators={{
                  onChange: ({ value }) =>
                    validateEmailAddress(value, {
                      requiredMessage: authLocalization.auth.fieldRequired,
                      invalidMessage: authLocalization.auth.invalidEmail
                    })
                }}
              >
                {(field) => (
                  <field.AuthFormTextField
                    label={authLocalization.auth.email}
                    type="email"
                    autoComplete="email"
                    isDisabled={pending || !session}
                  />
                )}
              </form.AppField>
            ) : (
              <>
                <Description>
                  {localization.confirmEmailDescription.replace(
                    "{{email}}",
                    step === "currentCode"
                      ? (session?.user.email ?? "")
                      : newEmail
                  )}
                </Description>
                <form.AppField
                  name="code"
                  validators={{
                    onChange: ({ value }) =>
                      validateStringLength(value, {
                        requiredMessage: authLocalization.auth.fieldRequired,
                        minLength: otpLength,
                        maxLength: otpLength,
                        minLengthMessage:
                          localization.codeLengthMismatch.replace(
                            "{{length}}",
                            String(otpLength)
                          ),
                        maxLengthMessage:
                          localization.codeLengthMismatch.replace(
                            "{{length}}",
                            String(otpLength)
                          )
                      })
                  }}
                >
                  {(field) => (
                    <field.AuthFormTextField
                      label={localization.code}
                      isDisabled={pending}
                      inputProps={{
                        autoCapitalize: "none",
                        keyboardType: "number-pad",
                        autoComplete: "one-time-code"
                      }}
                    />
                  )}
                </form.AppField>
                <Button
                  isDisabled={pending || cooldown.isCoolingDown}
                  onPress={() => {
                    const operation =
                      step === "currentCode" && session?.user.email
                        ? send.mutateAsync({
                            email: session.user.email,
                            type: "change-email"
                          })
                        : request.mutateAsync({ newEmail })
                    void operation
                      .then(() => cooldown.startCooldown())
                      .catch((error) =>
                        setAuthFormServerError(
                          form,
                          error,
                          authLocalization.errors.generic
                        )
                      )
                  }}
                >
                  {cooldown.isCoolingDown
                    ? authLocalization.auth.resendIn.replace(
                        "{{seconds}}",
                        String(cooldown.cooldown)
                      )
                    : authLocalization.auth.resend}
                </Button>
              </>
            )}
            <form.AuthFormSubmitButton
              isPending={pending}
              isDisabled={!session}
            >
              {step === "email"
                ? localization.sendCode
                : localization.verifyCode}
            </form.AuthFormSubmitButton>
            {step !== "email" ? (
              <Button
                isDisabled={pending}
                variant="ghost"
                onPress={() => {
                  form.reset()
                  setNewEmail("")
                  setStep("email")
                }}
              >
                {authLocalization.settings.cancel}
              </Button>
            ) : null}
          </form.AuthFormRoot>
        </form.AppForm>
      </Card.Content>
    </Card>
  )
}
