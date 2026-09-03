"use client"

import { authMutationKeys } from "@better-auth-ui/core"
import type { EmailOtpAuthClient } from "@better-auth-ui/core/plugins/email-otp"
import { getSsoFallbackEmail } from "@better-auth-ui/core/plugins/sso"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useSendVerificationOtp,
  useSignInEmailOtp
} from "@better-auth-ui/react/plugins/email-otp"
import { useSelector } from "@tanstack/react-form"
import { useIsMutating } from "@tanstack/react-query"
import { useState } from "react"

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
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { emailOtpPlugin } from "@/lib/auth/email-otp-plugin"
import { useResendCooldown } from "@/lib/auth/use-resend-cooldown"
import { useSignInContinuation } from "@/lib/auth/use-sign-in-continuation"
import { cn } from "@/lib/utils"
import { runAuthFormAction, submitAuthForm, useAuthForm } from "../auth-form"
import { OpenEmailButton } from "../open-email-button"
import { OtpField } from "../otp-field"
import { ProviderButtons, type SocialLayout } from "../provider-buttons"

export type EmailOtpProps = {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
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
 */
export function EmailOtp({
  className,
  socialLayout,
  socialPosition = "bottom"
}: EmailOtpProps) {
  const {
    authClient,
    basePaths,
    emailAndPassword,
    localization,
    plugins,
    socialProviders,
    viewPaths,
    Link
  } = useAuth()
  const { localization: emailOtpLocalization, otpLength } =
    useAuthPlugin(emailOtpPlugin)

  const otpClient = authClient as EmailOtpAuthClient
  const continueSignIn = useSignInContinuation()
  const { cooldown, isCoolingDown, startCooldown } = useResendCooldown()

  const [codeSent, setCodeSent] = useState(false)

  const { mutateAsync: sendVerificationOtp, isPending: isSending } =
    useSendVerificationOtp(otpClient, {
      onSuccess: () => {
        setCodeSent(true)
        startCooldown()
      }
    })

  const { mutateAsync: signInEmailOtp, isPending: isSigningIn } =
    useSignInEmailOtp(otpClient, {
      onError: () => form.setFieldValue("code", ""),
      onSuccess: (data) => continueSignIn(data)
    })

  const signInMutating = useIsMutating({
    mutationKey: authMutationKeys.signIn.all
  })
  const signUpMutating = useIsMutating({
    mutationKey: authMutationKeys.signUp.all
  })
  const isPending = signInMutating + signUpMutating > 0 || isSending

  const sendCode = async () =>
    await sendVerificationOtp({
      email: form.state.values.email,
      type: "sign-in"
    })
  const verifyCode = async (completedCode: string) => {
    if (isPending || isSigningIn) return

    await signInEmailOtp({
      email: form.state.values.email,
      otp: completedCode
    })
  }

  const form = useAuthForm({
    defaultValues: { code: "", email: getSsoFallbackEmail() },
    onSubmit: async ({ value }) => {
      if (!codeSent) {
        await sendVerificationOtp({ email: value.email, type: "sign-in" })
        return
      }

      await verifyCode(value.code)
    }
  })
  const codeComplete = useSelector(
    form.store,
    (state) => state.values.code.length === otpLength
  )
  const email = useSelector(form.store, (state) => state.values.email)

  const showSeparator = socialProviders && socialProviders.length > 0

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader>
        <CardTitle className="text-xl">{localization.auth.signIn}</CardTitle>

        {codeSent && (
          <CardDescription>
            {emailOtpLocalization.codeSentTo.replace("{{email}}", email)}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-6">
          {socialPosition === "top" && !codeSent && (
            <>
              {socialProviders && socialProviders.length > 0 && (
                <ProviderButtons socialLayout={socialLayout} view="emailOtp" />
              )}

              {showSeparator && (
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card m-0 text-xs flex items-center">
                  {localization.auth.or}
                </FieldSeparator>
              )}
            </>
          )}

          <form.AppForm>
            <form.AuthFormRoot>
              <FieldGroup>
                {codeSent ? (
                  <form.AppField name="code">
                    {(field) => (
                      <OtpField
                        autoFocus
                        disabled={isPending || isSigningIn}
                        label={emailOtpLocalization.code}
                        length={otpLength}
                        name={field.name}
                        value={field.state.value}
                        onChange={field.handleChange}
                        onComplete={() => void submitAuthForm(form)}
                      />
                    )}
                  </form.AppField>
                ) : (
                  <form.AppField name="email">
                    {(field) => (
                      <Field>
                        <FieldLabel htmlFor="email">
                          {localization.auth.email}
                        </FieldLabel>
                        <Input
                          id="email"
                          name={field.name}
                          type="email"
                          autoComplete="email"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          placeholder={localization.auth.emailPlaceholder}
                          required
                          disabled={isPending}
                        />
                        <field.AuthFormFieldError />
                      </Field>
                    )}
                  </form.AppField>
                )}

                <form.AuthFormServerError />

                <div className="flex flex-col gap-3">
                  <form.AuthFormSubmitButton
                    disabled={
                      isPending || isSigningIn || (codeSent && !codeComplete)
                    }
                  >
                    {(isSending || isSigningIn) && <Spinner />}

                    {codeSent
                      ? emailOtpLocalization.verifyCode
                      : emailOtpLocalization.sendCode}
                  </form.AuthFormSubmitButton>

                  {codeSent ? (
                    <>
                      <OpenEmailButton email={email} variant="secondary" />

                      <Button
                        type="button"
                        variant="outline"
                        disabled={isPending || isSigningIn || isCoolingDown}
                        onClick={() => void runAuthFormAction(form, sendCode)}
                      >
                        {isCoolingDown
                          ? localization.auth.resendIn.replace(
                              "{{seconds}}",
                              String(cooldown)
                            )
                          : localization.auth.resend}
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        disabled={isPending || isSigningIn}
                        onClick={() => {
                          setCodeSent(false)
                          form.setFieldValue("code", "")
                        }}
                      >
                        {emailOtpLocalization.useDifferentEmail}
                      </Button>
                    </>
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
              </FieldGroup>
            </form.AuthFormRoot>
          </form.AppForm>

          {socialPosition === "bottom" && !codeSent && (
            <>
              {showSeparator && (
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card text-xs flex items-center">
                  {localization.auth.or}
                </FieldSeparator>
              )}

              {socialProviders && socialProviders.length > 0 && (
                <ProviderButtons socialLayout={socialLayout} view="emailOtp" />
              )}
            </>
          )}
        </div>

        {emailAndPassword?.enabled && (
          <div className="flex flex-col gap-3 items-center w-full mt-4">
            <FieldDescription className="text-center">
              {localization.auth.needToCreateAnAccount}{" "}
              <Link
                href={`${basePaths.auth}/${viewPaths.auth.signUp}`}
                className="underline underline-offset-4"
              >
                {localization.auth.signUp}
              </Link>
            </FieldDescription>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
