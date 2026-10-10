import {
  isPasswordCompromisedError,
  getAuthErrorCode
} from "@better-auth-ui/core"
import { useFetchOptions } from "@better-auth-ui/react"
import {
  getFormFieldErrorMessage,
  validateMatchingValue,
  validateStringLength
} from "@better-auth-ui/core"
import {
  createPhoneNumberValue,
  type PhoneNumberAuthClient
} from "@better-auth-ui/core/plugins/phone-number"
import { AuthPrompts, useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useRequestPhoneNumberPasswordReset,
  useResetPhoneNumberPassword,
  useSendPhoneNumberOtp,
  useSignInPhoneNumber,
  useVerifyPhoneNumber
} from "@better-auth-ui/react/plugins/phone-number"
import { useState } from "react"
import { phoneNumberPlugin } from "../../../lib/auth/phone-number-plugin"
import { useSignInContinuation } from "../../../lib/auth/use-sign-in-continuation"
import { useResendCooldown } from "../../../lib/auth/use-resend-cooldown"
import type { AuthViewProps } from "../../../lib/auth-plugin"
import { useAuthNavigation } from "../../../navigation/navigation-context"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Checkbox } from "../../../primitives/checkbox"
import { Description } from "../../../primitives/description"
import { toast } from "../../../primitives/toast"
import {
  useAuthForm,
  isAuthFormFieldInvalid,
  setAuthFormServerError
} from "../auth-form"
import { usePasswordValidation } from "../password-field"
import { PhoneNumberField } from "./phone-number-field"
import { LastUsedBadge } from "../last-login-method/last-used-badge"
import { ProviderButtons } from "../provider-buttons"

export function PhoneNumberFlow({
  flow,
  initiallySent = false,
  onComplete,
  ...props
}: AuthViewProps & {
  flow: "signIn" | "reset" | "change"
  initiallySent?: boolean
  onComplete?: () => void
}) {
  const {
    authClient,
    localization: common,
    emailAndPassword,
    socialProviders,
    plugins
  } = useAuth()
  const plugin = useAuthPlugin(phoneNumberPlugin)
  const { localization, adapter, otpLength, defaultCountry } = plugin
  const { fetchOptions, resetFetchOptions } = useFetchOptions()
  const [compromised, setCompromised] = useState(false)
  const navigation = useAuthNavigation()
  const initial = navigation.getParam("phoneNumber") ?? ""
  const [sent, setSent] = useState(initiallySent && Boolean(initial))
  const [sentPhone, setSentPhone] = useState(initial)
  const [passwordMode, setPasswordMode] = useState(
    flow === "signIn" && !plugin.signIn
  )
  const cooldown = useResendCooldown(initiallySent && initial ? 60 : 0)
  const continueSignIn = useSignInContinuation()
  const validatePassword = usePasswordValidation()
  const client = authClient as PhoneNumberAuthClient
  const send = useSendPhoneNumberOtp(client)
  const verify = useVerifyPhoneNumber(client)
  const passwordSignIn = useSignInPhoneNumber(client)
  const requestReset = useRequestPhoneNumberPasswordReset(client)
  const reset = useResetPhoneNumberPassword(client)
  const pending =
    send.isPending ||
    verify.isPending ||
    passwordSignIn.isPending ||
    requestReset.isPending ||
    reset.isPending
  const request = async (phoneNumber: string) => {
    if (flow === "reset")
      await requestReset.mutateAsync({ phoneNumber, fetchOptions })
    else await send.mutateAsync({ phoneNumber, fetchOptions })
    setSentPhone(phoneNumber)
    setSent(true)
    form.setFieldValue("code", "")
    cooldown.startCooldown()
  }
  const form = useAuthForm({
    defaultValues: {
      phoneNumber: createPhoneNumberValue(
        initial,
        adapter.getCountry(initial) ?? defaultCountry,
        adapter
      ),
      code: "",
      password: "",
      confirmPassword: "",
      rememberMe: false
    },
    onSubmit: async ({ value }) => {
      const phoneNumber = value.phoneNumber.e164
      if (!phoneNumber && !sent) return
      if (passwordMode && phoneNumber) {
        try {
          const data = await passwordSignIn.mutateAsync({
            phoneNumber,
            fetchOptions,
            password: value.password,
            ...(emailAndPassword?.rememberMe
              ? { rememberMe: value.rememberMe }
              : {})
          })
          await continueSignIn(data)
        } catch (error) {
          resetFetchOptions()
          form.setFieldValue("password", "")
          if (getAuthErrorCode(error) === "PHONE_NUMBER_NOT_VERIFIED") {
            setPasswordMode(false)
            await request(phoneNumber)
          } else throw error
        }
        return
      }
      if (!sent && phoneNumber) {
        await request(phoneNumber)
        return
      }
      try {
        if (flow === "reset") {
          await reset.mutateAsync({
            phoneNumber: sentPhone,
            fetchOptions,
            otp: value.code,
            newPassword: value.password
          })
          toast.success(common.auth.passwordResetSuccess)
          navigation.push("phoneNumber")
        } else {
          const data = await verify.mutateAsync({
            phoneNumber: sentPhone,
            fetchOptions,
            code: value.code,
            ...(flow === "change"
              ? { updatePhoneNumber: true, disableSession: true }
              : {})
          })
          if (flow === "change") {
            toast.success(localization.phoneNumberUpdated)
            form.reset()
            setSent(false)
            onComplete?.()
          } else continueSignIn(data)
        }
      } catch (error) {
        resetFetchOptions()
        setCompromised(isPasswordCompromisedError(error))
        form.setFieldValue("code", "")
        form.setFieldValue("password", "")
        form.setFieldValue("confirmPassword", "")
        throw error
      }
    }
  })
  return (
    <Card className={props.className} variant={props.variant}>
      <AuthPrompts
        view={flow === "reset" ? "phoneNumberResetPassword" : "phoneNumber"}
      />
      <Card.Header>
        <Card.Title>
          {flow === "change"
            ? localization.changePhoneNumber
            : flow === "reset"
              ? localization.resetPassword
              : common.auth.signIn}
        </Card.Title>
      </Card.Header>
      <Card.Content className="gap-4">
        <form.AppForm>
          <form.AuthFormRoot className="gap-4">
            {!sent ? (
              <form.AppField
                name="phoneNumber"
                validators={{
                  onChange: ({ value }) =>
                    value.isValid ? undefined : localization.invalidPhoneNumber
                }}
              >
                {(field) => (
                  <PhoneNumberField
                    value={field.state.value}
                    onChange={field.handleChange}
                    onBlur={field.handleBlur}
                    isDisabled={pending}
                    error={
                      isAuthFormFieldInvalid(field.state.meta)
                        ? getFormFieldErrorMessage(field.state.meta.errors)
                        : undefined
                    }
                  />
                )}
              </form.AppField>
            ) : (
              <>
                <Description>
                  {localization.codeSentTo.replace(
                    "{{phoneNumber}}",
                    sentPhone
                  )}
                </Description>
                <form.AppField
                  name="code"
                  validators={{
                    onChange: ({ value }) =>
                      validateStringLength(value, {
                        requiredMessage: common.auth.fieldRequired,
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
                      label={localization.phoneCode}
                      isDisabled={pending}
                      inputProps={{
                        autoCapitalize: "none",
                        keyboardType: "number-pad",
                        autoComplete: "one-time-code"
                      }}
                    />
                  )}
                </form.AppField>
              </>
            )}
            {passwordMode || (sent && flow === "reset") ? (
              <form.AppField
                name="password"
                listeners={{ onChange: () => setCompromised(false) }}
                validators={{
                  onChange: ({ value }) =>
                    flow === "reset"
                      ? validatePassword(value)
                      : validateStringLength(value, {
                          requiredMessage: common.auth.fieldRequired
                        })
                }}
              >
                {(field) => (
                  <field.AuthFormPasswordField
                    label={common.auth.password}
                    strengthMeter={flow === "reset"}
                    error={
                      compromised ? common.auth.passwordCompromised : undefined
                    }
                    autoComplete={
                      flow === "reset" ? "new-password" : "current-password"
                    }
                    isPending={pending}
                  />
                )}
              </form.AppField>
            ) : null}
            {sent && flow === "reset" && emailAndPassword?.confirmPassword ? (
              <form.AppField
                name="confirmPassword"
                validators={{
                  onChangeListenTo: ["password"],
                  onChange: ({ value, fieldApi }) =>
                    validatePassword(value) ??
                    validateMatchingValue(
                      value,
                      fieldApi.form.getFieldValue("password"),
                      common.auth.passwordsDoNotMatch
                    )
                }}
              >
                {(field) => (
                  <field.AuthFormPasswordField
                    label={common.auth.confirmPassword}
                    isPending={pending}
                  />
                )}
              </form.AppField>
            ) : null}
            {passwordMode && emailAndPassword?.rememberMe ? (
              <form.AppField name="rememberMe">
                {(field) => (
                  <Checkbox
                    isSelected={field.state.value}
                    onChange={field.handleChange}
                    isDisabled={pending}
                  >
                    {common.auth.rememberMe}
                  </Checkbox>
                )}
              </form.AppField>
            ) : null}
            {
              plugins.find((plugin) => plugin.captchaComponent)
                ?.captchaComponent
            }
            <form.AuthFormSubmitButton isPending={pending}>
              {passwordMode
                ? common.auth.signIn
                : sent
                  ? flow === "reset"
                    ? localization.resetPassword
                    : localization.verifyCode
                  : localization.sendCode}
              <LastUsedBadge method="phone-number" />
            </form.AuthFormSubmitButton>
            {sent ? (
              <>
                <Button
                  isDisabled={pending || cooldown.isCoolingDown}
                  onPress={() =>
                    void request(sentPhone).catch((error) =>
                      setAuthFormServerError(form, error, common.errors.generic)
                    )
                  }
                >
                  {cooldown.isCoolingDown
                    ? common.auth.resendIn.replace(
                        "{{seconds}}",
                        String(cooldown.cooldown)
                      )
                    : common.auth.resend}
                </Button>
                <Button
                  isDisabled={pending}
                  variant="ghost"
                  onPress={() => {
                    form.reset()
                    setSent(false)
                  }}
                >
                  {localization.useDifferentPhoneNumber}
                </Button>
              </>
            ) : null}
            {flow === "signIn" && plugin.signIn && plugin.passwordSignIn ? (
              <Button
                isDisabled={pending}
                onPress={() => {
                  form.reset()
                  setSent(false)
                  setPasswordMode(!passwordMode)
                }}
              >
                {passwordMode
                  ? localization.useVerificationCode
                  : localization.usePassword}
              </Button>
            ) : null}
            {flow === "signIn" && plugin.passwordReset ? (
              <Button
                variant="ghost"
                onPress={() => navigation.push("phoneNumberForgotPassword")}
              >
                {localization.forgotPassword}
              </Button>
            ) : null}
          </form.AuthFormRoot>
        </form.AppForm>
        {flow === "signIn" && !sent && socialProviders?.length ? (
          <ProviderButtons socialLayout={props.socialLayout} />
        ) : null}
      </Card.Content>
    </Card>
  )
}
