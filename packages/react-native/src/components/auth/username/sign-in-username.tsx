import { LastUsedBadge } from "../last-login-method/last-used-badge"
import { useSignInContinuation } from "../../../lib/auth/use-sign-in-continuation"
import {
  authMutationKeys,
  getAuthErrorCode,
  validateEmailAddress,
  validateStringLength
} from "@better-auth-ui/core"
import type { UsernameAuthClient } from "@better-auth-ui/core/plugins/username"
import {
  getAuthButtonKey,
  useAuth,
  useAuthPlugin,
  useFetchOptions,
  useSignInEmail
} from "@better-auth-ui/react"
import { useSignInUsername } from "@better-auth-ui/react/plugins/username"
import { useIsMutating } from "@tanstack/react-query"
import { usernamePlugin } from "../../../lib/auth/username-plugin"
import { cn } from "../../../lib/cn"
import { clearPendingEmail, setPendingEmail } from "../../../lib/pending-email"
import { useAuthNavigation } from "../../../navigation/navigation-context"
import { Card, type CardVariant } from "../../../primitives/card"
import { Checkbox } from "../../../primitives/checkbox"
import { Description } from "../../../primitives/description"
import { useAuthForm } from "../auth-form"
import { Link } from "../../../primitives/link"
import { Box } from "../../../primitives/styled"
import { AuthPrompts } from "@better-auth-ui/react"
import { FieldSeparator } from "../field-separator"
import { ProviderButtons, type SocialLayout } from "../provider-buttons"

export interface SignInUsernameProps {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
  variant?: CardVariant
}

/** Sign in with a username or email through the shared native form. */
export function SignInUsername({
  className,
  socialLayout,
  socialPosition = "bottom",
  variant
}: SignInUsernameProps) {
  const {
    authClient,
    emailAndPassword,
    localization,
    plugins,
    socialProviders
  } = useAuth()

  const { localization: usernameLocalization } = useAuthPlugin(usernamePlugin)

  const navigation = useAuthNavigation()
  const { fetchOptions, resetFetchOptions } = useFetchOptions()

  const onSignInSuccess = useSignInContinuation()

  const { mutateAsync: signInEmail, isPending: isSignInEmailPending } =
    useSignInEmail(authClient, {
      meta: { errorPresentation: "inline" },
      onError: () => resetFetchOptions(),
      onSuccess: onSignInSuccess
    })

  const { mutateAsync: signInUsername, isPending: isSignInUsernamePending } =
    useSignInUsername(authClient as UsernameAuthClient, {
      meta: { errorPresentation: "inline" },
      onError: () => resetFetchOptions(),
      onSuccess: onSignInSuccess
    })

  const form = useAuthForm({
    defaultValues: { identifier: "", password: "", rememberMe: false },
    onSubmit: async ({ value }) => {
      const identifier = value.identifier.trim()
      try {
        const params = {
          password: value.password,
          ...(emailAndPassword?.rememberMe
            ? { rememberMe: value.rememberMe }
            : {}),
          fetchOptions
        }
        if (identifier.includes("@"))
          await signInEmail({ ...params, email: identifier })
        else await signInUsername({ ...params, username: identifier })
      } catch (error) {
        if (getAuthErrorCode(error) !== "EMAIL_NOT_VERIFIED") throw error
        if (identifier.includes("@")) setPendingEmail(identifier)
        else clearPendingEmail()
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
  const isSignInPending = isSignInEmailPending || isSignInUsernamePending

  const captcha = plugins.find(
    (plugin) => plugin.captchaComponent
  )?.captchaComponent

  const showSeparator = emailAndPassword?.enabled && !!socialProviders?.length
  const inputVariant = variant === "transparent" ? "primary" : "secondary"

  return (
    <Card className={cn("w-full max-w-sm gap-4", className)} variant={variant}>
      <Card.Header>
        <Card.Title className="mb-1">{localization.auth.signIn}</Card.Title>
      </Card.Header>

      <Card.Content className="gap-4">
        <AuthPrompts view="signIn" />
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
                name="identifier"
                validators={{
                  onChange: ({ value }) =>
                    (value.includes("@")
                      ? validateEmailAddress(value, {
                          invalidMessage: localization.auth.invalidEmail,
                          requiredMessage: localization.auth.fieldRequired
                        })
                      : validateStringLength(value, {
                          requiredMessage: localization.auth.fieldRequired,
                          trim: true
                        })
                    )?.message
                }}
              >
                {(field) => (
                  <field.AuthFormTextField
                    type="text"
                    autoComplete="username email"
                    isDisabled={isPending}
                    label={usernameLocalization.username}
                    inputProps={{
                      placeholder:
                        usernameLocalization.usernameOrEmailPlaceholder,
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
                    minLength={emailAndPassword?.minPasswordLength}
                    maxLength={emailAndPassword?.maxPasswordLength}
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
                  isPending={isSignInPending || isPending}
                >
                  {localization.auth.signIn}
                  <LastUsedBadge method={["username", "email"]} />
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
