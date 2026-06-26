import { authMutationKeys } from "@better-auth-ui/core"
import type { UsernameAuthClient } from "@better-auth-ui/core/plugins/username"
import {
  useAuth,
  useAuthPlugin,
  useFetchOptions,
  useSignInEmail
} from "@better-auth-ui/react"
import { useSignInUsername } from "@better-auth-ui/react/plugins/username"
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
  Label,
  Link,
  Spinner,
  TextField
} from "@heroui/react"
import { useIsMutating } from "@tanstack/react-query"
import { type SyntheticEvent, useState } from "react"
import { usernamePlugin } from "../../../lib/auth/username-plugin"
import { FieldSeparator } from "../field-separator"
import { ProviderButtons, type SocialLayout } from "../provider-buttons"

export interface SignInUsernameProps {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
  variant?: CardProps["variant"]
}

/**
 * Render the username-based sign-in UI.
 *
 * @returns The sign-in JSX element containing username/password fields, optional magic-link button, and social provider buttons.
 */
export function SignInUsername({
  className,
  socialLayout,
  socialPosition = "bottom",
  variant
}: SignInUsernameProps) {
  const {
    authClient,
    basePaths,
    emailAndPassword,
    localization,
    plugins,
    redirectTo,
    socialProviders,
    viewPaths,
    navigate
  } = useAuth()

  const { fetchOptions, resetFetchOptions } = useFetchOptions()

  const { localization: usernameLocalization } = useAuthPlugin(usernamePlugin)

  const [password, setPassword] = useState("")

  function isEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  const { mutate: signInEmail, isPending: isSignInEmailPending } =
    useSignInEmail(authClient, {
      onError: (error, { email }) => {
        setPassword("")

        if (error.error?.code === "EMAIL_NOT_VERIFIED") {
          sessionStorage.setItem("better-auth-ui.verify-email", email)
          navigate({
            to: `${basePaths.auth}/${viewPaths.auth.verifyEmail}`
          })
        }

        resetFetchOptions()
      },
      onSuccess: () => {
        sessionStorage.removeItem("better-auth-ui.verify-email")
        navigate({ to: redirectTo })
      }
    })

  const { mutate: signInUsername, isPending: isSignInUsernamePending } =
    useSignInUsername(authClient as UsernameAuthClient, {
      onError: (error) => {
        setPassword("")

        if (error.error?.code === "EMAIL_NOT_VERIFIED") {
          sessionStorage.removeItem("better-auth-ui.verify-email")

          navigate({
            to: `${basePaths.auth}/${viewPaths.auth.verifyEmail}`
          })
        }

        resetFetchOptions()
      },
      onSuccess: () => {
        sessionStorage.removeItem("better-auth-ui.verify-email")
        navigate({ to: redirectTo })
      }
    })

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const rememberMe = formData.get("rememberMe") === "on"

    if (isEmail(email)) {
      signInEmail({
        email,
        password,
        ...(emailAndPassword?.rememberMe ? { rememberMe } : {}),
        fetchOptions
      })
    } else {
      signInUsername({
        username: email,
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

  const Captcha = plugins.find(
    (plugin) => plugin.captchaComponent
  )?.captchaComponent

  const showSeparator = emailAndPassword?.enabled && !!socialProviders?.length

  return (
    <Card
      className={cn("w-full max-w-sm gap-4 md:p-6", className)}
      variant={variant}
    >
      <Card.Header>
        <Card.Title className="text-xl font-semibold mb-1">
          {localization.auth.signIn}
        </Card.Title>
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
          <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextField
              name="email"
              type="text"
              autoComplete="username email"
              isDisabled={isPending}
              validate={(value) => {
                if (!value) return localization.auth.fieldRequired
              }}
            >
              <Label>{usernameLocalization.username}</Label>

              <Input
                placeholder={usernameLocalization.usernameOrEmailPlaceholder}
                variant={variant === "transparent" ? "primary" : "secondary"}
                required
              />

              <FieldError />
            </TextField>

            <TextField
              minLength={emailAndPassword?.minPasswordLength}
              maxLength={emailAndPassword?.maxPasswordLength}
              name="password"
              type="password"
              autoComplete="current-password"
              isDisabled={isPending}
              value={password}
              onChange={setPassword}
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
                variant={variant === "transparent" ? "primary" : "secondary"}
                required
              />

              <FieldError />
            </TextField>

            {emailAndPassword?.rememberMe && (
              <Checkbox
                name="rememberMe"
                isDisabled={isPending}
                variant={variant === "transparent" ? "primary" : "secondary"}
              >
                <Checkbox.Content>
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>

                  {localization.auth.rememberMe}
                </Checkbox.Content>
              </Checkbox>
            )}

            {Captcha && <div className="flex justify-center">{Captcha}</div>}

            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full"
                isPending={isSignInPending || isPending}
              >
                {isSignInPending && <Spinner color="current" size="sm" />}

                {localization.auth.signIn}
              </Button>

              {plugins.flatMap((plugin) =>
                plugin.authButtons?.map((AuthButton, index) => (
                  <AuthButton
                    key={`${plugin.id}-${index.toString()}`}
                    view="signIn"
                  />
                ))
              )}
            </div>
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
