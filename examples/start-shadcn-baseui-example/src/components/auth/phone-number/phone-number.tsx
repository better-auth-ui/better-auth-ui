"use client"

import { authMutationKeys } from "@better-auth-ui/core"
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
import { useIsMutating } from "@tanstack/react-query"
import { Eye, EyeOff } from "lucide-react"
import { type SyntheticEvent, useState } from "react"

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
  FieldError,
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
  const [phoneNumber, setPhoneNumber] = useState(() =>
    createPhoneNumberValue("", defaultCountry, adapter)
  )
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [codeSent, setCodeSent] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
    phoneNumber?: string
    password?: string
  }>({})

  const { mutate: sendOtp, isPending: isSending } = useSendPhoneNumberOtp(
    phoneClient,
    {
      onError: () => resetFetchOptions(),
      onSuccess: () => {
        setCodeSent(true)
        startCooldown()
      }
    }
  )
  const { mutate: verify, isPending: isVerifying } = useVerifyPhoneNumber(
    phoneClient,
    {
      onError: () => setCode(""),
      onSuccess: (data) => continueSignIn(data)
    }
  )
  const { mutate: signInWithPassword, isPending: isPasswordPending } =
    useSignInPhoneNumber(phoneClient, {
      onError: (error) => {
        setPassword("")
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

  const getPhoneNumber = () => {
    if (phoneNumber.e164) return phoneNumber.e164
    setFieldErrors((current) => ({
      ...current,
      phoneNumber: phoneLocalization.invalidPhoneNumber
    }))
  }
  const sendCode = () => {
    const normalizedPhoneNumber = getPhoneNumber()
    if (!normalizedPhoneNumber) return
    sendOtp({
      phoneNumber: normalizedPhoneNumber,
      fetchOptions
    } as Parameters<typeof sendOtp>[0])
  }
  const verifyCode = (completedCode: string) => {
    if (isPending || completedCode.length !== otpLength) return

    if (!phoneNumber.e164) return
    verify({ phoneNumber: phoneNumber.e164, code: completedCode })
  }
  const switchMode = () => {
    setMode((current) => (current === "code" ? "password" : "code"))
    setCode("")
    setCodeSent(false)
    setPassword("")
  }

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (mode === "password") {
      const normalizedPhoneNumber = getPhoneNumber()
      if (!normalizedPhoneNumber) return
      const formData = new FormData(event.currentTarget)
      signInWithPassword({
        phoneNumber: normalizedPhoneNumber,
        password,
        ...(emailAndPassword?.rememberMe
          ? { rememberMe: formData.get("rememberMe") === "on" }
          : {}),
        fetchOptions
      })
      return
    }

    if (!codeSent) {
      sendCode()
      return
    }

    verifyCode(code)
  }

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
              phoneNumber.display
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

          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {codeSent ? (
                <OtpField
                  autoFocus
                  disabled={isPending}
                  label={phoneLocalization.phoneCode}
                  length={otpLength}
                  name="otp"
                  value={code}
                  onChange={setCode}
                  onComplete={verifyCode}
                />
              ) : (
                <>
                  <InternationalPhoneField
                    adapter={adapter}
                    countryCodes={countries}
                    countryLabel={phoneLocalization.country}
                    disabled={isPending}
                    error={fieldErrors.phoneNumber}
                    locale={locale}
                    phoneLabel={phoneLocalization.phoneNumber}
                    placeholder={phoneLocalization.phoneNumberPlaceholder}
                    value={phoneNumber}
                    onChange={(value) => {
                      setPhoneNumber(value)
                      setFieldErrors((current) => ({
                        ...current,
                        phoneNumber: undefined
                      }))
                    }}
                  />

                  {mode === "password" && (
                    <Field data-invalid={Boolean(fieldErrors.password)}>
                      <FieldLabel htmlFor="phoneNumberPassword">
                        {localization.auth.password}
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          id="phoneNumberPassword"
                          name="password"
                          type={isPasswordVisible ? "text" : "password"}
                          autoComplete="current-password"
                          value={password}
                          placeholder={localization.auth.passwordPlaceholder}
                          required
                          minLength={emailAndPassword?.minPasswordLength}
                          maxLength={emailAndPassword?.maxPasswordLength}
                          disabled={isPending}
                          onChange={(event) => {
                            setPassword(event.target.value)
                            setFieldErrors((current) => ({
                              ...current,
                              password: undefined
                            }))
                          }}
                          onInvalid={(event) => {
                            event.preventDefault()
                            setFieldErrors((current) => ({
                              ...current,
                              password: event.currentTarget.validationMessage
                            }))
                          }}
                          aria-invalid={Boolean(fieldErrors.password)}
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
                      <FieldError>{fieldErrors.password}</FieldError>
                    </Field>
                  )}

                  {mode === "password" && emailAndPassword?.rememberMe && (
                    <Field orientation="horizontal">
                      <Checkbox
                        id="phoneNumberRememberMe"
                        name="rememberMe"
                        disabled={isPending}
                      />
                      <FieldLabel
                        htmlFor="phoneNumberRememberMe"
                        className="cursor-pointer font-normal"
                      >
                        {localization.auth.rememberMe}
                      </FieldLabel>
                    </Field>
                  )}

                  {Captcha && (
                    <div className="flex justify-center">{Captcha}</div>
                  )}
                </>
              )}

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  disabled={
                    isPending || (codeSent && code.length !== otpLength)
                  }
                >
                  {(isSending || isVerifying || isPasswordPending) && (
                    <Spinner />
                  )}
                  {mode === "password"
                    ? localization.auth.signIn
                    : codeSent
                      ? phoneLocalization.verifyCode
                      : phoneLocalization.sendCode}
                </Button>

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
                        setCode("")
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
          </form>

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
