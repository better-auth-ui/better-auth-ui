"use client"

import { authMutationKeys } from "@better-auth-ui/core"
import type { EmailOtpAuthClient } from "@better-auth-ui/core/plugins/email-otp"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useSendVerificationOtp,
  useSignInEmailOtp
} from "@better-auth-ui/react/plugins/email-otp"
import { useIsMutating } from "@tanstack/react-query"
import { type SyntheticEvent, useState } from "react"

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
  FieldError,
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

  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [codeSent, setCodeSent] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string }>({})

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
      onError: () => setCode(""),
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

  const sendCode = () => sendVerificationOtp({ email, type: "sign-in" })
  const verifyCode = (completedCode: string) => {
    if (isPending || isSigningIn) return

    signInEmailOtp({ email, otp: completedCode })
  }

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!codeSent) {
      sendCode()
      return
    }

    verifyCode(code)
  }

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

          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {codeSent ? (
                <OtpField
                  autoFocus
                  disabled={isPending || isSigningIn}
                  label={emailOtpLocalization.code}
                  length={otpLength}
                  name="otp"
                  value={code}
                  onChange={setCode}
                  onComplete={verifyCode}
                />
              ) : (
                <Field data-invalid={!!fieldErrors.email}>
                  <FieldLabel htmlFor="email">
                    {localization.auth.email}
                  </FieldLabel>

                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setFieldErrors((prev) => ({ ...prev, email: undefined }))
                    }}
                    placeholder={localization.auth.emailPlaceholder}
                    required
                    disabled={isPending}
                    onInvalid={(e) => {
                      e.preventDefault()

                      setFieldErrors((prev) => ({
                        ...prev,
                        email: (e.target as HTMLInputElement).validationMessage
                      }))
                    }}
                    aria-invalid={!!fieldErrors.email}
                  />

                  <FieldError>{fieldErrors.email}</FieldError>
                </Field>
              )}

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  disabled={
                    isPending ||
                    isSigningIn ||
                    (codeSent && code.length !== otpLength)
                  }
                >
                  {(isSending || isSigningIn) && <Spinner />}

                  {codeSent
                    ? emailOtpLocalization.verifyCode
                    : emailOtpLocalization.sendCode}
                </Button>

                {codeSent ? (
                  <>
                    <OpenEmailButton email={email} variant="secondary" />

                    <Button
                      type="button"
                      variant="outline"
                      disabled={isPending || isSigningIn || isCoolingDown}
                      onClick={sendCode}
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
                        setCode("")
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
          </form>

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
