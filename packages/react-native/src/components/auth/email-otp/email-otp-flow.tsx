import { LastUsedBadge } from "../last-login-method/last-used-badge"
import { isPasswordCompromisedError } from "@better-auth-ui/core"
import { useFetchOptions } from "@better-auth-ui/react"
import {
  validateEmailAddress,
  validateMatchingValue,
  validateStringLength
} from "@better-auth-ui/core"
import type { EmailOtpAuthClient } from "@better-auth-ui/core/plugins/email-otp"
import {
  AuthPrompts,
  useAuth,
  useAuthPlugin,
  useSession
} from "@better-auth-ui/react"
import {
  useRequestPasswordResetOtp,
  useResetPasswordOtp,
  useSendVerificationOtp,
  useSignInEmailOtp,
  useVerifyEmailOtp
} from "@better-auth-ui/react/plugins/email-otp"
import { useState } from "react"
import { emailOtpPlugin } from "../../../lib/auth/email-otp-plugin"
import { useSignInContinuation } from "../../../lib/auth/use-sign-in-continuation"
import { useResendCooldown } from "../../../lib/auth/use-resend-cooldown"
import type { AuthViewProps } from "../../../lib/auth-plugin"
import { getPendingEmail, setPendingEmail } from "../../../lib/pending-email"
import { useAuthNavigation } from "../../../navigation/navigation-context"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Description } from "../../../primitives/description"
import { toast } from "../../../primitives/toast"
import { useAuthForm, setAuthFormServerError } from "../auth-form"
import { usePasswordValidation } from "../password-field"
import { ProviderButtons } from "../provider-buttons"
import { OpenEmailButton } from "../open-email-button"

type OtpFlow = "signIn" | "verification" | "reset"

export function EmailOtpFlow({
  flow,
  initiallySent = false,
  ...props
}: AuthViewProps & { flow: OtpFlow; initiallySent?: boolean }) {
  const {
    authClient,
    emailAndPassword,
    localization: authLocalization,
    redirectTo,
    socialProviders,
    plugins
  } = useAuth()
  const { localization, otpLength, disableSignUp } =
    useAuthPlugin(emailOtpPlugin)
  const { fetchOptions, resetFetchOptions } = useFetchOptions()
  const [compromised, setCompromised] = useState(false)
  const navigation = useAuthNavigation()
  const session = useSession(authClient)
  const initialEmail =
    navigation.getParam("email") ??
    (flow === "verification"
      ? (getPendingEmail() ?? session.data?.user.email)
      : flow === "reset"
        ? getPendingEmail("resetLinkSent")
        : "") ??
    ""
  const [sent, setSent] = useState(initiallySent && Boolean(initialEmail))
  const [sentEmail, setSentEmail] = useState(initialEmail)
  const cooldown = useResendCooldown(initiallySent && initialEmail ? 60 : 0)
  const continueSignIn = useSignInContinuation()
  const client = authClient as EmailOtpAuthClient
  const validatePassword = usePasswordValidation()
  const signIn = useSignInEmailOtp(client, { onSuccess: continueSignIn })
  const verify = useVerifyEmailOtp(client, {
    onSuccess: () => {
      toast.success(localization.emailVerified)
      navigation.navigate({ to: redirectTo })
    }
  })
  const reset = useResetPasswordOtp(client, {
    onSuccess: () => {
      toast.success(authLocalization.auth.passwordResetSuccess)
      navigation.push("signIn")
    }
  })
  const send = useSendVerificationOtp(client)
  const requestReset = useRequestPasswordResetOtp(client)
  const pending =
    signIn.isPending ||
    verify.isPending ||
    reset.isPending ||
    send.isPending ||
    requestReset.isPending
  const requestCode = async (email: string) => {
    if (flow === "reset")
      await requestReset.mutateAsync({ email, fetchOptions })
    else
      await send.mutateAsync({
        email,
        fetchOptions,
        type: flow === "verification" ? "email-verification" : "sign-in"
      })
    setSentEmail(email)
    setSent(true)
    setPendingEmail(email, flow === "reset" ? "resetLinkSent" : "verifyEmail")
    form.setFieldValue("code", "")
    cooldown.startCooldown()
    toast.success(localization.codeSent)
  }
  const form = useAuthForm({
    defaultValues: {
      email: initialEmail,
      name: "",
      code: "",
      password: "",
      confirmPassword: ""
    },
    onSubmit: async ({ value }) => {
      if (!sent) {
        await requestCode(value.email.trim())
        return
      }
      const params = { email: sentEmail, otp: value.code.trim() }
      try {
        if (flow === "signIn")
          await signIn.mutateAsync({
            ...params,
            fetchOptions,
            ...(!disableSignUp && emailAndPassword?.name !== false
              ? { name: value.name }
              : {})
          })
        else if (flow === "verification")
          await verify.mutateAsync({ ...params, fetchOptions })
        else
          await reset.mutateAsync({
            ...params,
            password: value.password,
            fetchOptions
          })
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
  const title =
    flow === "reset"
      ? authLocalization.auth.resetPassword
      : flow === "verification"
        ? authLocalization.auth.verifyEmail
        : authLocalization.auth.signIn
  return (
    <Card className={props.className} variant={props.variant}>
      <AuthPrompts
        view={
          flow === "signIn"
            ? "emailOtp"
            : flow === "reset"
              ? "resetPassword"
              : "verifyEmail"
        }
      />
      <Card.Header>
        <Card.Title>{title}</Card.Title>
      </Card.Header>
      <Card.Content className="gap-4">
        <form.AppForm>
          <form.AuthFormRoot className="gap-4">
            {!sent ? (
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
                    isDisabled={pending}
                  />
                )}
              </form.AppField>
            ) : (
              <>
                <Description>
                  {localization.codeSentTo.replace("{{email}}", sentEmail)}
                </Description>
                <OpenEmailButton email={sentEmail} />
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
                        autoComplete: "one-time-code",
                        keyboardType: "number-pad"
                      }}
                    />
                  )}
                </form.AppField>
                {flow === "signIn" &&
                !disableSignUp &&
                emailAndPassword?.name !== false ? (
                  <form.AppField
                    name="name"
                    validators={{
                      onChange: ({ value }) =>
                        validateStringLength(value, {
                          requiredMessage: authLocalization.auth.fieldRequired,
                          trim: true
                        })
                    }}
                  >
                    {(field) => (
                      <field.AuthFormTextField
                        label={authLocalization.auth.name}
                        autoComplete="name"
                        isDisabled={pending}
                      />
                    )}
                  </form.AppField>
                ) : null}
                {flow === "reset" ? (
                  <>
                    <form.AppField
                      name="password"
                      listeners={{ onChange: () => setCompromised(false) }}
                      validators={{
                        onChange: ({ value }) => validatePassword(value)
                      }}
                    >
                      {(field) => (
                        <field.AuthFormPasswordField
                          label={authLocalization.auth.newPassword}
                          strengthMeter
                          error={
                            compromised
                              ? authLocalization.auth.passwordCompromised
                              : undefined
                          }
                          isPending={pending}
                        />
                      )}
                    </form.AppField>
                    {emailAndPassword?.confirmPassword ? (
                      <form.AppField
                        name="confirmPassword"
                        validators={{
                          onChangeListenTo: ["password"],
                          onChange: ({ value, fieldApi }) =>
                            validatePassword(value) ??
                            validateMatchingValue(
                              value,
                              fieldApi.form.getFieldValue("password"),
                              authLocalization.auth.passwordsDoNotMatch
                            )
                        }}
                      >
                        {(field) => (
                          <field.AuthFormPasswordField
                            label={authLocalization.auth.confirmPassword}
                            isPending={pending}
                          />
                        )}
                      </form.AppField>
                    ) : null}
                  </>
                ) : null}
              </>
            )}
            {
              plugins.find((plugin) => plugin.captchaComponent)
                ?.captchaComponent
            }
            <form.AuthFormSubmitButton isPending={pending}>
              {sent
                ? flow === "reset"
                  ? authLocalization.auth.resetPassword
                  : localization.verifyCode
                : localization.sendCode}
              {flow === "signIn" ? <LastUsedBadge method="email-otp" /> : null}
            </form.AuthFormSubmitButton>
            {sent ? (
              <>
                <Button
                  isDisabled={pending || cooldown.isCoolingDown}
                  onPress={() =>
                    void requestCode(sentEmail).catch((error) =>
                      setAuthFormServerError(
                        form,
                        error,
                        authLocalization.errors.generic
                      )
                    )
                  }
                >
                  {cooldown.isCoolingDown
                    ? authLocalization.auth.resendIn.replace(
                        "{{seconds}}",
                        String(cooldown.cooldown)
                      )
                    : authLocalization.auth.resend}
                </Button>
                <Button
                  variant="ghost"
                  isDisabled={pending}
                  onPress={() => {
                    form.reset({
                      ...form.state.values,
                      code: "",
                      password: "",
                      confirmPassword: ""
                    })
                    setSent(false)
                  }}
                >
                  {localization.useDifferentEmail}
                </Button>
              </>
            ) : null}
          </form.AuthFormRoot>
        </form.AppForm>
        {flow === "signIn" && socialProviders?.length ? (
          <ProviderButtons socialLayout={props.socialLayout} />
        ) : null}
      </Card.Content>
    </Card>
  )
}
