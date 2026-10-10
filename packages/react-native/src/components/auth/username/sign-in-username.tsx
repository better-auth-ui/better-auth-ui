import { authMutationKeys } from "@better-auth-ui/core"
import type { UsernameAuthClient } from "@better-auth-ui/core/plugins/username"
import {
  useAuth,
  useAuthPlugin,
  useFetchOptions,
  useSignInEmail
} from "@better-auth-ui/react"
import { useSignInUsername } from "@better-auth-ui/react/plugins/username"
import { useIsMutating } from "@tanstack/react-query"
import { useState } from "react"
import { usernamePlugin } from "../../../lib/auth/username-plugin"
import { cn } from "../../../lib/cn"
import { setPendingEmail } from "../../../lib/pending-email"
import { useAuthNavigation } from "../../../navigation/navigation-context"
import { Button } from "../../../primitives/button"
import { Card, type CardVariant } from "../../../primitives/card"
import { Checkbox } from "../../../primitives/checkbox"
import { Description } from "../../../primitives/description"
import { FieldError, Label, TextField } from "../../../primitives/field"
import { Form } from "../../../primitives/form"
import { Input } from "../../../primitives/input"
import { Link } from "../../../primitives/link"
import { Box } from "../../../primitives/styled"
import { FieldSeparator } from "../field-separator"
import { ProviderButtons, type SocialLayout } from "../provider-buttons"

export interface SignInUsernameProps {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
  variant?: CardVariant
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

/**
 * Username-plugin sign-in screen: a single identifier field that accepts
 * either a username or an email, plus password/"remember me" and social
 * providers. Mirrors the heroui `SignInUsername`, adapted for React Native:
 * fields are controlled state (no `FormData`), the verify-email hand-off uses
 * the in-memory pending-email store (no `sessionStorage`), and navigation goes
 * through the adapter. Both the `signInEmail` and `signInUsername` mutations
 * share the same identifier field and are dispatched based on `isEmail`.
 */
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
    redirectTo,
    socialProviders,
    navigate
  } = useAuth()

  const { localization: usernameLocalization } = useAuthPlugin(usernamePlugin)

  const navigation = useAuthNavigation()
  const { fetchOptions, resetFetchOptions } = useFetchOptions()

  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  const { mutate: signInEmail, isPending: isSignInEmailPending } =
    useSignInEmail(authClient, {
      onError: (error, { email }) => {
        setPassword("")

        if (error.error?.code === "EMAIL_NOT_VERIFIED") {
          setPendingEmail(email)
          navigation.push("verifyEmail")
        }

        resetFetchOptions()
      },
      onSuccess: () => navigate({ to: redirectTo })
    })

  const { mutate: signInUsername, isPending: isSignInUsernamePending } =
    useSignInUsername(authClient as UsernameAuthClient, {
      onError: (error) => {
        setPassword("")

        if (error.error?.code === "EMAIL_NOT_VERIFIED") {
          navigation.push("verifyEmail")
        }

        resetFetchOptions()
      },
      onSuccess: () => navigate({ to: redirectTo })
    })

  const handleSubmit = () => {
    if (isEmail(identifier)) {
      signInEmail({
        email: identifier,
        password,
        ...(emailAndPassword?.rememberMe ? { rememberMe } : {}),
        fetchOptions
      })
    } else {
      signInUsername({
        username: identifier,
        password,
        ...(emailAndPassword?.rememberMe ? { rememberMe } : {}),
        fetchOptions
      })
    }
  }

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
          <Form onSubmit={handleSubmit} className="gap-4">
            <TextField
              name="email"
              type="text"
              autoComplete="username email"
              isDisabled={isPending}
              value={identifier}
              onChange={setIdentifier}
              validate={(value) => {
                if (!value) return localization.auth.fieldRequired
              }}
            >
              <Label>{usernameLocalization.username}</Label>
              <Input
                placeholder={usernameLocalization.usernameOrEmailPlaceholder}
                variant={inputVariant}
                required
              />
              <FieldError />
            </TextField>

            <TextField
              name="password"
              type="password"
              autoComplete="current-password"
              isDisabled={isPending}
              value={password}
              onChange={setPassword}
              minLength={emailAndPassword?.minPasswordLength}
              maxLength={emailAndPassword?.maxPasswordLength}
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
              <Input
                placeholder={localization.auth.passwordPlaceholder}
                variant={inputVariant}
                required
              />
              <FieldError />
            </TextField>

            {emailAndPassword?.rememberMe && (
              <Checkbox
                isSelected={rememberMe}
                onChange={setRememberMe}
                isDisabled={isPending}
              >
                {localization.auth.rememberMe}
              </Checkbox>
            )}

            {captcha}

            <Box className="gap-3">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isPending={isSignInPending || isPending}
              >
                {localization.auth.signIn}
              </Button>

              {plugins.flatMap((plugin) =>
                (plugin.authButtons ?? []).map((AuthButton, index) => (
                  <AuthButton
                    key={`${plugin.id}-${index.toString()}`}
                    view="signIn"
                  />
                ))
              )}
            </Box>
          </Form>
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
