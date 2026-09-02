import { authMutationKeys } from "@better-auth-ui/core"
import {
  isPasskeyAutoFillEnabled,
  withPasskeyAutoFill
} from "@better-auth-ui/core/plugins/passkey"
import {
  AuthPrompts,
  useAuth,
  useFetchOptions,
  useSignInEmail
} from "@better-auth-ui/react"
import { Eye, EyeSlash } from "@gravity-ui/icons"
import {
  Button,
  Card,
  type CardProps,
  Checkbox,
  cn,
  Description,
  FieldError,
  Input,
  InputGroup,
  Label,
  Link,
  Spinner,
  TextField
} from "@heroui/react"
import { useIsMutating } from "@tanstack/react-query"
import { useState } from "react"

import { useSignInContinuation } from "../../lib/auth/use-sign-in-continuation"
import { useAuthForm } from "./auth-form"
import { FieldSeparator } from "./field-separator"
import { LastUsedBadge } from "./last-login-method/last-used-badge"
import { ProviderButtons, type SocialLayout } from "./provider-buttons"

export interface SignInProps {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
  variant?: CardProps["variant"]
}

/**
 * Render the sign-in UI using auth context for configuration and localization.
 *
 * @returns The sign-in JSX element containing email/password fields, optional magic-link button, and social provider buttons.
 */
export function SignIn({
  className,
  socialLayout,
  socialPosition = "bottom",
  variant
}: SignInProps) {
  const {
    authClient,
    basePaths,
    emailAndPassword,
    localization,
    plugins,
    socialProviders,
    viewPaths,
    navigate
  } = useAuth()

  const { fetchOptions, resetFetchOptions } = useFetchOptions()
  const continueSignIn = useSignInContinuation()

  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const { mutate: signInEmail, isPending: signInEmailPending } = useSignInEmail(
    authClient,
    {
      onError: (error, { email }) => {
        form.setFieldValue("password", "")

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

  const form = useAuthForm({
    defaultValues: { email: "", password: "", rememberMe: false },
    onSubmit: ({ value }) =>
      signInEmail({
        email: value.email,
        password: value.password,
        ...(emailAndPassword?.rememberMe
          ? { rememberMe: value.rememberMe }
          : {}),
        fetchOptions
      })
  })

  const signInMutating = useIsMutating({
    mutationKey: authMutationKeys.signIn.all
  })
  const signUpMutating = useIsMutating({
    mutationKey: authMutationKeys.signUp.all
  })
  const isPending = signInMutating + signUpMutating > 0

  const Captcha = plugins.find(
    (plugin) => plugin.captchaComponent
  )?.captchaComponent

  const passkeyAutoFill = isPasskeyAutoFillEnabled(plugins)

  const showSeparator = emailAndPassword?.enabled && !!socialProviders?.length

  return (
    <Card
      className={cn("w-full max-w-sm gap-4 md:p-6", className)}
      variant={variant}
    >
      <AuthPrompts view="signIn" />
      <Card.Header>
        <Card.Title className="text-xl font-semibold mb-1">
          {localization.auth.signIn}
        </Card.Title>
      </Card.Header>

      <Card.Content className="gap-4">
        {socialPosition === "top" && (
          <>
            {!!socialProviders?.length && (
              <ProviderButtons socialLayout={socialLayout} view="signIn" />
            )}

            {showSeparator && (
              <FieldSeparator>{localization.auth.or}</FieldSeparator>
            )}
          </>
        )}

        {emailAndPassword?.enabled && (
          <form.AppForm>
            <form.AuthFormRoot className="flex flex-col gap-4">
              <form.AppField name="email">
                {(field) => (
                  <TextField
                    name={field.name}
                    type="email"
                    autoComplete={withPasskeyAutoFill("email", passkeyAutoFill)}
                    isDisabled={isPending}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                    validate={(value) => {
                      if (!value) return localization.auth.fieldRequired
                      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                        return localization.auth.invalidEmail
                    }}
                  >
                    <Label>{localization.auth.email}</Label>

                    <Input
                      placeholder={localization.auth.emailPlaceholder}
                      variant={
                        variant === "transparent" ? "primary" : "secondary"
                      }
                      required
                    />

                    <FieldError />
                  </TextField>
                )}
              </form.AppField>

              <form.AppField name="password">
                {(field) => (
                  <TextField
                    minLength={emailAndPassword?.minPasswordLength}
                    maxLength={emailAndPassword?.maxPasswordLength}
                    name={field.name}
                    autoComplete={withPasskeyAutoFill(
                      "current-password",
                      passkeyAutoFill
                    )}
                    isDisabled={isPending}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                    validate={(value) => {
                      if (!value) return localization.auth.fieldRequired
                      const min = emailAndPassword?.minPasswordLength
                      const max = emailAndPassword?.maxPasswordLength
                      if (min && value.length < min)
                        return localization.auth.tooShort.replace(
                          "{{min}}",
                          String(min)
                        )
                      if (max && value.length > max)
                        return localization.auth.tooLong.replace(
                          "{{max}}",
                          String(max)
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
                            setIsPasswordVisible(!isPasswordVisible)
                          }
                          isDisabled={isPending}
                        >
                          {isPasswordVisible ? <EyeSlash /> : <Eye />}
                        </Button>
                      </InputGroup.Suffix>
                    </InputGroup>

                    <FieldError />
                  </TextField>
                )}
              </form.AppField>

              {emailAndPassword?.rememberMe && (
                <form.AppField name="rememberMe">
                  {(field) => (
                    <Checkbox
                      name={field.name}
                      isDisabled={isPending}
                      isSelected={field.state.value}
                      onChange={field.handleChange}
                      variant={
                        variant === "transparent" ? "primary" : "secondary"
                      }
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

              {Captcha && <div className="flex justify-center">{Captcha}</div>}

              <div className="flex flex-col gap-3">
                <form.AuthFormSubmitButton
                  className="relative w-full overflow-visible"
                  isDisabled={isPending}
                >
                  {signInEmailPending && <Spinner color="current" size="sm" />}

                  {localization.auth.signIn}

                  <LastUsedBadge method="email" floating />
                </form.AuthFormSubmitButton>

                {plugins.flatMap((plugin) =>
                  plugin.authButtons?.map((AuthButton, index) => (
                    <AuthButton
                      key={`${plugin.id}-${index.toString()}`}
                      view="signIn"
                    />
                  ))
                )}
              </div>
            </form.AuthFormRoot>
          </form.AppForm>
        )}

        {socialPosition === "bottom" && (
          <>
            {showSeparator && (
              <FieldSeparator>{localization.auth.or}</FieldSeparator>
            )}

            {!!socialProviders?.length && (
              <ProviderButtons socialLayout={socialLayout} view="signIn" />
            )}
          </>
        )}
      </Card.Content>

      <Card.Footer className="flex-col gap-3">
        {emailAndPassword?.enabled && emailAndPassword?.forgotPassword && (
          <Link
            href={`${basePaths.auth}/${viewPaths.auth.forgotPassword}`}
            className="text-sm no-underline hover:underline"
          >
            {localization.auth.forgotPasswordLink}
          </Link>
        )}

        {emailAndPassword?.enabled && (
          <Description className="text-sm">
            {localization.auth.needToCreateAnAccount}{" "}
            <Link
              href={`${basePaths.auth}/${viewPaths.auth.signUp}`}
              className="text-accent no-underline hover:underline decoration-accent-hover"
            >
              {localization.auth.signUp}
            </Link>
          </Description>
        )}
      </Card.Footer>
    </Card>
  )
}
