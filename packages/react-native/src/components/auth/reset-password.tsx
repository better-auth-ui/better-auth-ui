import { useAuth, useResetPassword } from "@better-auth-ui/react"
import { useEffect, useState } from "react"
import { View } from "react-native"
import { cn } from "../../lib/cn"
import { useAuthNavigation } from "../../navigation/navigation-context"
import { Button } from "../../primitives/button"
import { Card, type CardVariant } from "../../primitives/card"
import { Description } from "../../primitives/description"
import { FieldError, Label, TextField } from "../../primitives/field"
import { Form } from "../../primitives/form"
import { InputGroup } from "../../primitives/input"
import { Link } from "../../primitives/link"
import { toast } from "../../primitives/toast"
import { Eye, EyeSlash } from "../../primitives/ui-icons"

export interface ResetPasswordProps {
  className?: string
  token?: string
  variant?: CardVariant
}

/**
 * Reset-password screen: verifies the reset `token` on mount (from the `token`
 * prop or the navigation param) and redirects to sign-in if it's missing.
 * Mirrors the heroui `ResetPassword`, adapted for React Native: fields are
 * controlled state (no `FormData`), the token is read from navigation params
 * (no URL parsing), and navigation goes through the adapter.
 */
export function ResetPassword({
  className,
  token: tokenProp,
  variant
}: ResetPasswordProps) {
  const { authClient, emailAndPassword, localization } = useAuth()

  const navigation = useAuthNavigation()
  const token = tokenProp ?? navigation.getParam("token")

  const { mutate: resetPassword, isPending } = useResetPassword(authClient, {
    onSuccess: () => {
      toast.success(localization.auth.passwordResetSuccess)
      navigation.push("signIn")
    }
  })

  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false)

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    if (!token) {
      toast.danger(localization.auth.invalidResetPasswordToken)
      navigation.push("signIn")
    }
  }, [token, localization.auth.invalidResetPasswordToken, navigation])

  function handleSubmit() {
    if (!token) {
      toast.danger(localization.auth.invalidResetPasswordToken)
      navigation.push("signIn")
      return
    }

    if (emailAndPassword?.confirmPassword && password !== confirmPassword) {
      toast.danger(localization.auth.passwordsDoNotMatch)
      return
    }

    resetPassword({ token, newPassword: password })
  }

  const inputVariant = variant === "transparent" ? "primary" : "secondary"

  return (
    <Card className={cn("w-full max-w-sm gap-4", className)} variant={variant}>
      <Card.Header>
        <Card.Title className="mb-1">
          {localization.auth.resetPassword}
        </Card.Title>
      </Card.Header>

      <Card.Content className="gap-4">
        <Form onSubmit={handleSubmit} className="gap-4">
          <TextField
            name="password"
            type="password"
            autoComplete="new-password"
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
                return localization.auth.tooLong.replace("{{max}}", String(max))
            }}
          >
            <Label>{localization.auth.password}</Label>

            <InputGroup variant={inputVariant}>
              <InputGroup.Input
                name="password"
                placeholder={localization.auth.newPasswordPlaceholder}
                type={isPasswordVisible ? "text" : "password"}
                required
              />

              <InputGroup.Suffix className="px-0">
                <Button
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  isDisabled={isPending}
                  aria-label={
                    isPasswordVisible
                      ? localization.auth.hidePassword
                      : localization.auth.showPassword
                  }
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  {isPasswordVisible ? (
                    <EyeSlash width={18} height={18} color="#525252" />
                  ) : (
                    <Eye width={18} height={18} color="#525252" />
                  )}
                </Button>
              </InputGroup.Suffix>
            </InputGroup>

            <FieldError />
          </TextField>

          {emailAndPassword?.confirmPassword && (
            <TextField
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              isDisabled={isPending}
              value={confirmPassword}
              onChange={setConfirmPassword}
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

              <InputGroup variant={inputVariant}>
                <InputGroup.Input
                  name="confirmPassword"
                  placeholder={localization.auth.confirmPasswordPlaceholder}
                  type={isConfirmPasswordVisible ? "text" : "password"}
                  required
                />

                <InputGroup.Suffix className="px-0">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    isDisabled={isPending}
                    aria-label={
                      isConfirmPasswordVisible
                        ? localization.auth.hidePassword
                        : localization.auth.showPassword
                    }
                    onPress={() =>
                      setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                    }
                  >
                    {isConfirmPasswordVisible ? (
                      <EyeSlash width={18} height={18} color="#525252" />
                    ) : (
                      <Eye width={18} height={18} color="#525252" />
                    )}
                  </Button>
                </InputGroup.Suffix>
              </InputGroup>

              <FieldError />
            </TextField>
          )}

          <View className="gap-3">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isPending={isPending}
            >
              {localization.auth.resetPassword}
            </Button>
          </View>
        </Form>
      </Card.Content>

      <Card.Footer className="flex-col gap-3">
        <Description className="text-sm">
          {localization.auth.rememberYourPassword}{" "}
          <Link view="signIn" className="text-sm">
            {localization.auth.signIn}
          </Link>
        </Description>
      </Card.Footer>
    </Card>
  )
}
