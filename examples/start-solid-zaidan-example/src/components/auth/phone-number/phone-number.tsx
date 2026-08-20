import {
  createPhoneNumberValue,
  type PhoneNumberAuthClient
} from "@better-auth-ui/core/plugins/phone-number"
import {
  AuthLink,
  type AuthPlugin,
  AuthPrompts,
  useAuth,
  useAuthPlugin,
  useFetchOptions
} from "@better-auth-ui/solid"
import {
  useSendPhoneNumberOtp,
  useSignInPhoneNumber,
  useVerifyPhoneNumber
} from "@better-auth-ui/solid/plugins/phone-number"
import type { BetterFetchError } from "better-auth/client"
import { type Component, createSignal, For, Show } from "solid-js"

import { OtpField } from "@/components/auth/otp-field"
import { InternationalPhoneField } from "@/components/auth/phone-number/international-phone-field"
import {
  ProviderButtons,
  type SocialLayout
} from "@/components/auth/provider-buttons"
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
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { phoneNumberPlugin } from "@/lib/auth/phone-number-plugin"
import { useResendCooldown } from "@/lib/auth/use-resend-cooldown"
import { useSignInContinuation } from "@/lib/auth/use-sign-in-continuation"
import { cn } from "@/lib/utils"

type PhoneNumberMode = "code" | "password"

type AuthPluginWithButtons = AuthPlugin & {
  authButtons?: Component<{ view?: string }>[]
}

export type PhoneNumberProps = {
  class?: string
  socialLayout?: SocialLayout
  socialPosition?: "bottom" | "top"
}

/** Sign in with either a phone verification code or a phone and password. */
export function PhoneNumber(props: PhoneNumberProps) {
  const auth = useAuth()
  const {
    adapter,
    countries,
    defaultCountry,
    locale,
    localization,
    otpLength,
    passwordReset,
    passwordSignIn,
    signIn,
    viewPaths: phoneNumberViewPaths
  } = useAuthPlugin(phoneNumberPlugin)
  const { fetchOptions, resetFetchOptions } = useFetchOptions()
  const continueSignIn = useSignInContinuation()
  const { cooldown, isCoolingDown, startCooldown } = useResendCooldown()
  const phoneClient = () => auth.authClient as PhoneNumberAuthClient
  const [mode, setMode] = createSignal<PhoneNumberMode>(
    signIn ? "code" : "password"
  )
  const [phoneNumber, setPhoneNumber] = createSignal(
    createPhoneNumberValue("", defaultCountry, adapter)
  )
  const [phoneError, setPhoneError] = createSignal<string>()
  const [password, setPassword] = createSignal("")
  const [passwordError, setPasswordError] = createSignal<string>()
  const [code, setCode] = createSignal("")
  const [codeSent, setCodeSent] = createSignal(false)
  const sendOtp = useSendPhoneNumberOtp(phoneClient(), () => ({
    onError: () => resetFetchOptions(),
    onSuccess: () => {
      setCodeSent(true)
      startCooldown()
    }
  }))
  const verify = useVerifyPhoneNumber(phoneClient(), () => ({
    onError: () => setCode(""),
    onSuccess: (data) => continueSignIn(data)
  }))
  const signInWithPassword = useSignInPhoneNumber(phoneClient(), () => ({
    onError: (error) => {
      setPassword("")
      resetFetchOptions()
      if (
        signIn &&
        (error as BetterFetchError).error?.code === "PHONE_NUMBER_NOT_VERIFIED"
      ) {
        setMode("code")
        setCodeSent(true)
        startCooldown()
      }
    },
    onSuccess: (data) => continueSignIn(data)
  }))
  const isPending = () =>
    sendOtp.isPending || verify.isPending || signInWithPassword.isPending
  const normalizedPhoneNumber = () => {
    const value = phoneNumber().e164
    if (value) return value
    setPhoneError(localization.invalidPhoneNumber)
  }
  const requestCode = () => {
    const value = normalizedPhoneNumber()
    if (!value) return
    sendOtp.mutate({
      phoneNumber: value,
      fetchOptions: fetchOptions()
    } as Parameters<typeof sendOtp.mutate>[0])
  }
  const verifyCode = (completedCode: string) => {
    if (isPending() || completedCode.length !== otpLength) return
    if (!phoneNumber().e164) return
    verify.mutate({
      phoneNumber: phoneNumber().e164,
      code: completedCode
    } as Parameters<typeof verify.mutate>[0])
  }
  const submit = (event: SubmitEvent & { currentTarget: HTMLFormElement }) => {
    event.preventDefault()
    if (mode() === "password") {
      const value = normalizedPhoneNumber()
      if (!value) return
      const formData = new FormData(event.currentTarget)
      signInWithPassword.mutate({
        phoneNumber: value,
        password: password(),
        ...(auth.emailAndPassword?.rememberMe
          ? { rememberMe: formData.get("rememberMe") === "on" }
          : {}),
        fetchOptions: fetchOptions()
      } as Parameters<typeof signInWithPassword.mutate>[0])
      return
    }
    if (!codeSent()) {
      requestCode()
      return
    }
    verifyCode(code())
  }
  const switchMode = () => {
    setMode((current) => (current === "code" ? "password" : "code"))
    setCode("")
    setCodeSent(false)
    setPassword("")
  }
  const socialPosition = () => props.socialPosition ?? "bottom"
  const authButtons = () =>
    (auth.plugins as AuthPluginWithButtons[]).flatMap(
      (plugin) => plugin.authButtons ?? []
    )
  const captchaComponent = () =>
    (auth.plugins as AuthPlugin[]).find((plugin) => plugin.captchaComponent)
      ?.captchaComponent

  return (
    <Card class={cn("w-full max-w-sm", props.class)}>
      <AuthPrompts view="phoneNumber" />
      <CardHeader>
        <CardTitle class="text-xl font-semibold">
          {auth.localization.auth.signIn}
        </CardTitle>
        <Show when={codeSent()}>
          <CardDescription>
            {localization.codeSentTo.replace(
              "{{phoneNumber}}",
              phoneNumber().display
            )}
          </CardDescription>
        </Show>
      </CardHeader>
      <CardContent>
        <div class="flex flex-col gap-6">
          <Show
            when={
              socialPosition() === "top" &&
              !codeSent() &&
              auth.socialProviders?.length
            }
          >
            <ProviderButtons socialLayout={props.socialLayout} view="signIn" />
            <div class="text-center text-muted-foreground text-xs">
              {auth.localization.auth.or}
            </div>
          </Show>
          <form aria-label={auth.localization.auth.signIn} onSubmit={submit}>
            <FieldGroup>
              <Show
                when={codeSent()}
                fallback={
                  <>
                    <InternationalPhoneField
                      adapter={adapter}
                      countryCodes={countries}
                      countryLabel={localization.country}
                      disabled={isPending()}
                      error={phoneError()}
                      locale={locale}
                      phoneLabel={localization.phoneNumber}
                      placeholder={localization.phoneNumberPlaceholder}
                      value={phoneNumber()}
                      onChange={(value) => {
                        setPhoneNumber(value)
                        setPhoneError(undefined)
                      }}
                    />
                    <Show when={mode() === "password"}>
                      <Field data-invalid={Boolean(passwordError())}>
                        <FieldLabel for="phone-password">
                          {auth.localization.auth.password}
                        </FieldLabel>
                        <Input
                          aria-invalid={Boolean(passwordError())}
                          autocomplete="current-password"
                          disabled={isPending()}
                          id="phone-password"
                          name="password"
                          onInput={(event) => {
                            setPassword(event.currentTarget.value)
                            setPasswordError(undefined)
                          }}
                          onInvalid={(event) => {
                            event.preventDefault()
                            setPasswordError(
                              event.currentTarget.validationMessage
                            )
                          }}
                          placeholder={
                            auth.localization.auth.passwordPlaceholder
                          }
                          required
                          type="password"
                          value={password()}
                        />
                        <Show when={passwordError()}>
                          {(message) => <FieldError>{message()}</FieldError>}
                        </Show>
                      </Field>
                      <Show when={auth.emailAndPassword?.rememberMe}>
                        <Checkbox disabled={isPending()} name="rememberMe">
                          {auth.localization.auth.rememberMe}
                        </Checkbox>
                      </Show>
                    </Show>
                  </>
                }
              >
                <OtpField
                  autofocus
                  disabled={isPending()}
                  id="phone-code"
                  label={localization.phoneCode}
                  length={otpLength}
                  name="otp"
                  onInput={setCode}
                  onComplete={verifyCode}
                  value={code()}
                />
              </Show>
              <Show when={captchaComponent()} keyed>
                {(Captcha) => <Captcha />}
              </Show>
              <Button
                class="w-full"
                disabled={
                  isPending() || (codeSent() && code().length !== otpLength)
                }
                type="submit"
              >
                <Show when={isPending()}>
                  <Spinner />
                </Show>
                {mode() === "password"
                  ? auth.localization.auth.signIn
                  : codeSent()
                    ? localization.verifyCode
                    : localization.sendCode}
              </Button>
              <Show when={codeSent()}>
                <Button
                  class="w-full"
                  disabled={isPending() || isCoolingDown()}
                  onClick={requestCode}
                  type="button"
                  variant="outline"
                >
                  {isCoolingDown()
                    ? auth.localization.auth.resendIn.replace(
                        "{{seconds}}",
                        String(cooldown())
                      )
                    : auth.localization.auth.resend}
                </Button>
                <Button
                  class="w-full"
                  disabled={isPending()}
                  onClick={() => {
                    setCode("")
                    setCodeSent(false)
                  }}
                  type="button"
                  variant="ghost"
                >
                  {localization.useDifferentPhoneNumber}
                </Button>
              </Show>
              <Show when={!codeSent() && signIn && passwordSignIn}>
                <Button
                  class="w-full"
                  disabled={isPending()}
                  onClick={switchMode}
                  type="button"
                  variant="outline"
                >
                  {mode() === "code"
                    ? localization.usePassword
                    : localization.useVerificationCode}
                </Button>
              </Show>
              <Show when={!codeSent()}>
                <For each={authButtons()}>
                  {(AuthButton) => <AuthButton view="phoneNumber" />}
                </For>
              </Show>
            </FieldGroup>
          </form>
          <Show
            when={
              socialPosition() === "bottom" &&
              !codeSent() &&
              auth.socialProviders?.length
            }
          >
            <div class="text-center text-muted-foreground text-xs">
              {auth.localization.auth.or}
            </div>
            <ProviderButtons socialLayout={props.socialLayout} view="signIn" />
          </Show>
        </div>
        <div class="mt-4 flex w-full flex-col items-center gap-3">
          <Show when={mode() === "password" && passwordReset}>
            <AuthLink
              class="text-sm underline-offset-4 hover:underline"
              href={`${auth.basePaths.auth}/${phoneNumberViewPaths.auth.phoneNumberForgotPassword}`}
            >
              {localization.forgotPassword}
            </AuthLink>
          </Show>
          <Show when={auth.emailAndPassword?.enabled}>
            <p class="text-center text-sm text-muted-foreground">
              {auth.localization.auth.needToCreateAnAccount}{" "}
              <AuthLink
                class="underline underline-offset-4"
                href={`${auth.basePaths.auth}/${auth.viewPaths.auth.signUp}`}
              >
                {auth.localization.auth.signUp}
              </AuthLink>
            </p>
          </Show>
        </div>
      </CardContent>
    </Card>
  )
}
