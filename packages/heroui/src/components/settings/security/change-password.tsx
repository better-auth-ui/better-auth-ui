import { useAuth, useChangePassword, useSession } from "@better-auth-ui/react"
import { Check, Eye, EyeSlash } from "@gravity-ui/icons"
import {
  Button,
  Card,
  type CardProps,
  cn,
  FieldError,
  Fieldset,
  Form,
  Input,
  InputGroup,
  Label,
  Skeleton,
  Spinner,
  TextField
} from "@heroui/react"
import { useState } from "react"

export type ChangePasswordProps = {
  className?: string
  variant?: CardProps["variant"]
}

/**
 * Render a card form for changing the authenticated user's password.
 *
 * Displays a card with fields for current password, new password, and optionally
 * confirm password (based on `emailAndPassword.confirmPassword`). All other sessions
 * are revoked upon successful password change.
 *
 * @returns A JSX element containing the change-password card and form
 */
export function ChangePassword({
  className,
  variant,
  ...props
}: ChangePasswordProps & CardProps) {
  const { emailAndPassword, localization } = useAuth()
  const { data: sessionData } = useSession()
  const [, formAction, isPending] = useChangePassword()

  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false)

  return (
    <Card
      className={cn("p-4 md:p-6 gap-4", className)}
      variant={variant}
      {...props}
    >
      <Card.Header>
        <Card.Title className="text-xl">
          {localization.settings.changePassword}
        </Card.Title>
      </Card.Header>

      <Card.Content>
        <Form action={formAction}>
          <Fieldset className="w-full gap-4">
            <Fieldset.Group>
              <TextField
                name="currentPassword"
                type="password"
                isDisabled={isPending || !sessionData}
              >
                <Label>{localization.settings.currentPassword}</Label>

                {sessionData ? (
                  <Input
                    autoComplete="current-password"
                    placeholder={
                      localization.settings.currentPasswordPlaceholder
                    }
                    required
                    variant={
                      variant === "transparent" ? "primary" : "secondary"
                    }
                  />
                ) : (
                  <Skeleton className="h-10 md:h-9 w-full rounded-xl" />
                )}

                <FieldError />
              </TextField>

              <TextField
                minLength={emailAndPassword?.minPasswordLength}
                maxLength={emailAndPassword?.maxPasswordLength}
                isDisabled={isPending || !sessionData}
              >
                <Label>{localization.auth.newPassword}</Label>

                {sessionData ? (
                  <InputGroup
                    variant={
                      variant === "transparent" ? "primary" : "secondary"
                    }
                  >
                    <InputGroup.Input
                      name="newPassword"
                      type={isNewPasswordVisible ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder={localization.auth.newPasswordPlaceholder}
                      required
                    />

                    <InputGroup.Suffix className="px-0">
                      <Button
                        isIconOnly
                        aria-label={
                          isNewPasswordVisible
                            ? localization.auth.hidePassword
                            : localization.auth.showPassword
                        }
                        size="sm"
                        variant="ghost"
                        onPress={() =>
                          setIsNewPasswordVisible(!isNewPasswordVisible)
                        }
                        isDisabled={isPending}
                      >
                        {isNewPasswordVisible ? <EyeSlash /> : <Eye />}
                      </Button>
                    </InputGroup.Suffix>
                  </InputGroup>
                ) : (
                  <Skeleton className="h-10 md:h-9 w-full rounded-xl" />
                )}

                <FieldError />
              </TextField>

              {emailAndPassword?.confirmPassword && (
                <TextField
                  minLength={emailAndPassword?.minPasswordLength}
                  maxLength={emailAndPassword?.maxPasswordLength}
                  isDisabled={isPending || !sessionData}
                  isRequired
                >
                  <Label>{localization.auth.confirmPassword}</Label>

                  {sessionData ? (
                    <InputGroup
                      variant={
                        variant === "transparent" ? "primary" : "secondary"
                      }
                    >
                      <InputGroup.Input
                        name="confirmPassword"
                        type={isConfirmPasswordVisible ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder={
                          localization.auth.confirmPasswordPlaceholder
                        }
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
                  ) : (
                    <Skeleton className="h-10 md:h-9 w-full rounded-xl" />
                  )}

                  <FieldError />
                </TextField>
              )}
            </Fieldset.Group>

            <Fieldset.Actions>
              <Button
                type="submit"
                isPending={isPending}
                isDisabled={!sessionData}
              >
                {isPending ? <Spinner color="current" size="sm" /> : <Check />}

                {localization.settings.updatePassword}
              </Button>
            </Fieldset.Actions>
          </Fieldset>
        </Form>
      </Card.Content>
    </Card>
  )
}
