import {
  authMutationKeys,
  validateEmailAddress,
  validateStringLength
} from "@better-auth-ui/core"
import {
  isPasskeyAutoFillEnabled,
  type PasskeyAuthClient,
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
import { usePasskeyAutoFill } from "@better-auth-ui/react/plugins/passkey"
import { useSignInSso } from "@better-auth-ui/react/plugins/sso"
import { Eye, EyeSlash } from "@gravity-ui/icons"
import {
  Button,
  Card,
  type CardProps,
  Checkbox,
  cn,
  Description,
  Input,
  InputGroup,
  Label,
  Link,
  TextField
} from "@heroui/react"
import { useSelector } from "@tanstack/react-form"
import { useIsMutating } from "@tanstack/react-query"
import { useState } from "react"

import { ssoPlugin } from "../../../lib/auth/sso-plugin"
import { useSignInContinuation } from "../../../lib/auth/use-sign-in-continuation"
import {
  clearAuthFormServerError,
  isAuthFormFieldInvalid,
  useAuthForm
} from "../auth-form"
import { FieldSeparator } from "../field-separator"
import { ProviderButtons, type SocialLayout } from "../provider-buttons"
import { ReauthenticationNotice } from "../reauthentication"

export type EmailFirstSignInProps = {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
  variant?: CardProps["variant"]
}

type Step = "email" | "fallback"

/** Discover organization SSO by email, then expose configured fallback methods. */
export function EmailFirstSignIn({
  className,
  socialLayout,
  socialPosition = "bottom",
  variant
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
    viewPaths
  } = useAuth()
  const { localization: ssoLocalization } = useAuthPlugin(ssoPlugin)
  const { fetchOptions, resetFetchOptions } = useFetchOptions()
  const continueSignIn = useSignInContinuation()

  usePasskeyAutoFill(authClient as PasskeyAuthClient, {
    onSuccess: () => navigate({ to: redirectTo })
  })

  const [step, setStep] = useState<Step>("email")
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
    clearAuthFormServerError(form)
    setDiscoveryError("")
  }

  return (
    <Card
      className={cn("w-full max-w-sm gap-4 md:p-6", className)}
      variant={variant}
    >
      <AuthPrompts view="signIn" />
      <ReauthenticationNotice />
      <Card.Header>
        <Card.Title className="mb-1 text-xl font-semibold">
          {localization.auth.signIn}
        </Card.Title>
        <Card.Description>
          {step === "email" ? ssoLocalization.emailFirstDescription : email}
        </Card.Description>
      </Card.Header>

      <Card.Content className="gap-4">
        <form.AppForm>
          {step === "email" ? (
            <form.AuthFormRoot className="flex flex-col gap-4">
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
                {(field) => (
                  <TextField
                    isInvalid={isAuthFormFieldInvalid(field.state.meta)}
                    name={field.name}
                    type="email"
                    autoComplete={withPasskeyAutoFill("email", passkeyAutoFill)}
                    isDisabled={isPending}
                    validationBehavior="aria"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                  >
                    <Label>{localization.auth.email}</Label>
                    <Input
                      autoFocus
                      placeholder={localization.auth.emailPlaceholder}
                      variant={
                        variant === "transparent" ? "primary" : "secondary"
                      }
                    />
                    <field.AuthFormFieldError />
                  </TextField>
                )}
              </form.AppField>

              {discoveryError && (
                <Description role="alert" className="text-danger">
                  {discoveryError}
                </Description>
              )}

              <form.AuthFormServerError />
              <form.AuthFormSubmitButton
                isPending={isDiscovering}
                className="w-full"
                isDisabled={isPending}
              >
                {ssoLocalization.continueWithEmail}
              </form.AuthFormSubmitButton>
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
                <Description role="status">{discoveryError}</Description>
              )}

              {emailAndPassword.enabled && (
                <form.AuthFormRoot className="flex flex-col gap-4">
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
                          minLengthMessage: localization.auth.tooShort.replace(
                            "{{min}}",
                            String(emailAndPassword.minPasswordLength)
                          ),
                          requiredMessage: localization.auth.fieldRequired
                        })
                    }}
                  >
                    {(field) => (
                      <TextField
                        isInvalid={isAuthFormFieldInvalid(field.state.meta)}
                        name={field.name}
                        autoComplete={withPasskeyAutoFill(
                          "current-password",
                          passkeyAutoFill
                        )}
                        isDisabled={isPending}
                        validationBehavior="aria"
                        value={field.state.value}
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
                            autoFocus
                            placeholder={localization.auth.passwordPlaceholder}
                            type={isPasswordVisible ? "text" : "password"}
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
                              onPress={() =>
                                setIsPasswordVisible((visible) => !visible)
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

                  {emailAndPassword.rememberMe && (
                    <form.AppField name="rememberMe">
                      {(field) => (
                        <Checkbox
                          name={field.name}
                          isDisabled={isPending}
                          isSelected={field.state.value}
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

                  {Captcha && (
                    <div className="flex justify-center">{Captcha}</div>
                  )}

                  <form.AuthFormServerError />
                  <form.AuthFormSubmitButton
                    isPending={isSigningIn}
                    className="w-full"
                    isDisabled={isPending}
                  >
                    {localization.auth.signIn}
                  </form.AuthFormSubmitButton>
                </form.AuthFormRoot>
              )}

              {plugins.flatMap((plugin) =>
                (plugin.authButtons ?? []).map((AuthButton) => (
                  <AuthButton
                    autoFill={false}
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

              <Button variant="ghost" className="w-full" onPress={startOver}>
                {ssoLocalization.useDifferentEmail}
              </Button>
            </div>
          )}
        </form.AppForm>
      </Card.Content>

      {emailAndPassword.enabled && (
        <Card.Footer className="flex-col gap-3">
          {step === "fallback" && emailAndPassword.forgotPassword && (
            <Link
              href={`${basePaths.auth}/${viewPaths.auth.forgotPassword}`}
              className="text-sm no-underline hover:underline"
            >
              {localization.auth.forgotPasswordLink}
            </Link>
          )}
          <Description className="text-sm">
            {localization.auth.needToCreateAnAccount}{" "}
            <Link
              href={`${basePaths.auth}/${viewPaths.auth.signUp}`}
              className="text-accent no-underline decoration-accent-hover hover:underline"
            >
              {localization.auth.signUp}
            </Link>
          </Description>
        </Card.Footer>
      )}
    </Card>
  )
}
