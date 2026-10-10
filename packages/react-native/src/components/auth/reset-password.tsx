import {
  isPasswordCompromisedError,
  validateMatchingValue
} from "@better-auth-ui/core"
import { AuthPrompts, useAuth, useResetPassword } from "@better-auth-ui/react"
import { useEffect, useState } from "react"
import { cn } from "../../lib/cn"
import { useAuthNavigation } from "../../navigation/navigation-context"
import { Card, type CardVariant } from "../../primitives/card"
import { Description } from "../../primitives/description"
import { Link } from "../../primitives/link"
import { toast } from "../../primitives/toast"
import { useAuthForm } from "./auth-form"
import { usePasswordValidation } from "./password-field"

export interface ResetPasswordProps {
  className?: string
  token?: string
  variant?: CardVariant
}

export function ResetPassword({
  className,
  token: tokenProp,
  variant
}: ResetPasswordProps) {
  const { authClient, emailAndPassword, localization } = useAuth()
  const navigation = useAuthNavigation()
  const token = tokenProp ?? navigation.getParam("token")
  const validatePassword = usePasswordValidation()
  const [compromised, setCompromised] = useState(false)
  const reset = useResetPassword(authClient, {
    onSuccess: () => {
      toast.success(localization.auth.passwordResetSuccess)
      navigation.push("signIn")
    },
    onError: (error) => {
      setCompromised(isPasswordCompromisedError(error))
      form.setFieldValue("password", "")
      form.setFieldValue("confirmPassword", "")
    }
  })
  const form = useAuthForm({
    defaultValues: { password: "", confirmPassword: "" },
    onSubmit: async ({ value }) => {
      if (token) await reset.mutateAsync({ token, newPassword: value.password })
    }
  })
  useEffect(() => {
    if (!token) {
      toast.danger(localization.auth.invalidResetPasswordToken)
      navigation.push("signIn", { replace: true })
    }
  }, [token, localization.auth.invalidResetPasswordToken, navigation])
  return (
    <Card className={cn("w-full max-w-sm gap-4", className)} variant={variant}>
      <AuthPrompts view="resetPassword" />
      <Card.Header>
        <Card.Title>{localization.auth.resetPassword}</Card.Title>
      </Card.Header>
      <Card.Content>
        <form.AppForm>
          <form.AuthFormRoot className="gap-4">
            <form.AppField
              name="password"
              validators={{ onChange: ({ value }) => validatePassword(value) }}
              listeners={{ onChange: () => setCompromised(false) }}
            >
              {(field) => (
                <field.AuthFormPasswordField
                  label={localization.auth.newPassword}
                  strengthMeter
                  isPending={reset.isPending}
                  error={
                    compromised
                      ? localization.auth.passwordCompromised
                      : undefined
                  }
                />
              )}
            </form.AppField>
            {emailAndPassword?.confirmPassword ? (
              <form.AppField
                name="confirmPassword"
                validators={{
                  onChangeListenTo: ["password"],
                  onChange: ({ value, fieldApi }) =>
                    validatePassword(value) ??
                    validateMatchingValue(
                      value,
                      fieldApi.form.getFieldValue("password"),
                      localization.auth.passwordsDoNotMatch
                    )
                }}
              >
                {(field) => (
                  <field.AuthFormPasswordField
                    label={localization.auth.confirmPassword}
                    isPending={reset.isPending}
                  />
                )}
              </form.AppField>
            ) : null}
            <form.AuthFormSubmitButton
              isDisabled={!token}
              isPending={reset.isPending}
            >
              {localization.auth.resetPassword}
            </form.AuthFormSubmitButton>
          </form.AuthFormRoot>
        </form.AppForm>
      </Card.Content>
      <Card.Footer>
        <Description>
          {localization.auth.rememberYourPassword}{" "}
          <Link view="signIn">{localization.auth.signIn}</Link>
        </Description>
      </Card.Footer>
    </Card>
  )
}
