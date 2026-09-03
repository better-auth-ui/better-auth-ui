"use client"

import {
  authMutationKeys,
  validateEmailAddress,
  validateStringLength
} from "@better-auth-ui/core"
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
import { useSelector } from "@tanstack/react-form"
import { useIsMutating } from "@tanstack/react-query"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

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
import { isAuthFormFieldInvalid, useAuthForm } from "../auth-form"
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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [discoveryError, setDiscoveryError] = useState("")

  const { mutateAsync: signInSso, isPending: isDiscovering } = useSignInSso(
    authClient as SsoAuthClient,
    {
      onError: (error) => {
        if (error.status === 404) {
          setSsoFallbackEmail(form.state.values.email)
          setDiscoveryError(ssoLocalization.noProvider)
          setStep("fallback")
          return
        }

        setDiscoveryError(ssoLocalization.ssoUnavailable)
      }
    }
  )

  const { mutateAsync: signInEmail, isPending: isSigningIn } = useSignInEmail(
    authClient,
    {
      onError: (error) => {
        form.setFieldValue("password", "")

        if (error.error?.code === "EMAIL_NOT_VERIFIED") {
          sessionStorage.setItem(
            "better-auth-ui.verify-email",
            form.state.values.email
          )
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

  const form = useAuthForm({
    defaultValues: { email: "", password: "", rememberMe: false },
    onSubmit: async ({ value }) => {
      if (step === "email") {
        setDiscoveryError("")
        setSsoFallbackEmail(value.email)
        try {
          await signInSso({
            callbackURL: `${baseURL}${redirectTo}`,
            email: value.email,
            loginHint: value.email
          })
        } catch (error) {
          if ((error as { status?: number }).status !== 404) throw error
        }
        return
      }
      await signInEmail({
        email: value.email,
        password: value.password,
        ...(emailAndPassword.rememberMe
          ? { rememberMe: value.rememberMe }
          : {}),
        fetchOptions
      })
    }
  })
  const email = useSelector(form.store, (state) => state.values.email)

  const startOver = () => {
    setStep("email")
    form.setFieldValue("password", "")
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
        <form.AppForm>
          {step === "email" ? (
            <form.AuthFormRoot>
              <FieldGroup>
                <form.AppField
                  name="email"
                  validators={{
                    onChange: ({ value }) =>
                      validateEmailAddress(value, {
                        invalidMessage: localization.auth.invalidEmail,
                        requiredMessage: localization.auth.fieldRequired
                      })
                  }}
                >
                  {(field) => {
                    const isInvalid = isAuthFormFieldInvalid(field.state.meta)
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="sso-email">
                          {localization.auth.email}
                        </FieldLabel>
                        <Input
                          id="sso-email"
                          name={field.name}
                          type="email"
                          autoComplete={withPasskeyAutoFill(
                            "email",
                            passkeyAutoFill
                          )}
                          autoFocus
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          placeholder={localization.auth.emailPlaceholder}
                          required
                          disabled={isPending}
                          aria-invalid={isInvalid}
                        />
                        <field.AuthFormFieldError />
                      </Field>
                    )
                  }}
                </form.AppField>

                {discoveryError && (
                  <FieldDescription role="alert" className="text-destructive">
                    {discoveryError}
                  </FieldDescription>
                )}

                <form.AuthFormServerError />

                <form.AuthFormSubmitButton disabled={isPending}>
                  {isDiscovering && <Spinner data-icon="inline-start" />}
                  {ssoLocalization.continueWithEmail}
                </form.AuthFormSubmitButton>
              </FieldGroup>
            </form.AuthFormRoot>
          ) : (
            <div className="flex flex-col gap-4">
              {socialPosition === "top" && (
                <>
                  {!!socialProviders?.length && (
                    <ProviderButtons
                      socialLayout={socialLayout}
                      view="signIn"
                    />
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
                <form.AuthFormRoot>
                  <FieldGroup>
                    <form.AppField
                      name="password"
                      validators={{
                        onChange: ({ value }) =>
                          validateStringLength(value, {
                            maxLength: emailAndPassword.maxPasswordLength,
                            maxLengthMessage: localization.auth.tooLong.replace(
                              "{{max}}",
                              String(emailAndPassword.maxPasswordLength)
                            ),
                            minLength: emailAndPassword.minPasswordLength,
                            minLengthMessage:
                              localization.auth.tooShort.replace(
                                "{{min}}",
                                String(emailAndPassword.minPasswordLength)
                              ),
                            requiredMessage: localization.auth.fieldRequired
                          })
                      }}
                    >
                      {(field) => {
                        const isInvalid = isAuthFormFieldInvalid(
                          field.state.meta
                        )
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor="sso-password">
                              {localization.auth.password}
                            </FieldLabel>
                            <InputGroup>
                              <InputGroupInput
                                id="sso-password"
                                name={field.name}
                                type={isPasswordVisible ? "text" : "password"}
                                autoComplete={withPasskeyAutoFill(
                                  "current-password",
                                  passkeyAutoFill
                                )}
                                autoFocus
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(event) =>
                                  field.handleChange(event.target.value)
                                }
                                placeholder={
                                  localization.auth.passwordPlaceholder
                                }
                                minLength={emailAndPassword.minPasswordLength}
                                maxLength={emailAndPassword.maxPasswordLength}
                                required
                                disabled={isPending}
                                aria-invalid={isInvalid}
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
                            <field.AuthFormFieldError />
                          </Field>
                        )
                      }}
                    </form.AppField>

                    {emailAndPassword.rememberMe && (
                      <form.AppField name="rememberMe">
                        {(field) => (
                          <Field>
                            <div className="flex items-center gap-3">
                              <Checkbox
                                id="sso-remember-me"
                                name={field.name}
                                checked={field.state.value}
                                disabled={isPending}
                                onCheckedChange={(checked) =>
                                  field.handleChange(checked === true)
                                }
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
                      </form.AppField>
                    )}

                    {Captcha && (
                      <div className="flex justify-center">{Captcha}</div>
                    )}

                    <form.AuthFormServerError />

                    <form.AuthFormSubmitButton disabled={isPending}>
                      {isSigningIn && <Spinner data-icon="inline-start" />}
                      {localization.auth.signIn}
                    </form.AuthFormSubmitButton>
                  </FieldGroup>
                </form.AuthFormRoot>
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
                    <ProviderButtons
                      socialLayout={socialLayout}
                      view="signIn"
                    />
                  )}
                </>
              )}

              <Button variant="ghost" onClick={startOver}>
                {ssoLocalization.useDifferentEmail}
              </Button>
            </div>
          )}
        </form.AppForm>
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
