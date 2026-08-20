import {
  isPasskeyAutoFillEnabled,
  withPasskeyAutoFill
} from "@better-auth-ui/core/plugins/passkey"
import {
  type SsoAuthClient,
  setSsoFallbackEmail
} from "@better-auth-ui/core/plugins/sso"
import {
  AuthLink,
  type AuthPlugin,
  AuthPrompts,
  useAuth,
  useAuthPlugin,
  useFetchOptions,
  useSignInEmail
} from "@better-auth-ui/solid"
import { useSignInSso } from "@better-auth-ui/solid/plugins/sso"
import { Eye, EyeOff } from "lucide-solid"
import { type Component, createSignal, For, Show } from "solid-js"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { ssoPlugin } from "@/lib/auth/sso-plugin"
import { useSignInContinuation } from "@/lib/auth/use-sign-in-continuation"
import { cn } from "@/lib/utils"
import type { SocialLayout } from "../provider-buttons"
import { ProviderButtons } from "../provider-buttons"

type AuthButtonComponent = Component<{ view?: string }>

type AuthPluginWithButtons = {
  authButtons?: AuthButtonComponent[]
  id: string
}

export type EmailFirstSignInProps = {
  class?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
}

/** Discover organization SSO by email, then expose configured fallback methods. */
export function EmailFirstSignIn(props: EmailFirstSignInProps) {
  const auth = useAuth()
  const { localization: ssoLocalization } = useAuthPlugin(ssoPlugin)
  const { fetchOptions, resetFetchOptions } = useFetchOptions()
  const continueSignIn = useSignInContinuation()

  const socialPosition = () => props.socialPosition ?? "bottom"

  const [step, setStep] = createSignal<"email" | "fallback">("email")
  const [email, setEmail] = createSignal("")
  const [password, setPassword] = createSignal("")
  const [isPasswordVisible, setIsPasswordVisible] = createSignal(false)
  const [discoveryError, setDiscoveryError] = createSignal("")
  const [emailError, setEmailError] = createSignal<string>()
  const [passwordError, setPasswordError] = createSignal<string>()

  const signInSso = useSignInSso(auth.authClient as SsoAuthClient, () => ({
    onError: (error) => {
      // A 404 means no organization claims the domain, so fall back to the
      // methods this app configured rather than dead-ending the user.
      if (error.status === 404) {
        setSsoFallbackEmail(email())
        setDiscoveryError(ssoLocalization.noProvider)
        setStep("fallback")
        return
      }

      setDiscoveryError(ssoLocalization.ssoUnavailable)
    }
  }))

  const signInEmail = useSignInEmail(auth.authClient, () => ({
    onError: (error) => {
      setPassword("")

      if (error.error?.code === "EMAIL_NOT_VERIFIED") {
        sessionStorage.setItem("better-auth-ui.verify-email", email())
        auth.navigate({
          to: `${auth.basePaths.auth}/${auth.viewPaths.auth.verifyEmail}`
        })
      }

      resetFetchOptions()
    },
    onSuccess: (data) => continueSignIn(data)
  }))

  const isPending = () => signInSso.isPending || signInEmail.isPending

  const captchaComponent = () =>
    (auth.plugins as AuthPlugin[]).find((plugin) => plugin.captchaComponent)
      ?.captchaComponent

  const passkeyAutoFill = () => isPasskeyAutoFillEnabled(auth.plugins)
  const showSocialSeparator = () =>
    auth.emailAndPassword.enabled && Boolean(auth.socialProviders?.length)

  const submitEmail = (event: SubmitEvent) => {
    event.preventDefault()
    setDiscoveryError("")
    setSsoFallbackEmail(email())

    signInSso.mutate({
      email: email(),
      callbackURL: `${auth.baseURL}${auth.redirectTo}`,
      loginHint: email()
    })
  }

  const submitPassword = (event: SubmitEvent) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget as HTMLFormElement)

    signInEmail.mutate({
      email: email(),
      password: password(),
      ...(auth.emailAndPassword.rememberMe
        ? { rememberMe: formData.get("rememberMe") === "on" }
        : {}),
      fetchOptions: fetchOptions()
    })
  }

  const startOver = () => {
    setStep("email")
    setPassword("")
    setDiscoveryError("")
  }

  return (
    <Card class={cn("w-full max-w-sm", props.class)}>
      <AuthPrompts view="signIn" />

      <CardHeader>
        <CardTitle class="text-xl font-semibold">
          {auth.localization.auth.signIn}
        </CardTitle>
        <CardDescription>
          {step() === "email" ? ssoLocalization.emailFirstDescription : email()}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Show
          fallback={
            <div class="flex flex-col gap-4">
              <Show
                when={
                  socialPosition() === "top" && auth.socialProviders?.length
                }
              >
                <ProviderButtons
                  socialLayout={props.socialLayout}
                  view="signIn"
                />
                <Show when={showSocialSeparator()}>
                  <div class="text-center text-muted-foreground text-xs">
                    {auth.localization.auth.or}
                  </div>
                </Show>
              </Show>

              <Show when={discoveryError()}>
                {(message) => (
                  <p class="text-sm text-muted-foreground" role="status">
                    {message()}
                  </p>
                )}
              </Show>

              <Show when={auth.emailAndPassword.enabled}>
                <form class="flex flex-col gap-4" onSubmit={submitPassword}>
                  <Field data-invalid={Boolean(passwordError())}>
                    <FieldLabel for="sso-password">
                      {auth.localization.auth.password}
                    </FieldLabel>

                    <InputGroup>
                      <InputGroupInput
                        aria-invalid={Boolean(passwordError())}
                        autocomplete={withPasskeyAutoFill(
                          "current-password",
                          passkeyAutoFill()
                        )}
                        disabled={isPending()}
                        id="sso-password"
                        maxLength={auth.emailAndPassword.maxPasswordLength}
                        minLength={auth.emailAndPassword.minPasswordLength}
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
                        placeholder={auth.localization.auth.passwordPlaceholder}
                        required
                        type={isPasswordVisible() ? "text" : "password"}
                        value={password()}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          aria-label={
                            isPasswordVisible()
                              ? auth.localization.auth.hidePassword
                              : auth.localization.auth.showPassword
                          }
                          onClick={() =>
                            setIsPasswordVisible((visible) => !visible)
                          }
                          size="icon-xs"
                          type="button"
                        >
                          {isPasswordVisible() ? <EyeOff /> : <Eye />}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>

                    <Show when={passwordError()}>
                      {(message) => <FieldError>{message()}</FieldError>}
                    </Show>
                  </Field>

                  <Show when={auth.emailAndPassword.rememberMe}>
                    <Field>
                      <div class="flex items-center gap-3">
                        <Checkbox
                          disabled={isPending()}
                          id="sso-remember-me"
                          name="rememberMe"
                        />
                        <FieldLabel
                          class="cursor-pointer text-sm font-normal"
                          for="sso-remember-me"
                        >
                          {auth.localization.auth.rememberMe}
                        </FieldLabel>
                      </div>
                    </Field>
                  </Show>

                  <Show keyed when={captchaComponent()}>
                    {(Captcha) => <Captcha />}
                  </Show>

                  <Button disabled={isPending()} type="submit">
                    <Show when={signInEmail.isPending}>
                      <Spinner data-icon="inline-start" />
                    </Show>
                    {auth.localization.auth.signIn}
                  </Button>
                </form>
              </Show>

              <For
                each={(auth.plugins as AuthPluginWithButtons[]).flatMap(
                  (plugin) =>
                    (plugin.authButtons ?? []).map((AuthButton, index) => ({
                      AuthButton,
                      key: `${plugin.id}-${index.toString()}`
                    }))
                )}
              >
                {({ AuthButton }) => <AuthButton view="signIn" />}
              </For>

              <Show
                when={
                  socialPosition() === "bottom" && auth.socialProviders?.length
                }
              >
                <Show when={showSocialSeparator()}>
                  <div class="text-center text-muted-foreground text-xs">
                    {auth.localization.auth.or}
                  </div>
                </Show>
                <ProviderButtons
                  socialLayout={props.socialLayout}
                  view="signIn"
                />
              </Show>

              <Button onClick={startOver} type="button" variant="ghost">
                {ssoLocalization.useDifferentEmail}
              </Button>
            </div>
          }
          when={step() === "email"}
        >
          <form class="flex flex-col gap-4" onSubmit={submitEmail}>
            <Field data-invalid={Boolean(emailError())}>
              <FieldLabel for="sso-email">
                {auth.localization.auth.email}
              </FieldLabel>
              <Input
                aria-invalid={Boolean(emailError())}
                autocomplete={withPasskeyAutoFill("email", passkeyAutoFill())}
                disabled={isPending()}
                id="sso-email"
                name="email"
                onInput={(event) => {
                  setEmail(event.currentTarget.value)
                  setEmailError(undefined)
                }}
                onInvalid={(event) => {
                  event.preventDefault()
                  setEmailError(event.currentTarget.validationMessage)
                }}
                placeholder={auth.localization.auth.emailPlaceholder}
                required
                type="email"
                value={email()}
              />
              <Show when={emailError()}>
                {(message) => <FieldError>{message()}</FieldError>}
              </Show>
            </Field>

            <Show when={discoveryError()}>
              {(message) => (
                <p class="text-sm text-destructive" role="alert">
                  {message()}
                </p>
              )}
            </Show>

            <Button disabled={isPending()} type="submit">
              <Show when={signInSso.isPending}>
                <Spinner data-icon="inline-start" />
              </Show>
              {ssoLocalization.continueWithEmail}
            </Button>
          </form>
        </Show>

        <Show when={auth.emailAndPassword.enabled}>
          <div class="mt-4 flex w-full flex-col items-center gap-3">
            <Show
              when={
                step() === "fallback" && auth.emailAndPassword.forgotPassword
              }
            >
              <AuthLink
                class="text-sm underline-offset-4 hover:underline"
                href={`${auth.basePaths.auth}/${auth.viewPaths.auth.forgotPassword}`}
              >
                {auth.localization.auth.forgotPasswordLink}
              </AuthLink>
            </Show>

            <p class="text-center text-sm text-muted-foreground">
              {auth.localization.auth.needToCreateAnAccount}{" "}
              <AuthLink
                class="underline underline-offset-4"
                href={`${auth.basePaths.auth}/${auth.viewPaths.auth.signUp}`}
              >
                {auth.localization.auth.signUp}
              </AuthLink>
            </p>
          </div>
        </Show>
      </CardContent>
    </Card>
  )
}
