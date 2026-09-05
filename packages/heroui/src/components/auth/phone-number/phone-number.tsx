import {
  authMutationKeys,
  getFormFieldErrorMessage,
  validateStringLength
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
import { Eye, EyeSlash } from "@gravity-ui/icons"
import {
  Button,
  Card,
  type CardProps,
  Checkbox,
  cn,
  Description,
  InputGroup,
  Label,
  Link,
  TextField
} from "@heroui/react"
import { useSelector } from "@tanstack/react-form"
import { useIsMutating } from "@tanstack/react-query"
import { useState } from "react"

import { phoneNumberPlugin } from "../../../lib/auth/phone-number-plugin"
import { useResendCooldown } from "../../../lib/auth/use-resend-cooldown"
import { useSignInContinuation } from "../../../lib/auth/use-sign-in-continuation"
import {
  isAuthFormFieldInvalid,
  setAuthFormServerError,
  submitAuthForm,
  useAuthForm
} from "../auth-form"
import { FieldSeparator } from "../field-separator"
import { OtpField } from "../otp-field"
import { ProviderButtons, type SocialLayout } from "../provider-buttons"
import { ReauthenticationNotice } from "../reauthentication"
import { InternationalPhoneField } from "./international-phone-field"

type PhoneNumberMode = "code" | "password"

export type PhoneNumberProps = {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
  variant?: CardProps["variant"]
}

/** Sign in with either a phone verification code or a phone and password. */
export function PhoneNumber({
  className,
  socialLayout,
  socialPosition = "bottom",
  variant
}: PhoneNumberProps) {
  const {
    authClient,
    basePaths,
    emailAndPassword,
    localization,
    plugins,
    socialProviders,
    viewPaths
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
    await sendOtp({ phoneNumber: normalizedPhoneNumber, fetchOptions })
  }
  const verifyCode = async (completedCode: string) => {
    if (isPending || completedCode.length !== otpLength) return
    const normalizedPhoneNumber = form.state.values.phoneNumber.e164
    if (!normalizedPhoneNumber) return
    await verify({ phoneNumber: normalizedPhoneNumber, code: completedCode })
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

  const resendCode = async () => {
    try {
      await sendCode()
    } catch (error) {
      setAuthFormServerError(form, error, phoneLocalization.sendCode)
    }
  }

  return (
    <Card
      className={cn("w-full max-w-sm gap-4 md:p-6", className)}
      variant={variant}
    >
      <AuthPrompts view="phoneNumber" />
      <ReauthenticationNotice />
      <Card.Header>
        <Card.Title className="mb-1 text-xl font-semibold">
          {localization.auth.signIn}
        </Card.Title>
        {codeSent && (
          <Card.Description>
            {phoneLocalization.codeSentTo.replace(
              "{{phoneNumber}}",
              phoneNumberDisplay
            )}
          </Card.Description>
        )}
      </Card.Header>
      <Card.Content className="gap-4">
        {socialPosition === "top" && showProviders && (
          <>
            <ProviderButtons socialLayout={socialLayout} view="phoneNumber" />
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
                    label={phoneLocalization.phoneCode}
                    length={otpLength}
                    name="otp"
                    value={field.state.value}
                    variant={variant}
                    onChange={field.handleChange}
                    onComplete={() => void submitAuthForm(form)}
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
                      error={getFormFieldErrorMessage(field.state.meta.errors)}
                      isDisabled={isPending}
                      locale={locale}
                      phoneLabel={phoneLocalization.phoneNumber}
                      placeholder={phoneLocalization.phoneNumberPlaceholder}
                      value={field.state.value}
                      variant={
                        variant === "transparent" ? "primary" : "secondary"
                      }
                      onChange={field.handleChange}
                    />
                  )}
                </form.AppField>
                {mode === "password" && (
                  <form.AppField
                    name="password"
                    validators={{
                      onChange: ({ value }) =>
                        validateStringLength(value, {
                          requiredMessage: localization.auth.fieldRequired
                        })
                    }}
                  >
                    {(field) => (
                      <TextField
                        name={field.name}
                        autoComplete="current-password"
                        value={field.state.value}
                        isDisabled={isPending}
                        isInvalid={isAuthFormFieldInvalid(field.state.meta)}
                        validationBehavior="aria"
                        onBlur={field.handleBlur}
                        onChange={field.handleChange}
                      >
                        <Label>{localization.auth.password}</Label>
                        <InputGroup
                          variant={
                            variant === "transparent" ? "primary" : "secondary"
                          }
                        >
                          <InputGroup.Input
                            placeholder={localization.auth.passwordPlaceholder}
                            type={isPasswordVisible ? "text" : "password"}
                            required
                          />
                          <InputGroup.Suffix className="px-0">
                            <Button
                              isIconOnly
                              aria-label={
                                isPasswordVisible
                                  ? localization.auth.hidePassword
                                  : localization.auth.showPassword
                              }
                              size="sm"
                              variant="ghost"
                              isDisabled={isPending || isPasswordPending}
                              onPress={() =>
                                setIsPasswordVisible(!isPasswordVisible)
                              }
                            >
                              {isPasswordVisible ? <EyeSlash /> : <Eye />}
                            </Button>
                          </InputGroup.Suffix>
                        </InputGroup>
                        <field.AuthFormFieldError />
                      </TextField>
                    )}
                  </form.AppField>
                )}
                {mode === "password" && emailAndPassword?.rememberMe && (
                  <form.AppField name="rememberMe">
                    {(field) => (
                      <Checkbox
                        name={field.name}
                        isDisabled={isPending || isPasswordPending}
                        isSelected={field.state.value}
                        variant={
                          variant === "transparent" ? "primary" : "secondary"
                        }
                        onChange={field.handleChange}
                      >
                        <Checkbox.Content>
                          <Checkbox.Control>
                            <Checkbox.Indicator />
                          </Checkbox.Control>
                          {localization.auth.rememberMe}
                        </Checkbox.Content>
                      </Checkbox>
                    )}
                  </form.AppField>
                )}
              </>
            )}
            {Captcha && <div className="flex justify-center">{Captcha}</div>}
            <div className="flex flex-col gap-3">
              <form.AuthFormSubmitButton
                isPending={isSending || isVerifying || isPasswordPending}
                className="w-full"
                isDisabled={
                  isPending || isPasswordPending || (codeSent && !codeComplete)
                }
              >
                {mode === "password"
                  ? localization.auth.signIn
                  : codeSent
                    ? phoneLocalization.verifyCode
                    : phoneLocalization.sendCode}
              </form.AuthFormSubmitButton>
              {codeSent ? (
                <>
                  <Button
                    className="w-full"
                    variant="tertiary"
                    isDisabled={isPending || isCoolingDown}
                    onPress={() => void resendCode()}
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
                    isDisabled={isPending}
                    onPress={() => {
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
                      className="w-full"
                      variant="tertiary"
                      isDisabled={isPending || isPasswordPending}
                      onPress={switchMode}
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
            <form.AuthFormServerError />
          </form.AuthFormRoot>
        </form.AppForm>
        {socialPosition === "bottom" && showProviders && (
          <>
            {showSeparator && (
              <FieldSeparator>{localization.auth.or}</FieldSeparator>
            )}
            <ProviderButtons socialLayout={socialLayout} view="phoneNumber" />
          </>
        )}
      </Card.Content>
      <Card.Footer className="flex-col gap-3">
        {mode === "password" && passwordReset && (
          <Link
            className="text-sm no-underline hover:underline"
            href={`${basePaths.auth}/${phoneNumberViewPaths.auth.phoneNumberForgotPassword}`}
          >
            {phoneLocalization.forgotPassword}
          </Link>
        )}
        {emailAndPassword?.enabled && (
          <Description className="text-sm">
            {localization.auth.needToCreateAnAccount}{" "}
            <Link
              className="text-accent no-underline decoration-accent-hover hover:underline"
              href={`${basePaths.auth}/${viewPaths.auth.signUp}`}
            >
              {localization.auth.signUp}
            </Link>
          </Description>
        )}
      </Card.Footer>
    </Card>
  )
}
