import { getAuthButtonKey } from "@better-auth-ui/react"
import { LastUsedBadge } from "./last-login-method/last-used-badge"
import { useSignInContinuation } from "../../lib/auth/use-sign-in-continuation"
import { AuthPrompts } from "@better-auth-ui/react"
import {
  authMutationKeys,
  getAuthErrorCode,
  validateEmailAddress
} from "@better-auth-ui/core"
import { useAuth, useFetchOptions, useSignInEmail } from "@better-auth-ui/react"
import { useIsMutating } from "@tanstack/react-query"
import { cn } from "../../lib/cn"
import { setPendingEmail } from "../../lib/pending-email"
import { useAuthNavigation } from "../../navigation/navigation-context"
import { Card, type CardVariant } from "../../primitives/card"
import { Checkbox } from "../../primitives/checkbox"
import { Description } from "../../primitives/description"
import { useAuthForm } from "./auth-form"
import { Link } from "../../primitives/link"
import { Box } from "../../primitives/styled"
import { FieldSeparator } from "./field-separator"
import { ProviderButtons, type SocialLayout } from "./provider-buttons"

export interface SignInProps {
  initialEmail?: string
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
  variant?: CardVariant
}

/** Email sign-in with shared form validation and native navigation. */
export function SignIn({
  initialEmail = "",
  className,
  socialLayout,
  socialPosition = "bottom",
  variant
}: SignInProps) {
  const {
    authClient,
    emailAndPassword,
    localization,
    plugins,
    socialProviders
  } = useAuth()

  const onSignInSuccess = useSignInContinuation()
  const captcha = plugins.find(
    (plugin) => plugin.captchaComponent
  )?.captchaComponent

  const navigation = useAuthNavigation()
  const { fetchOptions, resetFetchOptions } = useFetchOptions()

  const { mutateAsync: signInEmail } = useSignInEmail(authClient, {
    meta: { errorPresentation: "inline" },
    onError: () => resetFetchOptions(),
    onSuccess: onSignInSuccess
  })

  const form = useAuthForm({
    defaultValues: { email: initialEmail, password: "", rememberMe: false },
    onSubmit: async ({ value }) => {
      const email = value.email.trim()
      try {
        await signInEmail({
          email,
          password: value.password,
          ...(emailAndPassword?.rememberMe
            ? { rememberMe: value.rememberMe }
            : {}),
          fetchOptions
        })
      } catch (error) {
        if (getAuthErrorCode(error) !== "EMAIL_NOT_VERIFIED") throw error
        setPendingEmail(email)
        navigation.push("verifyEmail")
      }
    }
  })

  const signInMutating = useIsMutating({
    mutationKey: authMutationKeys.signIn.all
  })
  const signUpMutating = useIsMutating({
    mutationKey: authMutationKeys.signUp.all
  })
  const isPending = signInMutating + signUpMutating > 0

  const showSeparator = emailAndPassword?.enabled && !!socialProviders?.length
  const inputVariant = variant === "transparent" ? "primary" : "secondary"

  return (
    <Card className={cn("w-full max-w-sm gap-4", className)} variant={variant}>
      <AuthPrompts view="signIn" />
      <Card.Header>
        <Card.Title className="mb-1">{localization.auth.signIn}</Card.Title>
      </Card.Header>

      <Card.Content className="gap-4">
        {socialPosition === "top" && (
          <>
            {!!socialProviders?.length && (
              <ProviderButtons socialLayout={socialLayout} />
            )}
            {showSeparator && (
              <FieldSeparator>{localization.auth.or}</FieldSeparator>
            )}
          </>
        )}

        {emailAndPassword?.enabled && (
          <form.AppForm>
            <form.AuthFormRoot
              serverErrorMessage={localization.errors.generic}
              className="gap-4"
            >
              <form.AppField
                name="email"
                validators={{
                  onChange: ({ value }) =>
                    validateEmailAddress(value, {
                      invalidMessage: localization.auth.invalidEmail,
                      requiredMessage: localization.auth.fieldRequired
                    })?.message
                }}
              >
                {(field) => (
                  <field.AuthFormTextField
                    type="email"
                    autoComplete="email"
                    isDisabled={isPending}
                    label={localization.auth.email}
                    inputProps={{
                      placeholder: localization.auth.emailPlaceholder,
                      variant: inputVariant,
                      required: true
                    }}
                  />
                )}
              </form.AppField>

              <form.AppField
                name="password"
                validators={{
                  onChange: ({ value }) => {
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
                  }
                }}
              >
                {(field) => (
                  <field.AuthFormTextField
                    type="password"
                    autoComplete="current-password"
                    isDisabled={isPending}
                    label={localization.auth.password}
                    inputProps={{
                      placeholder: localization.auth.passwordPlaceholder,
                      variant: inputVariant,
                      required: true
                    }}
                  />
                )}
              </form.AppField>

              {emailAndPassword?.rememberMe && (
                <form.Field name="rememberMe">
                  {(field) => (
                    <Checkbox
                      isSelected={field.state.value}
                      onChange={field.handleChange}
                      isDisabled={isPending}
                    >
                      {localization.auth.rememberMe}
                    </Checkbox>
                  )}
                </form.Field>
              )}

              {captcha}

              <Box className="gap-3">
                <form.AuthFormSubmitButton
                  variant="primary"
                  className="w-full"
                  isPending={isPending}
                >
                  {localization.auth.signIn}
                  <LastUsedBadge method="email" />
                </form.AuthFormSubmitButton>

                {plugins.flatMap((plugin) =>
                  (plugin.authButtons ?? []).map((AuthButton) => (
                    <AuthButton
                      key={getAuthButtonKey(plugin.id, AuthButton)}
                      view="signIn"
                    />
                  ))
                )}
              </Box>
            </form.AuthFormRoot>
          </form.AppForm>
        )}

        {socialPosition === "bottom" && (
          <>
            {showSeparator && (
              <FieldSeparator>{localization.auth.or}</FieldSeparator>
            )}
            {!!socialProviders?.length && (
              <ProviderButtons socialLayout={socialLayout} />
            )}
          </>
        )}
      </Card.Content>

      <Card.Footer className="flex-col gap-3">
        {emailAndPassword?.enabled && emailAndPassword?.forgotPassword && (
          <Link view="forgotPassword" className="text-sm">
            {localization.auth.forgotPasswordLink}
          </Link>
        )}

        {emailAndPassword?.enabled && (
          <Description className="text-sm">
            {localization.auth.needToCreateAnAccount}{" "}
            <Link view="signUp">{localization.auth.signUp}</Link>
          </Description>
        )}
      </Card.Footer>
    </Card>
  )
}
