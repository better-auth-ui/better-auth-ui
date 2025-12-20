import {
  type AnyAuthConfig,
  useSignInSocial,
  useSignUpEmail
} from "@better-auth-ui/react"
import { Eye, EyeSlash } from "@gravity-ui/icons"
import {
  Button,
  Card,
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

import { useAuth } from "../../hooks/use-auth"
import { cn } from "../../lib/utils"
import { FieldSeparator } from "./field-separator"
import { MagicLinkButton } from "./magic-link-button"
import { ProviderButtons, type SocialLayout } from "./provider-buttons"

export type SignUpProps = AnyAuthConfig & {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
}

/**
 * Render a sign-up form with optional social provider buttons, name/email/password fields, and controls for password visibility.
 *
 * The component reflects request state by disabling inputs and showing a pending indicator when a sign-up or social sign-in is in progress.
 *
 * @returns A React element representing the sign-up form UI.
 */
export function SignUp({
  className,
  socialLayout,
  socialPosition = "bottom",
  ...config
}: SignUpProps) {
  const context = useAuth(config)

  const {
    basePaths,
    emailAndPassword,
    localization,
    magicLink,
    socialProviders,
    viewPaths
  } = context

  const [
    { name, email, password, confirmPassword },
    signUpEmail,
    signUpPending
  ] = useSignUpEmail(context)

  const [_, signInSocial, socialPending] = useSignInSocial(context)

  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false)

  const isPending = signUpPending || socialPending

  const showSeparator =
    emailAndPassword?.enabled && socialProviders && socialProviders.length > 0

  return (
    <Card className={cn("w-full max-w-sm p-4 md:p-6", className)}>
      <Card.Content>
        <Fieldset className="gap-4">
          <Fieldset.Legend className="text-xl">
            {localization.auth.signUp}
          </Fieldset.Legend>

          <Description />

          {socialPosition === "top" && (
            <>
              {socialProviders && socialProviders.length > 0 && (
                <ProviderButtons
                  {...config}
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

                  <InputGroup>
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

                    <InputGroup>
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
                  <MagicLinkButton
                    {...config}
                    view="signUp"
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
              {localization.auth.alreadyHaveAnAccount}

              <Link
                href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
                className="text-accent rounded"
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
