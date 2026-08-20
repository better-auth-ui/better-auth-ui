import { authMutationKeys } from "@better-auth-ui/core"
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
  FieldError,
  Form,
  Input,
  InputGroup,
  Label,
  Link,
  Spinner,
  TextField
} from "@heroui/react"
import { useIsMutating } from "@tanstack/react-query"
import { type SyntheticEvent, useState } from "react"

import { ssoPlugin } from "../../../lib/auth/sso-plugin"
import { useSignInContinuation } from "../../../lib/auth/use-sign-in-continuation"
import { FieldSeparator } from "../field-separator"
import { ProviderButtons, type SocialLayout } from "../provider-buttons"

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
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [discoveryError, setDiscoveryError] = useState("")

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
    <Card
      className={cn("w-full max-w-sm gap-4 md:p-6", className)}
      variant={variant}
    >
      <AuthPrompts view="signIn" />
      <Card.Header>
        <Card.Title className="mb-1 text-xl font-semibold">
          {localization.auth.signIn}
        </Card.Title>
        <Card.Description>
          {step === "email" ? ssoLocalization.emailFirstDescription : email}
        </Card.Description>
      </Card.Header>

      <Card.Content className="gap-4">
        {step === "email" ? (
          <Form className="flex flex-col gap-4" onSubmit={submitEmail}>
            <TextField
              name="email"
              type="email"
              autoComplete={withPasskeyAutoFill("email", passkeyAutoFill)}
              isDisabled={isPending}
              value={email}
              onChange={setEmail}
              validate={(value) => {
                if (!value) return localization.auth.fieldRequired
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                  return localization.auth.invalidEmail
              }}
            >
              <Label>{localization.auth.email}</Label>
              <Input
                autoFocus
                placeholder={localization.auth.emailPlaceholder}
                required
                variant={variant === "transparent" ? "primary" : "secondary"}
              />
              <FieldError />
            </TextField>

            {discoveryError && (
              <Description role="alert" className="text-danger">
                {discoveryError}
              </Description>
            )}

            <Button type="submit" className="w-full" isPending={isDiscovering}>
              {isDiscovering && <Spinner color="current" size="sm" />}
              {ssoLocalization.continueWithEmail}
            </Button>
          </Form>
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
              <Description role="status">{discoveryError}</Description>
            )}

            {emailAndPassword.enabled && (
              <Form className="flex flex-col gap-4" onSubmit={submitPassword}>
                <TextField
                  minLength={emailAndPassword.minPasswordLength}
                  maxLength={emailAndPassword.maxPasswordLength}
                  name="password"
                  autoComplete={withPasskeyAutoFill(
                    "current-password",
                    passkeyAutoFill
                  )}
                  isDisabled={isPending}
                  value={password}
                  onChange={setPassword}
                  validate={(value) => {
                    if (!value) return localization.auth.fieldRequired
                    if (value.length < emailAndPassword.minPasswordLength)
                      return localization.auth.tooShort.replace(
                        "{{min}}",
                        String(emailAndPassword.minPasswordLength)
                      )
                    if (value.length > emailAndPassword.maxPasswordLength)
                      return localization.auth.tooLong.replace(
                        "{{max}}",
                        String(emailAndPassword.maxPasswordLength)
                      )
                  }}
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
                        onPress={() =>
                          setIsPasswordVisible((visible) => !visible)
                        }
                      >
                        {isPasswordVisible ? <EyeSlash /> : <Eye />}
                      </Button>
                    </InputGroup.Suffix>
                  </InputGroup>
                  <FieldError />
                </TextField>

                {emailAndPassword.rememberMe && (
                  <Checkbox name="rememberMe" isDisabled={isPending}>
                    <Checkbox.Content>
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      {localization.auth.rememberMe}
                    </Checkbox.Content>
                  </Checkbox>
                )}

                {Captcha && (
                  <div className="flex justify-center">{Captcha}</div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  isPending={isSigningIn}
                >
                  {isSigningIn && <Spinner color="current" size="sm" />}
                  {localization.auth.signIn}
                </Button>
              </Form>
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
                  <ProviderButtons socialLayout={socialLayout} view="signIn" />
                )}
              </>
            )}

            <Button variant="ghost" className="w-full" onPress={startOver}>
              {ssoLocalization.useDifferentEmail}
            </Button>
          </div>
        )}
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
