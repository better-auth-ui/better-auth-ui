import {
  type AnyAuthConfig,
  useSignInEmail,
  useSignInSocial
} from "@better-auth-ui/react"
import {
  Button,
  Card,
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

import { useAuth } from "../../hooks/use-auth"
import { cn } from "../../lib/utils"
import { FieldSeparator } from "./field-separator"
import { MagicLinkButton } from "./magic-link-button"
import { ProviderButtons, type SocialLayout } from "./provider-buttons"

export type SignInProps = AnyAuthConfig & {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
}

/**
 * Renders the sign-in form with email/password, optional magic link, and social provider buttons, honoring configuration and localization from the provided auth config.
 *
 * @returns The JSX element for the sign-in UI.
 */
export function SignIn({
  className,
  socialLayout,
  socialPosition = "bottom",
  ...config
}: SignInProps) {
  const context = useAuth(config)

  const {
    basePaths,
    emailAndPassword,
    localization,
    magicLink,
    socialProviders,
    viewPaths
  } = context

  const [{ email, password }, signInEmail, signInPending] =
    useSignInEmail(context)

  const [_, signInSocial, socialPending] = useSignInSocial(context)

  const isPending = signInPending || socialPending

  const showSeparator =
    emailAndPassword?.enabled && socialProviders && socialProviders.length > 0

  return (
    <Card className={cn("w-full max-w-sm p-4 md:p-6", className)}>
      <Card.Content>
        <Fieldset className="gap-4">
          <Fieldset.Legend className="text-xl">
            {localization.auth.signIn}
          </Fieldset.Legend>

          <Description />

          {socialPosition === "top" && (
            <>
              {socialProviders && socialProviders.length > 0 && (
                <ProviderButtons
                  {...config}
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
                    required
                    disabled={isPending}
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
                >
                  <div className="flex justify-between">
                    <Label>{localization.auth.password}</Label>

                    {!emailAndPassword?.rememberMe &&
                      emailAndPassword?.forgotPassword && (
                        <Link
                          href={`${basePaths.auth}/${viewPaths.auth.forgotPassword}`}
                          className="text-muted rounded"
                        >
                          {localization.auth.forgotPasswordLink}
                        </Link>
                      )}
                  </div>

                  <Input
                    placeholder={localization.auth.passwordPlaceholder}
                    required
                  />

                  <FieldError className="text-wrap" />
                </TextField>
              </Fieldset.Group>

              {emailAndPassword?.rememberMe && (
                <div className="flex justify-between mt-1">
                  <Checkbox name="rememberMe" isDisabled={isPending}>
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>

                    <Checkbox.Content>
                      <Label>{localization.auth.rememberMe}</Label>
                    </Checkbox.Content>
                  </Checkbox>

                  {emailAndPassword?.forgotPassword && (
                    <Link
                      href={`${basePaths.auth}/${viewPaths.auth.forgotPassword}`}
                      className="text-muted rounded"
                    >
                      {localization.auth.forgotPasswordLink}
                    </Link>
                  )}
                </div>
              )}

              <Fieldset.Actions className="flex-col gap-3">
                <Button type="submit" className="w-full" isPending={isPending}>
                  {isPending && <Spinner color="current" size="sm" />}

                  {localization.auth.signIn}
                </Button>

                {magicLink && (
                  <MagicLinkButton
                    {...config}
                    view="signIn"
                    isPending={isPending}
                  />
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
                  {...config}
                  socialLayout={socialLayout}
                  signInSocial={signInSocial}
                  isPending={isPending}
                />
              )}
            </>
          )}

          {emailAndPassword?.enabled && (
            <Description className="flex justify-center gap-1.5 text-foreground text-sm">
              {localization.auth.needToCreateAnAccount}

              <Link
                href={`${basePaths.auth}/${viewPaths.auth.signUp}`}
                className="text-accent rounded"
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
