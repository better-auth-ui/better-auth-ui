"use client"

import { authMutationKeys } from "@better-auth-ui/core"
import {
  isPasskeyAutoFillEnabled,
  withPasskeyAutoFill
} from "@better-auth-ui/core/plugins/passkey"
import {
  type SsoAuthClient,
  setSsoFallbackEmail
} from "@better-auth-ui/core/plugins/sso"
import {
  AuthPrompts,
  getAuthButtonKey,
  useAuth,
  useAuthPlugin,
  useFetchOptions,
  useSignInEmail
} from "@better-auth-ui/react"
import { useSignInSso } from "@better-auth-ui/react/plugins/sso"
import { useIsMutating } from "@tanstack/react-query"
import { Eye, EyeOff } from "lucide-react"
import { type SyntheticEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { ProviderButtons } from "../provider-buttons"

export type EmailFirstSignInProps = {
  className?: string
  socialLayout?: "auto" | "horizontal" | "vertical" | "grid"
  socialPosition?: "top" | "bottom"
}

/** Discover organization SSO by email, then expose configured fallback methods. */
export function EmailFirstSignIn({
  className,
  socialLayout,
  socialPosition = "bottom"
}: EmailFirstSignInProps) {
  const {
    authClient,
    basePaths,
    baseURL,
    emailAndPassword,
    localization,
    navigate,
    plugins,
    redirectTo,
    socialProviders,
    viewPaths,
    Link
  } = useAuth()
  const { localization: ssoLocalization } = useAuthPlugin(ssoPlugin)
  const { fetchOptions, resetFetchOptions } = useFetchOptions()
  const continueSignIn = useSignInContinuation()

  const [step, setStep] = useState<"email" | "fallback">("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [discoveryError, setDiscoveryError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
  }>({})

  const { mutate: signInSso, isPending: isDiscovering } = useSignInSso(
    authClient as SsoAuthClient,
    {
      onError: (error) => {
        if (error.status === 404) {
          setSsoFallbackEmail(email)
          setDiscoveryError(ssoLocalization.noProvider)
          setStep("fallback")
          return
        }

        setDiscoveryError(ssoLocalization.ssoUnavailable)
      }
    }
  )

  const { mutate: signInEmail, isPending: isSigningIn } = useSignInEmail(
    authClient,
    {
      onError: (error) => {
        setPassword("")

        if (error.error?.code === "EMAIL_NOT_VERIFIED") {
          sessionStorage.setItem("better-auth-ui.verify-email", email)
          navigate({
            to: `${basePaths.auth}/${viewPaths.auth.verifyEmail}`
          })
        }

        resetFetchOptions()
      },
      onSuccess: (data) => continueSignIn(data)
    }
  )

  const signInMutating = useIsMutating({
    mutationKey: authMutationKeys.signIn.all
  })
  const isPending = signInMutating > 0
  const Captcha = plugins.find(
    (plugin) => plugin.captchaComponent
  )?.captchaComponent

  const passkeyAutoFill = isPasskeyAutoFillEnabled(plugins)
  const showSocialSeparator =
    emailAndPassword.enabled && !!socialProviders?.length

  const submitEmail = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    setDiscoveryError("")
    setSsoFallbackEmail(email)
    signInSso({
      email,
      callbackURL: `${baseURL}${redirectTo}`,
      loginHint: email
    })
  }

  const submitPassword = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    signInEmail({
      email,
      password,
      ...(emailAndPassword.rememberMe
        ? { rememberMe: formData.get("rememberMe") === "on" }
        : {}),
      fetchOptions
    })
  }

  const startOver = () => {
    setStep("email")
    setPassword("")
    setDiscoveryError("")
  }

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <AuthPrompts view="signIn" />
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {localization.auth.signIn}
        </CardTitle>
        <CardDescription>
          {step === "email" ? ssoLocalization.emailFirstDescription : email}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {step === "email" ? (
          <form onSubmit={submitEmail}>
            <FieldGroup>
              <Field data-invalid={!!fieldErrors.email}>
                <FieldLabel htmlFor="sso-email">
                  {localization.auth.email}
                </FieldLabel>
                <Input
                  id="sso-email"
                  name="email"
                  type="email"
                  autoComplete={withPasskeyAutoFill("email", passkeyAutoFill)}
                  autoFocus
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setFieldErrors((current) => ({
                      ...current,
                      email: undefined
                    }))
                  }}
                  onInvalid={(event) => {
                    event.preventDefault()
                    const element = event.currentTarget
                    setFieldErrors((current) => ({
                      ...current,
                      email: element.validity.valueMissing
                        ? localization.auth.fieldRequired
                        : localization.auth.invalidEmail
                    }))
                  }}
                  placeholder={localization.auth.emailPlaceholder}
                  required
                  disabled={isPending}
                  aria-invalid={!!fieldErrors.email}
                />
                <FieldError>{fieldErrors.email}</FieldError>
              </Field>

              {discoveryError && (
                <FieldDescription role="alert" className="text-destructive">
                  {discoveryError}
                </FieldDescription>
              )}

              <Button type="submit" disabled={isPending}>
                {isDiscovering && <Spinner data-icon="inline-start" />}
                {ssoLocalization.continueWithEmail}
              </Button>
            </FieldGroup>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            {socialPosition === "top" && (
              <>
                {!!socialProviders?.length && (
                  <ProviderButtons socialLayout={socialLayout} view="signIn" />
                )}
                {showSocialSeparator && (
                  <FieldSeparator>{localization.auth.or}</FieldSeparator>
                )}
              </>
            )}

            {discoveryError && (
              <FieldDescription role="status">
                {discoveryError}
              </FieldDescription>
            )}

            {emailAndPassword.enabled && (
              <form onSubmit={submitPassword}>
                <FieldGroup>
                  <Field data-invalid={!!fieldErrors.password}>
                    <FieldLabel htmlFor="sso-password">
                      {localization.auth.password}
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        id="sso-password"
                        name="password"
                        type={isPasswordVisible ? "text" : "password"}
                        autoComplete={withPasskeyAutoFill(
                          "current-password",
                          passkeyAutoFill
                        )}
                        autoFocus
                        value={password}
                        onChange={(event) => {
                          setPassword(event.target.value)
                          setFieldErrors((current) => ({
                            ...current,
                            password: undefined
                          }))
                        }}
                        onInvalid={(event) => {
                          event.preventDefault()
                          const element = event.currentTarget
                          const message = element.validity.valueMissing
                            ? localization.auth.fieldRequired
                            : element.validity.tooShort
                              ? localization.auth.tooShort.replace(
                                  "{{min}}",
                                  String(emailAndPassword.minPasswordLength)
                                )
                              : localization.auth.tooLong.replace(
                                  "{{max}}",
                                  String(emailAndPassword.maxPasswordLength)
                                )

                          setFieldErrors((current) => ({
                            ...current,
                            password: message
                          }))
                        }}
                        placeholder={localization.auth.passwordPlaceholder}
                        minLength={emailAndPassword.minPasswordLength}
                        maxLength={emailAndPassword.maxPasswordLength}
                        required
                        disabled={isPending}
                        aria-invalid={!!fieldErrors.password}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          size="icon-xs"
                          aria-label={
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

                  {emailAndPassword.rememberMe && (
                    <Field>
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="sso-remember-me"
                          name="rememberMe"
                          disabled={isPending}
                        />
                        <FieldLabel
                          htmlFor="sso-remember-me"
                          className="cursor-pointer text-sm font-normal"
                        >
                          {localization.auth.rememberMe}
                        </FieldLabel>
                      </div>
                    </Field>
                  )}

                  {Captcha && (
                    <div className="flex justify-center">{Captcha}</div>
                  )}

                  <Button type="submit" disabled={isPending}>
                    {isSigningIn && <Spinner data-icon="inline-start" />}
                    {localization.auth.signIn}
                  </Button>
                </FieldGroup>
              </form>
            )}

            {plugins.flatMap((plugin) =>
              (plugin.authButtons ?? []).map((AuthButton) => (
                <AuthButton
                  key={getAuthButtonKey(plugin.id, AuthButton)}
                  view="signIn"
                />
              ))
            )}

            {socialPosition === "bottom" && (
              <>
                {showSocialSeparator && (
                  <FieldSeparator>{localization.auth.or}</FieldSeparator>
                )}
                {!!socialProviders?.length && (
                  <ProviderButtons socialLayout={socialLayout} view="signIn" />
                )}
              </>
            )}

            <Button variant="ghost" onClick={startOver}>
              {ssoLocalization.useDifferentEmail}
            </Button>
          </div>
        )}
      </CardContent>

      {emailAndPassword.enabled && (
        <CardFooter className="flex-col gap-3">
          {step === "fallback" && emailAndPassword.forgotPassword && (
            <Link
              href={`${basePaths.auth}/${viewPaths.auth.forgotPassword}`}
              className="text-sm underline-offset-4 hover:underline"
            >
              {localization.auth.forgotPasswordLink}
            </Link>
          )}
          <FieldDescription className="text-center">
            {localization.auth.needToCreateAnAccount}{" "}
            <Link
              href={`${basePaths.auth}/${viewPaths.auth.signUp}`}
              className="underline underline-offset-4"
            >
              {localization.auth.signUp}
            </Link>
          </FieldDescription>
        </CardFooter>
      )}
    </Card>
  )
}
