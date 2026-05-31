import { useAuth, useResetPassword } from "@better-auth-ui/react"
import { Eye, EyeSlash } from "@gravity-ui/icons"
import {
  Button,
  Card,
  type CardProps,
  cn,
  Description,
  FieldError,
  Form,
  InputGroup,
  Label,
  Link,
  Spinner,
  TextField,
  toast
} from "@heroui/react"
import { type SyntheticEvent, useEffect, useState } from "react"

export type ResetPasswordProps = {
  className?: string
  variant?: CardProps["variant"]
}

/**
 * Renders a reset password form that verifies a "token" URL parameter on mount and redirects to sign-in if absent.
 *
 * Renders password (and optional confirm-password) inputs with visibility toggles, applies min/max length constraints from the auth configuration, shows field errors, and submits the new password to the auth client.
 */
export function ResetPassword({
  className,
  variant,
  ...props
}: ResetPasswordProps & Omit<CardProps, "children">) {
  const {
    authClient,
    basePaths,
    emailAndPassword,
    localization,
    viewPaths,
    navigate
  } = useAuth()

  const { mutate: resetPassword, isPending } = useResetPassword(authClient, {
    onSuccess: () => {
      toast.success(localization.auth.passwordResetSuccess)
      navigate({ to: `${basePaths.auth}/${viewPaths.auth.signIn}` })
    }
  })

  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false)

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const token = searchParams.get("token") as string

    if (!token) {
      toast.danger(localization.auth.invalidResetPasswordToken)
      navigate({ to: `${basePaths.auth}/${viewPaths.auth.signIn}` })
    }
  }, [
    basePaths.auth,
    localization.auth.invalidResetPasswordToken,
    viewPaths.auth.signIn,
    navigate
  ])

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()

    const searchParams = new URLSearchParams(window.location.search)
    const token = searchParams.get("token") as string

    if (!token) {
      toast.danger(localization.auth.invalidResetPasswordToken)
      navigate({ to: `${basePaths.auth}/${viewPaths.auth.signIn}` })
      return
    }

    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (emailAndPassword?.confirmPassword && password !== confirmPassword) {
      toast.danger(localization.auth.passwordsDoNotMatch)
      return
    }

    resetPassword({ token, newPassword: password })
  }

  return (
    <Card
      className={cn("w-full max-w-sm gap-4 md:p-6", className)}
      variant={variant}
      {...props}
    >
      <Card.Header>
        <Card.Title className="text-xl font-semibold mb-1">
          {localization.auth.resetPassword}
        </Card.Title>
      </Card.Header>

      <Card.Content className="gap-4">
        <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField
            minLength={emailAndPassword?.minPasswordLength}
            maxLength={emailAndPassword?.maxPasswordLength}
            name="password"
            autoComplete="new-password"
            isDisabled={isPending}
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
                return localization.auth.tooLong.replace("{{max}}", String(max))
            }}
          >
            <Label>{localization.auth.password}</Label>

            <InputGroup
              variant={variant === "transparent" ? "primary" : "secondary"}
            >
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

            <FieldError />
          </TextField>

          {emailAndPassword?.confirmPassword && (
            <TextField
              minLength={emailAndPassword?.minPasswordLength}
              maxLength={emailAndPassword?.maxPasswordLength}
              name="confirmPassword"
              autoComplete="new-password"
              isDisabled={isPending}
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
              <Label>{localization.auth.confirmPassword}</Label>

              <InputGroup
                variant={variant === "transparent" ? "primary" : "secondary"}
              >
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

              <FieldError />
            </TextField>
          )}

          <div className="flex flex-col gap-3">
            <Button type="submit" className="w-full" isPending={isPending}>
              {isPending && <Spinner color="current" size="sm" />}

              {localization.auth.resetPassword}
            </Button>
          </div>
        </Form>
      </Card.Content>

      <Card.Footer className="flex-col gap-3">
        <Description className="text-sm">
          {localization.auth.rememberYourPassword}{" "}
          <Link
            href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
            className="text-accent no-underline hover:underline decoration-accent-hover"
          >
            {localization.auth.signIn}
          </Link>
        </Description>
      </Card.Footer>
    </Card>
  )
}
