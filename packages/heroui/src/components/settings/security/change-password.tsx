import {
  type AnyAuthConfig,
  useChangePassword,
  useSession
} from "@better-auth-ui/react"
import { Check, Eye, EyeSlash } from "@gravity-ui/icons"
import {
  Button,
  Card,
  cn,
  FieldError,
  Fieldset,
  Form,
  Input,
  InputGroup,
  Label,
  Spinner,
  TextField
} from "@heroui/react"
import { useState } from "react"

import { useAuth } from "../../../hooks/use-auth"

export type ChangePasswordProps = AnyAuthConfig & {
  className?: string
}

/**
 * Display a form allowing the authenticated user to change their password.
 *
 * Renders a card containing fields for current password, new password, and
 * optionally password confirmation (based on emailAndPassword.confirmPassword config).
 * Upon successful submission, all other sessions are revoked for security.
 *
 * @returns A JSX element containing the change password card and form
 */
export function ChangePassword({ className, ...config }: ChangePasswordProps) {
  const context = useAuth(config)
  const { emailAndPassword, localization } = context

  const { data: sessionData } = useSession(context)

  const [, formAction, isPending] = useChangePassword(context)

  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false)

  return (
    <Card className={cn("p-4 md:p-6 gap-4 md:gap-6", className)}>
      <Card.Header>
        <Card.Title className="text-xl">
          {localization.settings.changePassword}
        </Card.Title>
      </Card.Header>

      <Form action={formAction}>
        <Fieldset className="w-full gap-4 md:gap-6">
          <Fieldset.Group>
            <TextField
              name="currentPassword"
              type="password"
              isDisabled={isPending || !sessionData}
            >
              <Label>{localization.settings.currentPassword}</Label>

              <Input
                autoComplete="current-password"
                placeholder={localization.settings.currentPasswordPlaceholder}
                required
              />

              <FieldError />
            </TextField>

            <TextField
              name="newPassword"
              minLength={emailAndPassword?.minPasswordLength}
              maxLength={emailAndPassword?.maxPasswordLength}
              isDisabled={isPending || !sessionData}
            >
              <Label>{localization.auth.newPassword}</Label>

              <InputGroup>
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

              <FieldError />
            </TextField>

            {emailAndPassword?.confirmPassword && (
              <TextField
                name="confirmPassword"
                minLength={emailAndPassword?.minPasswordLength}
                maxLength={emailAndPassword?.maxPasswordLength}
                isDisabled={isPending || !sessionData}
                isRequired
              >
                <Label>{localization.auth.confirmPassword}</Label>

                <InputGroup>
                  <InputGroup.Input
                    name="confirmPassword"
                    type={isConfirmPasswordVisible ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder={localization.auth.confirmPasswordPlaceholder}
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
                        setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                      }
                      isDisabled={isPending}
                    >
                      {isConfirmPasswordVisible ? <EyeSlash /> : <Eye />}
                    </Button>
                  </InputGroup.Suffix>
                </InputGroup>

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
    </Card>
  )
}
