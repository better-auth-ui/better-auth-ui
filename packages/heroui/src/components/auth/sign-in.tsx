import {
  useAuth,
  useSendVerificationEmail,
  useSignInEmail,
  useSignInSocial
} from "@better-auth-ui/react"
import {
  Button,
  Card,
  type CardProps,
  Checkbox,
  Description,
  FieldError,
  Form,
  Input,
  Label,
  Link,
  Spinner,
  TextField,
  toast
} from "@heroui/react"
import { useState } from "react"

import { cn } from "../../lib/utils"
import { FieldSeparator } from "./field-separator"
import { MagicLinkButton } from "./magic-link-button"
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
  variant,
  ...props
}: SignInProps & CardProps) {
  const {
    basePaths,
    baseURL,
    emailAndPassword,
    localization,
    magicLink,
    navigate,
    redirectTo,
    socialProviders,
    viewPaths
  } = useAuth()

  const [password, setPassword] = useState("")

  const { mutate: sendVerificationEmail } = useSendVerificationEmail({
    onError: (error) => toast.danger(error.error?.message || error.message),
    onSuccess: () => toast.success(localization.auth.verificationEmailSent)
  })

  const { mutate: signInEmail, isPending: signInPending } = useSignInEmail({
    onError: (error, { email }) => {
      setPassword("")

      if (error.error?.code === "EMAIL_NOT_VERIFIED") {
        toast.danger(error.error?.message || error.message, {
          actionProps: {
            children: localization.auth.resend,
            onClick: () =>
              sendVerificationEmail({
                email,
                callbackURL: `${baseURL}${redirectTo}`
              })
          }
        })
      } else {
        toast.danger(error.error?.message || error.message)
      }
    },
    onSuccess: () => navigate({ to: redirectTo })
  })

  const { mutate: signInSocial, isPending: socialPending } = useSignInSocial({
    onError: (error) => toast.danger(error.error?.message || error.message)
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const rememberMe = formData.get("rememberMe") === "on"

    signInEmail({
      email,
      password,
      ...(emailAndPassword?.rememberMe ? { rememberMe } : {})
    })
  }

  const isPending = signInPending || socialPending

  const showSeparator =
    emailAndPassword?.enabled && socialProviders && socialProviders.length > 0

  return (
    <Card
      className={cn("w-full max-w-sm p-4 md:p-6 gap-4", className)}
      variant={variant}
      {...props}
    >
      <Card.Header>
        <Card.Title className="text-xl">{localization.auth.signIn}</Card.Title>
      </Card.Header>

      <Card.Content className="gap-4">
        {socialPosition === "top" && (
          <>
            {socialProviders && socialProviders.length > 0 && (
              <ProviderButtons
                socialLayout={socialLayout}
                signInSocial={signInSocial}
                isPending={isPending}
              />
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
              type="email"
              autoComplete="email"
              isDisabled={isPending}
            >
              <Label>{localization.auth.email}</Label>

              <Input
                placeholder={localization.auth.emailPlaceholder}
                variant={variant === "transparent" ? "primary" : "secondary"}
                required
              />

              <FieldError className="text-wrap" />
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
            >
              <Label>{localization.auth.password}</Label>

              <Input
                placeholder={localization.auth.passwordPlaceholder}
                variant={variant === "transparent" ? "primary" : "secondary"}
                required
              />

              <FieldError className="text-wrap" />
            </TextField>

            {emailAndPassword?.rememberMe && (
              <Checkbox
                name="rememberMe"
                isDisabled={isPending}
                variant={variant === "transparent" ? "primary" : "secondary"}
              >
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>

                <Checkbox.Content>
                  <Label>{localization.auth.rememberMe}</Label>
                </Checkbox.Content>
              </Checkbox>
            )}

            <div className="flex flex-col gap-3">
              <Button type="submit" className="w-full" isPending={isPending}>
                {isPending && <Spinner color="current" size="sm" />}

                {localization.auth.signIn}
              </Button>

              {magicLink && (
                <MagicLinkButton view="signIn" isPending={isPending} />
              )}
            </div>
          </Form>
        )}

        {socialPosition === "bottom" && (
          <>
            {showSeparator && (
              <FieldSeparator>{localization.auth.or}</FieldSeparator>
            )}

            {socialProviders && socialProviders.length > 0 && (
              <ProviderButtons
                socialLayout={socialLayout}
                signInSocial={signInSocial}
                isPending={isPending}
              />
            )}
          </>
        )}
      </Card.Content>

      <Card.Footer className="flex-col gap-3">
        {emailAndPassword?.forgotPassword && (
          <Link
            href={`${basePaths.auth}/${viewPaths.auth.forgotPassword}`}
            className="no-underline hover:underline self-center"
          >
            {localization.auth.forgotPasswordLink}
          </Link>
        )}

        {emailAndPassword?.enabled && (
          <Description className="justify-center text-sm">
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
