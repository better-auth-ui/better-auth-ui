import { authMutationKeys } from "@better-auth-ui/core"
import type { EmailOtpAuthClient } from "@better-auth-ui/core/plugins/email-otp"
import { getSsoFallbackEmail } from "@better-auth-ui/core/plugins/sso"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useSendVerificationOtp,
  useSignInEmailOtp
} from "@better-auth-ui/react/plugins/email-otp"
import {
  Button,
  Card,
  type CardProps,
  cn,
  Description,
  FieldError,
  Input,
  Label,
  Link,
  Spinner,
  TextField
} from "@heroui/react"
import { useIsMutating } from "@tanstack/react-query"
import { useState } from "react"

import { emailOtpPlugin } from "../../../lib/auth/email-otp-plugin"
import { useResendCooldown } from "../../../lib/auth/use-resend-cooldown"
import { useSignInContinuation } from "../../../lib/auth/use-sign-in-continuation"
import { useAuthForm } from "../auth-form"
import { FieldSeparator } from "../field-separator"
import { OpenEmailButton } from "../open-email-button"
import { OtpField } from "../otp-field"
import { ProviderButtons, type SocialLayout } from "../provider-buttons"

export type EmailOtpProps = {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
  variant?: CardProps["variant"]
}

/**
 * Passwordless sign-in with an emailed one-time code.
 *
 * Two steps on one route: enter an email, then enter the code that arrives.
 * The email step never reveals whether an account exists — the server decides
 * whether the code creates an account, mirroring `emailOTP({ disableSignUp })`.
 *
 * @param socialLayout - Provider button layout.
 * @param socialPosition - `"top"` or `"bottom"`. Defaults to `"bottom"`.
 * @param variant - Card variant.
 */
export function EmailOtp({
  className,
  socialLayout,
  socialPosition = "bottom",
  variant
}: EmailOtpProps) {
  const {
    authClient,
    basePaths,
    emailAndPassword,
    localization,
    plugins,
    socialProviders,
    viewPaths
  } = useAuth()
  const { localization: emailOtpLocalization, otpLength } =
    useAuthPlugin(emailOtpPlugin)

  const otpClient = authClient as EmailOtpAuthClient
  const continueSignIn = useSignInContinuation()
  const { cooldown, isCoolingDown, startCooldown } = useResendCooldown()

  const [codeSent, setCodeSent] = useState(false)

  const { mutate: sendVerificationOtp, isPending: isSending } =
    useSendVerificationOtp(otpClient, {
      onSuccess: () => {
        setCodeSent(true)
        startCooldown()
      }
    })

  const { mutate: signInEmailOtp, isPending: isSigningIn } = useSignInEmailOtp(
    otpClient,
    {
      onError: () => form.setFieldValue("code", ""),
      onSuccess: (data) => continueSignIn(data)
    }
  )

  const signInMutating = useIsMutating({
    mutationKey: authMutationKeys.signIn.all
  })
  const signUpMutating = useIsMutating({
    mutationKey: authMutationKeys.signUp.all
  })
  const isPending = signInMutating + signUpMutating > 0 || isSending

  const sendCode = () =>
    sendVerificationOtp({ email: form.state.values.email, type: "sign-in" })
  const verifyCode = (completedCode: string) => {
    if (isPending || isSigningIn) return

    signInEmailOtp({ email: form.state.values.email, otp: completedCode })
  }

  const form = useAuthForm({
    defaultValues: { code: "", email: getSsoFallbackEmail() },
    onSubmit: ({ value }) => {
      if (!codeSent) {
        sendVerificationOtp({ email: value.email, type: "sign-in" })
        return
      }
      verifyCode(value.code)
    }
  })

  const startOver = () => {
    setCodeSent(false)
    form.setFieldValue("code", "")
  }

  const showSeparator = !!socialProviders?.length

  return (
    <Card
      className={cn("w-full max-w-sm gap-4 md:p-6", className)}
      variant={variant}
    >
      <Card.Header>
        <Card.Title className="text-xl font-semibold mb-1">
          {localization.auth.signIn}
        </Card.Title>

        {codeSent && (
          <Card.Description>
            {emailOtpLocalization.codeSentTo.replace(
              "{{email}}",
              form.state.values.email
            )}
          </Card.Description>
        )}
      </Card.Header>

      <Card.Content className="gap-4">
        {socialPosition === "top" && (
          <>
            {!!socialProviders?.length && (
              <ProviderButtons socialLayout={socialLayout} view="emailOtp" />
            )}

            {showSeparator && (
              <FieldSeparator>{localization.auth.or}</FieldSeparator>
            )}
          </>
        )}

        <form.AppForm>
          <form.AuthFormRoot className="flex flex-col gap-4">
            {codeSent ? (
              <form.AppField name="code">
                {(field) => (
                  <OtpField
                    autoFocus
                    isDisabled={isPending}
                    label={emailOtpLocalization.code}
                    length={otpLength}
                    name={field.name}
                    value={field.state.value}
                    variant={variant}
                    onChange={field.handleChange}
                    onComplete={verifyCode}
                  />
                )}
              </form.AppField>
            ) : (
              <form.AppField name="email">
                {(field) => (
                  <TextField
                    name={field.name}
                    type="email"
                    autoComplete="email"
                    isDisabled={isPending}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                    validate={(value) => {
                      if (!value) return localization.auth.fieldRequired
                      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                        return localization.auth.invalidEmail
                    }}
                  >
                    <Label>{localization.auth.email}</Label>

                    <Input
                      placeholder={localization.auth.emailPlaceholder}
                      required
                      variant={
                        variant === "transparent" ? "primary" : "secondary"
                      }
                    />

                    <FieldError />
                  </TextField>
                )}
              </form.AppField>
            )}

            <div className="flex flex-col gap-3">
              <form.AuthFormSubmitButton
                className="w-full"
                isDisabled={
                  isPending ||
                  isSigningIn ||
                  (codeSent && form.state.values.code.length !== otpLength)
                }
              >
                {(isSending || isSigningIn) && (
                  <Spinner color="current" size="sm" />
                )}

                {codeSent
                  ? emailOtpLocalization.verifyCode
                  : emailOtpLocalization.sendCode}
              </form.AuthFormSubmitButton>

              {codeSent ? (
                <div className="flex flex-col gap-3">
                  <OpenEmailButton
                    email={form.state.values.email}
                    variant="secondary"
                  />

                  <Button
                    className="w-full"
                    variant="tertiary"
                    isDisabled={isPending || isSigningIn || isCoolingDown}
                    onPress={sendCode}
                  >
                    {isCoolingDown
                      ? localization.auth.resendIn.replace(
                          "{{seconds}}",
                          String(cooldown)
                        )
                      : localization.auth.resend}
                  </Button>

                  <Button
                    className="w-full"
                    variant="ghost"
                    isDisabled={isPending || isSigningIn}
                    onPress={startOver}
                  >
                    {emailOtpLocalization.useDifferentEmail}
                  </Button>
                </div>
              ) : (
                plugins.flatMap((plugin) =>
                  (plugin.authButtons ?? []).map((AuthButton, index) => (
                    <AuthButton
                      key={`${plugin.id}-${index.toString()}`}
                      view="emailOtp"
                    />
                  ))
                )
              )}
            </div>
          </form.AuthFormRoot>
        </form.AppForm>

        {socialPosition === "bottom" && !codeSent && (
          <>
            {showSeparator && (
              <FieldSeparator>{localization.auth.or}</FieldSeparator>
            )}

            {!!socialProviders?.length && (
              <ProviderButtons socialLayout={socialLayout} view="emailOtp" />
            )}
          </>
        )}
      </Card.Content>

      {emailAndPassword?.enabled && (
        <Card.Footer className="flex-col gap-3">
          <Description className="text-sm">
            {localization.auth.needToCreateAnAccount}{" "}
            <Link
              href={`${basePaths.auth}/${viewPaths.auth.signUp}`}
              className="text-accent no-underline hover:underline decoration-accent-hover"
            >
              {localization.auth.signUp}
            </Link>
          </Description>
        </Card.Footer>
      )}
    </Card>
  )
}
