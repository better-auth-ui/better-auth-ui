import { useAuth, useSignInEmail, useSignInSocial } from "@better-auth-ui/react"
import {
  Button,
  Card,
  type CardProps,
  Checkbox,
  Description,
  FieldError,
  Fieldset,
  Form,
  Input,
  Label,
  Link,
  Spinner,
  TextField
} from "@heroui/react"

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
    emailAndPassword,
    localization,
    magicLink,
    socialProviders,
    viewPaths
  } = useAuth()
  const [{ email, password }, signInEmail, signInPending] = useSignInEmail()
  const [_, signInSocial, socialPending] = useSignInSocial()

  const isPending = signInPending || socialPending

  const showSeparator =
    emailAndPassword?.enabled && socialProviders && socialProviders.length > 0

  return (
    <Card
      className={cn("w-full max-w-sm p-4 md:p-6", className)}
      variant={variant}
      {...props}
    >
      <Card.Header className="text-xl mb-2 font-medium">
        {localization.auth.signIn}
      </Card.Header>

      <Card.Content>
        <Fieldset className="gap-4">
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
            <Form action={signInEmail} className="flex flex-col gap-4">
              <Fieldset.Group>
                <TextField
                  defaultValue={email}
                  name="email"
                  type="email"
                  autoComplete="email"
                  isDisabled={isPending}
                >
                  <Label>{localization.auth.email}</Label>

                  <Input
                    placeholder={localization.auth.emailPlaceholder}
                    variant={
                      variant === "transparent" ? "primary" : "secondary"
                    }
                    required
                  />

                  <FieldError className="text-wrap" />
                </TextField>

                <TextField
                  defaultValue={password}
                  minLength={emailAndPassword?.minPasswordLength}
                  maxLength={emailAndPassword?.maxPasswordLength}
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  isDisabled={isPending}
                >
                  <div className="flex justify-between">
                    <Label>{localization.auth.password}</Label>
                  </div>

                  <Input
                    placeholder={localization.auth.passwordPlaceholder}
                    variant={
                      variant === "transparent" ? "primary" : "secondary"
                    }
                    required
                  />

                  <FieldError className="text-wrap" />
                </TextField>
              </Fieldset.Group>

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

              <Fieldset.Actions className="flex-col gap-3">
                <Button type="submit" className="w-full" isPending={isPending}>
                  {isPending && <Spinner color="current" size="sm" />}

                  {localization.auth.signIn}
                </Button>

                {magicLink && (
                  <MagicLinkButton view="signIn" isPending={isPending} />
                )}
              </Fieldset.Actions>
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

          {emailAndPassword?.forgotPassword && (
            <Link
              href={`${basePaths.auth}/${viewPaths.auth.forgotPassword}`}
              className="no-underline hover:underline self-center"
            >
              {localization.auth.forgotPasswordLink}
            </Link>
          )}

          {emailAndPassword?.enabled && (
            <Description className="flex justify-center gap-1.5 text-foreground text-sm">
              {localization.auth.needToCreateAnAccount}

              <Link
                href={`${basePaths.auth}/${viewPaths.auth.signUp}`}
                className="text-accent no-underline hover:underline decoration-accent-hover"
              >
                {localization.auth.signUp}
              </Link>
            </Description>
          )}
        </Fieldset>
      </Card.Content>
    </Card>
  )
}
