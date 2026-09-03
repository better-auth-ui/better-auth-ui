"use client"

import {
  authMutationKeys,
  getFormFieldErrorMessage
} from "@better-auth-ui/core"
import {
  createPhoneNumberValue,
  type PhoneNumberAuthClient
} from "@better-auth-ui/core/plugins/phone-number"
import {
  AuthPrompts,
  useAuth,
  useAuthPlugin,
  useFetchOptions
} from "@better-auth-ui/react"
import {
  useSendPhoneNumberOtp,
  useSignInPhoneNumber,
  useVerifyPhoneNumber
} from "@better-auth-ui/react/plugins/phone-number"
import { useSelector } from "@tanstack/react-form"
import { useIsMutating } from "@tanstack/react-query"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { phoneNumberPlugin } from "@/lib/auth/phone-number-plugin"
import { useResendCooldown } from "@/lib/auth/use-resend-cooldown"
import { useSignInContinuation } from "@/lib/auth/use-sign-in-continuation"
import { cn } from "@/lib/utils"
import { useAuthForm } from "../auth-form"
import { OtpField } from "../otp-field"
import { ProviderButtons, type SocialLayout } from "../provider-buttons"
import { InternationalPhoneField } from "./international-phone-field"

type PhoneNumberMode = "code" | "password"

export type PhoneNumberProps = {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
}

/** Sign in with either a phone verification code or a phone and password. */
export function PhoneNumber({
  className,
  socialLayout,
  socialPosition = "bottom"
}: PhoneNumberProps) {
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
  const {
    adapter,
    countries,
    defaultCountry,
    locale,
    localization: phoneLocalization,
    otpLength,
    passwordReset,
    passwordSignIn,
    signIn,
    viewPaths: phoneNumberViewPaths
  } = useAuthPlugin(phoneNumberPlugin)
  const phoneClient = authClient as PhoneNumberAuthClient
  const { fetchOptions, resetFetchOptions } = useFetchOptions()
  const continueSignIn = useSignInContinuation()
  const { cooldown, isCoolingDown, startCooldown } = useResendCooldown()
  const [mode, setMode] = useState<PhoneNumberMode>(
    signIn ? "code" : "password"
  )
  const [codeSent, setCodeSent] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const { mutateAsync: sendOtp, isPending: isSending } = useSendPhoneNumberOtp(
    phoneClient,
    {
      onError: () => resetFetchOptions(),
      onSuccess: () => {
        setCodeSent(true)
        startCooldown()
      }
    }
  )
  const { mutateAsync: verify, isPending: isVerifying } = useVerifyPhoneNumber(
    phoneClient,
    {
      onError: () => form.setFieldValue("code", ""),
      onSuccess: (data) => continueSignIn(data)
    }
  )
  const { mutateAsync: signInWithPassword, isPending: isPasswordPending } =
    useSignInPhoneNumber(phoneClient, {
      onError: (error) => {
        form.setFieldValue("password", "")
        resetFetchOptions()

        if (signIn && error.error?.code === "PHONE_NUMBER_NOT_VERIFIED") {
          setMode("code")
          setCodeSent(true)
          startCooldown()
        }
      },
      onSuccess: (data) => continueSignIn(data)
    })

  const signInMutating = useIsMutating({
    mutationKey: authMutationKeys.signIn.all
  })
  const signUpMutating = useIsMutating({
    mutationKey: authMutationKeys.signUp.all
  })
  const isPending =
    signInMutating + signUpMutating > 0 || isSending || isVerifying
  const canSwitchMode = signIn && passwordSignIn
  const showProviders = !codeSent && Boolean(socialProviders?.length)
  const showSeparator =
    !codeSent &&
    Boolean(
      socialProviders?.length &&
        (emailAndPassword?.enabled || signIn || passwordSignIn)
    )
  const Captcha = plugins.find(
    (plugin) => plugin.captchaComponent
  )?.captchaComponent

  const sendCode = async () => {
    const normalizedPhoneNumber = form.state.values.phoneNumber.e164
    if (!normalizedPhoneNumber) return
    await sendOtp({
      phoneNumber: normalizedPhoneNumber,
      fetchOptions
    } as Parameters<typeof sendOtp>[0])
  }
  const verifyCode = async (completedCode: string) => {
    if (isPending || completedCode.length !== otpLength) return

    if (!form.state.values.phoneNumber.e164) return
    await verify({
      phoneNumber: form.state.values.phoneNumber.e164,
      code: completedCode
    })
  }
  const switchMode = () => {
    setMode((current) => (current === "code" ? "password" : "code"))
    form.setFieldValue("code", "")
    setCodeSent(false)
    form.setFieldValue("password", "")
  }

  const form = useAuthForm({
    defaultValues: {
      code: "",
      password: "",
      phoneNumber: createPhoneNumberValue("", defaultCountry, adapter),
      rememberMe: false
    },
    onSubmit: async ({ value }) => {
      if (mode === "password") {
        const normalizedPhoneNumber = value.phoneNumber.e164
        if (!normalizedPhoneNumber) return
        await signInWithPassword({
          phoneNumber: normalizedPhoneNumber,
          password: value.password,
          ...(emailAndPassword?.rememberMe
            ? { rememberMe: value.rememberMe }
            : {}),
          fetchOptions
        })
        return
      }

      if (!codeSent) {
        await sendCode()
        return
      }

      await verifyCode(value.code)
    }
  })
  const codeComplete = useSelector(
    form.store,
    (state) => state.values.code.length === otpLength
  )
  const phoneNumberDisplay = useSelector(
    form.store,
    (state) => state.values.phoneNumber.display
  )

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <AuthPrompts view="phoneNumber" />
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {localization.auth.signIn}
        </CardTitle>

        {codeSent && (
          <CardDescription>
            {phoneLocalization.codeSentTo.replace(
              "{{phoneNumber}}",
              phoneNumberDisplay
            )}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-6">
          {socialPosition === "top" && showProviders && (
            <>
              <ProviderButtons socialLayout={socialLayout} view="phoneNumber" />
              {showSeparator && (
                <FieldSeparator className="m-0 flex items-center text-xs *:data-[slot=field-separator-content]:bg-card">
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
                        disabled={isPending}
                        label={phoneLocalization.phoneCode}
                        length={otpLength}
                        name="otp"
                        value={field.state.value}
                        onChange={field.handleChange}
                        onComplete={verifyCode}
                      />
                    )}
                  </form.AppField>
                ) : (
                  <>
                    <form.AppField
                      name="phoneNumber"
                      validators={{
                        onChange: ({ value }) =>
                          value.e164
                            ? undefined
                            : phoneLocalization.invalidPhoneNumber
                      }}
                    >
                      {(field) => (
                        <InternationalPhoneField
                          adapter={adapter}
                          countryCodes={countries}
                          countryLabel={phoneLocalization.country}
                          disabled={isPending}
                          error={getFormFieldErrorMessage(
                            field.state.meta.errors
                          )}
                          locale={locale}
                          phoneLabel={phoneLocalization.phoneNumber}
                          placeholder={phoneLocalization.phoneNumberPlaceholder}
                          value={field.state.value}
                          onChange={field.handleChange}
                        />
                      )}
                    </form.AppField>

                    {mode === "password" && (
                      <form.AppField name="password">
                        {(field) => (
                          <Field>
                            <FieldLabel htmlFor="phoneNumberPassword">
                              {localization.auth.password}
                            </FieldLabel>
                            <InputGroup>
                              <InputGroupInput
                                id="phoneNumberPassword"
                                name={field.name}
                                type={isPasswordVisible ? "text" : "password"}
                                autoComplete="current-password"
                                value={field.state.value}
                                placeholder={
                                  localization.auth.passwordPlaceholder
                                }
                                required
                                minLength={emailAndPassword?.minPasswordLength}
                                maxLength={emailAndPassword?.maxPasswordLength}
                                disabled={isPending}
                                onBlur={field.handleBlur}
                                onChange={(event) =>
                                  field.handleChange(event.target.value)
                                }
                              />
                              <InputGroupAddon align="inline-end">
                                <InputGroupButton
                                  type="button"
                                  size="icon-xs"
                                  aria-label={
                                    isPasswordVisible
                                      ? localization.auth.hidePassword
                                      : localization.auth.showPassword
                                  }
                                  title={
                                    isPasswordVisible
                                      ? localization.auth.hidePassword
                                      : localization.auth.showPassword
                                  }
                                  onClick={() =>
                                    setIsPasswordVisible((visible) => !visible)
                                  }
                                >
                                  {isPasswordVisible ? <EyeOff /> : <Eye />}
                                </InputGroupButton>
                              </InputGroupAddon>
                            </InputGroup>
                            <field.AuthFormFieldError />
                          </Field>
                        )}
                      </form.AppField>
                    )}

                    {mode === "password" && emailAndPassword?.rememberMe && (
                      <form.AppField name="rememberMe">
                        {(field) => (
                          <Field orientation="horizontal">
                            <Checkbox
                              id="phoneNumberRememberMe"
                              name={field.name}
                              disabled={isPending}
                              checked={field.state.value}
                              onCheckedChange={(checked) =>
                                field.handleChange(checked === true)
                              }
                            />
                            <FieldLabel
                              htmlFor="phoneNumberRememberMe"
                              className="cursor-pointer font-normal"
                            >
                              {localization.auth.rememberMe}
                            </FieldLabel>
                          </Field>
                        )}
                      </form.AppField>
                    )}

                    {Captcha && (
                      <div className="flex justify-center">{Captcha}</div>
                    )}
                  </>
                )}

                <div className="flex flex-col gap-3">
                  <form.AuthFormSubmitButton
                    disabled={isPending || (codeSent && !codeComplete)}
                  >
                    {(isSending || isVerifying || isPasswordPending) && (
                      <Spinner />
                    )}
                    {mode === "password"
                      ? localization.auth.signIn
                      : codeSent
                        ? phoneLocalization.verifyCode
                        : phoneLocalization.sendCode}
                  </form.AuthFormSubmitButton>

                  {codeSent ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isPending || isCoolingDown}
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
                        disabled={isPending}
                        onClick={() => {
                          form.setFieldValue("code", "")
                          setCodeSent(false)
                        }}
                      >
                        {phoneLocalization.useDifferentPhoneNumber}
                      </Button>
                    </>
                  ) : (
                    <>
                      {canSwitchMode && (
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isPending}
                          onClick={switchMode}
                        >
                          {mode === "code"
                            ? phoneLocalization.usePassword
                            : phoneLocalization.useVerificationCode}
                        </Button>
                      )}
                      {plugins.flatMap((plugin) =>
                        (plugin.authButtons ?? []).map((AuthButton) => (
                          <AuthButton
                            key={`${plugin.id}-${AuthButton.displayName ?? AuthButton.name}`}
                            view="phoneNumber"
                          />
                        ))
                      )}
                    </>
                  )}
                </div>
              </FieldGroup>
            </form.AuthFormRoot>
          </form.AppForm>

          {socialPosition === "bottom" && showProviders && (
            <>
              {showSeparator && (
                <FieldSeparator className="flex items-center text-xs *:data-[slot=field-separator-content]:bg-card">
                  {localization.auth.or}
                </FieldSeparator>
              )}
              <ProviderButtons socialLayout={socialLayout} view="phoneNumber" />
            </>
          )}
        </div>

        <div className="mt-4 flex w-full flex-col items-center gap-3">
          {mode === "password" && passwordReset && (
            <Link
              href={`${basePaths.auth}/${phoneNumberViewPaths.auth.phoneNumberForgotPassword}`}
              className="text-sm underline-offset-4 hover:underline"
            >
              {phoneLocalization.forgotPassword}
            </Link>
          )}
          {emailAndPassword?.enabled && (
            <FieldDescription className="text-center">
              {localization.auth.needToCreateAnAccount}{" "}
              <Link
                href={`${basePaths.auth}/${viewPaths.auth.signUp}`}
                className="underline underline-offset-4"
              >
                {localization.auth.signUp}
              </Link>
            </FieldDescription>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
