import { useAuth, useSignInSocial, useSignUpEmail } from "@better-auth-ui/react"
import { Eye, EyeSlash } from "@gravity-ui/icons"
import {
  Button,
  Card,
  type CardProps,
  Description,
  FieldError,
  Fieldset,
  Form,
  Input,
  InputGroup,
  Label,
  Link,
  Spinner,
  TextField
} from "@heroui/react"
import { useState } from "react"

import { cn } from "../../lib/utils"
import { FieldSeparator } from "./field-separator"
import { MagicLinkButton } from "./magic-link-button"
import { ProviderButtons, type SocialLayout } from "./provider-buttons"

export type SignUpProps = {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
  variant?: CardProps["variant"]
}

/**
 * Render a sign-up form with name, email, password (and optional confirm password) fields, optional social provider buttons, and password visibility controls.
 *
 * The component reflects request state by disabling inputs and showing a pending indicator during sign-up or social sign-in.
 *
 * @param className - Additional CSS classes applied to the outer card container
 * @param socialLayout - Social layout to apply to the provider buttons component
 * @param socialPosition - Position of social provider buttons relative to the form; `"top"` or `"bottom"` (default `"bottom"`)
 * @returns The sign-up form React element
 */
export function SignUp({
  className,
  socialLayout,
  socialPosition = "bottom",
  variant,
  ...props
}: SignUpProps & CardProps) {
  const {
    basePaths,
    emailAndPassword,
    localization,
    magicLink,
    socialProviders,
    viewPaths
  } = useAuth()

  const [
    { name, email, password, confirmPassword },
    signUpEmail,
    signUpPending
  ] = useSignUpEmail()

  const [_, signInSocial, socialPending] = useSignInSocial()

  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false)

  const isPending = signUpPending || socialPending

  const showSeparator =
    emailAndPassword?.enabled && socialProviders && socialProviders.length > 0

  return (
    <Card
      className={cn("w-full max-w-sm p-4 md:p-6", className)}
      variant={variant}
      {...props}
    >
      <Card.Content>
        <Fieldset className="gap-4">
          <Label className="text-xl">{localization.auth.signUp}</Label>

          {socialPosition === "top" && (
            <>
              {socialProviders && socialProviders.length > 0 && (
                <ProviderButtons
                  isPending={isPending}
                  socialLayout={socialLayout}
                  signInSocial={signInSocial}
                />
              )}

              {showSeparator && (
                <FieldSeparator>{localization.auth.or}</FieldSeparator>
              )}
            </>
          )}

          {emailAndPassword?.enabled && (
            <Form action={signUpEmail} className="flex flex-col gap-4">
              <Fieldset.Group>
                <TextField
                  defaultValue={name}
                  name="name"
                  type="text"
                  autoComplete="name"
                  isDisabled={isPending}
                >
                  <Label>{localization.auth.name}</Label>

                  <Input
                    placeholder={localization.auth.namePlaceholder}
                    required
                    variant={
                      variant === "transparent" ? "primary" : "secondary"
                    }
                  />

                  <FieldError className="text-wrap" />
                </TextField>

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
                    variant={
                      variant === "transparent" ? "primary" : "secondary"
                    }
                  />

                  <FieldError className="text-wrap" />
                </TextField>

                <TextField
                  defaultValue={password}
                  minLength={emailAndPassword?.minPasswordLength}
                  maxLength={emailAndPassword?.maxPasswordLength}
                  name="password"
                  autoComplete="new-password"
                  isDisabled={isPending}
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
                      name="password"
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
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        isDisabled={isPending}
                      >
                        {isPasswordVisible ? <EyeSlash /> : <Eye />}
                      </Button>
                    </InputGroup.Suffix>
                  </InputGroup>

                  <FieldError className="text-wrap" />
                </TextField>

                {emailAndPassword?.confirmPassword && (
                  <TextField
                    defaultValue={confirmPassword}
                    minLength={emailAndPassword?.minPasswordLength}
                    maxLength={emailAndPassword?.maxPasswordLength}
                    name="confirmPassword"
                    autoComplete="new-password"
                    isDisabled={isPending}
                  >
                    <Label>{localization.auth.confirmPassword}</Label>

                    <InputGroup
                      variant={
                        variant === "transparent" ? "primary" : "secondary"
                      }
                    >
                      <InputGroup.Input
                        name="confirmPassword"
                        placeholder={
                          localization.auth.confirmPasswordPlaceholder
                        }
                        type={isConfirmPasswordVisible ? "text" : "password"}
                        required
                      />

                      <InputGroup.Suffix className="px-0">
                        <Button
                          isIconOnly
                          aria-label={
                            isConfirmPasswordVisible
                              ? localization.auth.hidePassword
                              : localization.auth.showPassword
                          }
                          size="sm"
                          variant="ghost"
                          onPress={() =>
                            setIsConfirmPasswordVisible(
                              !isConfirmPasswordVisible
                            )
                          }
                          isDisabled={isPending}
                        >
                          {isConfirmPasswordVisible ? <EyeSlash /> : <Eye />}
                        </Button>
                      </InputGroup.Suffix>
                    </InputGroup>

                    <FieldError className="text-wrap" />
                  </TextField>
                )}
              </Fieldset.Group>

              <Fieldset.Actions className="flex-col gap-3">
                <Button type="submit" className="w-full" isPending={isPending}>
                  {isPending && <Spinner color="current" size="sm" />}

                  {localization.auth.signUp}
                </Button>

                {magicLink && (
                  <MagicLinkButton view="signUp" isPending={isPending} />
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

          {emailAndPassword?.enabled && (
            <Description className="flex justify-center gap-1.5 text-foreground text-sm">
              {localization.auth.alreadyHaveAnAccount}

              <Link
                href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
                className="text-accent decoration-accent no-underline hover:underline"
              >
                {localization.auth.signIn}
              </Link>
            </Description>
          )}
        </Fieldset>
      </Card.Content>
    </Card>
  )
}
