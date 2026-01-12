import { useAuth, useResetPassword } from "@better-auth-ui/react"
import { Eye, EyeSlash } from "@gravity-ui/icons"
import {
  Button,
  Card,
  Description,
  FieldError,
  Fieldset,
  Form,
  InputGroup,
  Label,
  Link,
  Spinner,
  TextField
} from "@heroui/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { cn } from "../../lib/utils"

export type ResetPasswordProps = {
  className?: string
}

/**
 * Renders a password reset form that validates a token from the URL and submits a new password to the auth client.
 */
export function ResetPassword({ className }: ResetPasswordProps) {
  const { basePaths, emailAndPassword, localization, viewPaths, navigate } =
    useAuth()

  const [{ password, confirmPassword }, resetPassword, isPending] =
    useResetPassword()

  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false)

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const tokenParam = searchParams.get("token")

    if (!tokenParam) {
      toast.error(localization.auth.invalidResetPasswordToken)
      navigate(`${basePaths.auth}/${viewPaths.auth.signIn}`)
    }
  }, [
    basePaths.auth,
    localization.auth.invalidResetPasswordToken,
    viewPaths.auth.signIn,
    navigate
  ])

  return (
    <Card className={cn("w-full max-w-sm p-4 md:p-6", className)}>
      <Card.Content>
        <Form action={resetPassword}>
          <Fieldset className="gap-4">
            <Label className="text-xl">{localization.auth.resetPassword}</Label>

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
                  name="password"
                  placeholder={localization.auth.newPasswordPlaceholder}
                  type={isPasswordVisible ? "text" : "password"}
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
                    placeholder={localization.auth.confirmPasswordPlaceholder}
                    type={isConfirmPasswordVisible ? "text" : "password"}
                    required
                    name="confirmPassword"
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

                <FieldError className="text-wrap" />
              </TextField>
            )}

            <Fieldset.Actions>
              <Button type="submit" className="w-full" isPending={isPending}>
                {isPending && <Spinner color="current" size="sm" />}

                {localization.auth.resetPassword}
              </Button>
            </Fieldset.Actions>

            <Description className="flex justify-center gap-1.5 text-foreground text-sm">
              {localization.auth.rememberYourPassword}

              <Link
                href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
                className="text-accent rounded"
              >
                {localization.auth.signIn}
              </Link>
            </Description>
          </Fieldset>
        </Form>
      </Card.Content>
    </Card>
  )
}
