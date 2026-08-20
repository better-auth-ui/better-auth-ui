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
import { Eye, EyeSlash } from "@gravity-ui/icons"
import {
  Button,
  Card,
  type CardProps,
  Checkbox,
  cn,
  Description,
  FieldError,
  Form,
  InputGroup,
  Label,
  Link,
  Spinner,
  TextField
} from "@heroui/react"
import { useIsMutating } from "@tanstack/react-query"
import { type SyntheticEvent, useState } from "react"

import { phoneNumberPlugin } from "../../../lib/auth/phone-number-plugin"
import { useResendCooldown } from "../../../lib/auth/use-resend-cooldown"
import { useSignInContinuation } from "../../../lib/auth/use-sign-in-continuation"
import { FieldSeparator } from "../field-separator"
import { OtpField } from "../otp-field"
import { ProviderButtons, type SocialLayout } from "../provider-buttons"
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
  const [phoneNumber, setPhoneNumber] = useState(() =>
    createPhoneNumberValue("", defaultCountry, adapter)
  )
  const [phoneError, setPhoneError] = useState<string>()
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [codeSent, setCodeSent] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

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
    setPhoneError(phoneLocalization.invalidPhoneNumber)
  }
  const sendCode = () => {
    const normalizedPhoneNumber = getPhoneNumber()
    if (!normalizedPhoneNumber) return
    sendOtp({ phoneNumber: normalizedPhoneNumber, fetchOptions })
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
    <Card
      className={cn("w-full max-w-sm gap-4 md:p-6", className)}
      variant={variant}
    >
      <AuthPrompts view="phoneNumber" />
      <Card.Header>
        <Card.Title className="mb-1 text-xl font-semibold">
          {localization.auth.signIn}
        </Card.Title>
        {codeSent && (
          <Card.Description>
            {phoneLocalization.codeSentTo.replace(
              "{{phoneNumber}}",
              phoneNumber.display
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
        <Form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {codeSent ? (
            <OtpField
              autoFocus
              isDisabled={isPending}
              label={phoneLocalization.phoneCode}
              length={otpLength}
              name="otp"
              value={code}
              variant={variant}
              onChange={setCode}
              onComplete={verifyCode}
            />
          ) : (
            <>
              <InternationalPhoneField
                adapter={adapter}
                countryCodes={countries}
                countryLabel={phoneLocalization.country}
                error={phoneError}
                isDisabled={isPending}
                locale={locale}
                phoneLabel={phoneLocalization.phoneNumber}
                placeholder={phoneLocalization.phoneNumberPlaceholder}
                value={phoneNumber}
                variant={variant === "transparent" ? "primary" : "secondary"}
                onChange={(value) => {
                  setPhoneNumber(value)
                  setPhoneError(undefined)
                }}
              />
              {mode === "password" && (
                <TextField
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  isDisabled={isPending}
                  onChange={setPassword}
                  validate={(value) =>
                    value ? undefined : localization.auth.fieldRequired
                  }
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
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                      >
                        {isPasswordVisible ? <EyeSlash /> : <Eye />}
                      </Button>
                    </InputGroup.Suffix>
                  </InputGroup>
                  <FieldError />
                </TextField>
              )}
              {mode === "password" && emailAndPassword?.rememberMe && (
                <Checkbox
                  name="rememberMe"
                  isDisabled={isPending || isPasswordPending}
                  variant={variant === "transparent" ? "primary" : "secondary"}
                >
                  <Checkbox.Content>
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    {localization.auth.rememberMe}
                  </Checkbox.Content>
                </Checkbox>
              )}
            </>
          )}
          {Captcha && <div className="flex justify-center">{Captcha}</div>}
          <div className="flex flex-col gap-3">
            <Button
              className="w-full"
              type="submit"
              isDisabled={codeSent && code.length !== otpLength}
              isPending={isPending || isPasswordPending}
            >
              {(isSending || isVerifying || isPasswordPending) && (
                <Spinner color="current" size="sm" />
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
                  className="w-full"
                  variant="tertiary"
                  isDisabled={isPending || isCoolingDown}
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
                  isDisabled={isPending}
                  onPress={() => {
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
        </Form>
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
