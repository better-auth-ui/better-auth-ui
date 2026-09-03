import { validateStringLength } from "@better-auth-ui/core"
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
import { FieldGroup } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { phoneNumberPlugin } from "@/lib/auth/phone-number-plugin"
import { useResendCooldown } from "@/lib/auth/use-resend-cooldown"
import { useSignInContinuation } from "@/lib/auth/use-sign-in-continuation"
import { cn } from "@/lib/utils"
import {
  createAuthForm,
  isAuthFormFieldInvalid,
  setAuthFormServerError,
  submitAuthForm
} from "../auth-form"

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
  const [codeSent, setCodeSent] = createSignal(false)
  const sendOtp = useSendPhoneNumberOtp(phoneClient(), () => ({
    onError: () => resetFetchOptions(),
    onSuccess: () => {
      setCodeSent(true)
      startCooldown()
    }
  }))
  const verify = useVerifyPhoneNumber(phoneClient(), () => ({
    onError: () => form.setFieldValue("code", ""),
    onSuccess: (data) => continueSignIn(data)
  }))
  const signInWithPassword = useSignInPhoneNumber(phoneClient(), () => ({
    onError: (error) => {
      form.setFieldValue("password", "")
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
  const form = createAuthForm(() => ({
    defaultValues: {
      code: "",
      password: "",
      phoneNumber: createPhoneNumberValue("", defaultCountry, adapter),
      rememberMe: false
    },
    onSubmit: async ({ value }) => {
      if (mode() === "password") {
        await signInWithPassword.mutateAsync({
          phoneNumber: value.phoneNumber.e164,
          password: value.password,
          ...(auth.emailAndPassword?.rememberMe
            ? { rememberMe: value.rememberMe }
            : {}),
          fetchOptions: fetchOptions()
        } as Parameters<typeof signInWithPassword.mutateAsync>[0])
        return
      }
      if (!codeSent()) {
        await sendOtp.mutateAsync({
          phoneNumber: value.phoneNumber.e164,
          fetchOptions: fetchOptions()
        } as Parameters<typeof sendOtp.mutateAsync>[0])
        return
      }
      await verify.mutateAsync({
        phoneNumber: value.phoneNumber.e164,
        code: value.code
      } as Parameters<typeof verify.mutateAsync>[0])
    }
  }))
  const phoneNumber = form.useSelector((state) => state.values.phoneNumber)
  const code = form.useSelector((state) => state.values.code)
  const requestCode = async () => {
    try {
      await sendOtp.mutateAsync({
        phoneNumber: phoneNumber().e164,
        fetchOptions: fetchOptions()
      } as Parameters<typeof sendOtp.mutateAsync>[0])
    } catch (error) {
      setAuthFormServerError(form, error, "Unable to send a code. Try again.")
    }
  }
  const verifyCode = async (completedCode: string) => {
    if (isPending() || completedCode.length !== otpLength) return
    if (!phoneNumber().e164) return
    form.setFieldValue("code", completedCode)
    await submitAuthForm(form)
  }
  const switchMode = () => {
    setMode((current) => (current === "code" ? "password" : "code"))
    form.setFieldValue("code", "")
    setCodeSent(false)
    form.setFieldValue("password", "")
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
          <form.AppForm>
            <form.AuthFormRoot aria-label={auth.localization.auth.signIn}>
              <FieldGroup>
                <Show
                  when={codeSent()}
                  fallback={
                    <>
                      <form.AppField
                        name="phoneNumber"
                        validators={{
                          onChange: ({ value }) =>
                            value.e164
                              ? undefined
                              : localization.invalidPhoneNumber
                        }}
                      >
                        {(field) => (
                          <InternationalPhoneField
                            adapter={adapter}
                            countryCodes={countries}
                            countryLabel={localization.country}
                            disabled={isPending()}
                            error={
                              isAuthFormFieldInvalid(field().state.meta)
                                ? field().state.meta.errors[0]?.toString()
                                : undefined
                            }
                            locale={locale}
                            onChange={field().handleChange}
                            phoneLabel={localization.phoneNumber}
                            placeholder={localization.phoneNumberPlaceholder}
                            value={field().state.value}
                          />
                        )}
                      </form.AppField>
                      <Show when={mode() === "password"}>
                        <form.AppField
                          name="password"
                          validators={{
                            onChange: ({ value }) =>
                              validateStringLength(value, {
                                requiredMessage:
                                  auth.localization.auth.fieldRequired
                              })
                          }}
                        >
                          {(field) => (
                            <field.AuthFormTextField
                              autocomplete="current-password"
                              disabled={isPending()}
                              id="phone-password"
                              label={auth.localization.auth.password}
                              placeholder={
                                auth.localization.auth.passwordPlaceholder
                              }
                              type="password"
                            />
                          )}
                        </form.AppField>
                        <Show when={auth.emailAndPassword?.rememberMe}>
                          <form.AppField name="rememberMe">
                            {(field) => (
                              <Checkbox
                                checked={field().state.value}
                                disabled={isPending()}
                                name={field().name}
                                onChange={field().handleChange}
                              >
                                {auth.localization.auth.rememberMe}
                              </Checkbox>
                            )}
                          </form.AppField>
                        </Show>
                      </Show>
                    </>
                  }
                >
                  <form.AppField
                    name="code"
                    validators={{
                      onChange: ({ value }) =>
                        value.length === otpLength
                          ? undefined
                          : localization.codeLengthMismatch.replace(
                              "{{length}}",
                              String(otpLength)
                            )
                    }}
                  >
                    {(field) => (
                      <OtpField
                        autofocus
                        disabled={isPending()}
                        id="phone-code"
                        label={localization.phoneCode}
                        length={otpLength}
                        name={field().name}
                        onInput={field().handleChange}
                        onComplete={(value) => void verifyCode(value)}
                        value={field().state.value}
                      />
                    )}
                  </form.AppField>
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
                    onClick={() => void requestCode()}
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
                      form.setFieldValue("code", "")
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
                <form.AuthFormServerError />
              </FieldGroup>
            </form.AuthFormRoot>
          </form.AppForm>
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
