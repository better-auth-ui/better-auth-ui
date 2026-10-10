import {
  isPasswordCompromisedError,
  validateMatchingValue,
  validateStringLength
} from "@better-auth-ui/core"
import { useAuthForm } from "../../auth-form"
import { usePasswordValidation } from "../../password-field"
import {
  useAuth,
  useChangePassword,
  useFetchOptions,
  useListAccounts,
  useRequestPasswordReset,
  useSession
} from "@better-auth-ui/react"
import { useState } from "react"
import { cn } from "../../../../lib/cn"
import { Button } from "../../../../primitives/button"
import { Card, type CardVariant } from "../../../../primitives/card"
import { Box, Txt } from "../../../../primitives/styled"
import { toast } from "../../../../primitives/toast"

export type ChangePasswordProps = {
  className?: string
  variant?: CardVariant
}

/**
 * Card form for changing the authenticated user's password.
 *
 * When the user has a credential account, renders fields for current
 * password, new password, and optionally confirm password. When the user
 * only has social accounts, renders a prompt to set a password via the
 * reset flow.
 */
export function ChangePassword({ className, variant }: ChangePasswordProps) {
  const { authClient, emailAndPassword, localization } = useAuth()
  const { data: session } = useSession(authClient)
  const { data: accounts, isPending: isAccountsPending } =
    useListAccounts(authClient)

  const hasCredentialAccount = accounts?.some(
    (account) => account.providerId === "credential"
  )

  if (!isAccountsPending && !hasCredentialAccount) {
    return <SetPassword className={className} variant={variant} />
  }

  return (
    <ChangePasswordForm
      className={className}
      variant={variant}
      emailAndPassword={emailAndPassword}
      localization={localization}
      session={isAccountsPending ? undefined : session}
    />
  )
}

function SetPassword({ className, variant }: ChangePasswordProps) {
  const { authClient, localization, plugins } = useAuth()
  const { data: session } = useSession(authClient)
  const { fetchOptions, resetFetchOptions } = useFetchOptions()

  const { mutate: requestPasswordReset, isPending } = useRequestPasswordReset(
    authClient,
    {
      onError: () => {
        resetFetchOptions()
      },
      onSuccess: () => toast.success(localization.auth.passwordResetEmailSent)
    }
  )

  const Captcha = plugins.find(
    (plugin) => plugin.captchaComponent
  )?.captchaComponent

  const handleSetPassword = () => {
    if (!session?.user.email) return
    requestPasswordReset({ email: session.user.email, fetchOptions })
  }

  return (
    <Box className={cn(className)}>
      <Txt className="mb-3 text-sm font-semibold text-foreground">
        {localization.settings.changePassword}
      </Txt>

      <Card variant={variant}>
        <Card.Content className="flex-col items-start justify-between gap-4">
          <Box>
            <Txt className="text-sm font-medium leading-tight text-foreground">
              {localization.settings.setPassword}
            </Txt>

            <Txt className="mt-0.5 text-xs text-muted">
              {localization.settings.setPasswordDescription}
            </Txt>
          </Box>

          <Box className="items-start gap-3">
            {Captcha && <Box>{Captcha}</Box>}

            <Button
              size="sm"
              isPending={isPending}
              isDisabled={!session?.user.email}
              onPress={handleSetPassword}
            >
              {localization.auth.sendResetLink}
            </Button>
          </Box>
        </Card.Content>
      </Card>
    </Box>
  )
}

function ChangePasswordForm({
  className,
  variant,
  session
}: {
  className?: string
  variant?: CardVariant
  emailAndPassword: ReturnType<typeof useAuth>["emailAndPassword"]
  localization: ReturnType<typeof useAuth>["localization"]
  session: ReturnType<typeof useSession>["data"]
}) {
  const { authClient, emailAndPassword, localization } = useAuth()
  const validatePassword = usePasswordValidation()
  const [compromised, setCompromised] = useState(false)
  const change = useChangePassword(authClient, {
    onSuccess: () => {
      form.reset()
      toast.success(localization.settings.changePasswordSuccess)
    },
    onError: (error) => {
      setCompromised(isPasswordCompromisedError(error))
      form.setFieldValue("currentPassword", "")
      form.setFieldValue("newPassword", "")
      form.setFieldValue("confirmPassword", "")
    }
  })
  const form = useAuthForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    },
    onSubmit: async ({ value }) => {
      await change.mutateAsync({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
        revokeOtherSessions: true
      })
    }
  })
  return (
    <Box className={className}>
      <Txt className="mb-3 text-sm font-semibold">
        {localization.settings.changePassword}
      </Txt>
      <Card variant={variant}>
        <Card.Content>
          <form.AppForm>
            <form.AuthFormRoot className="gap-4">
              <form.AppField
                name="currentPassword"
                validators={{
                  onChange: ({ value }) =>
                    validateStringLength(value, {
                      requiredMessage: localization.auth.fieldRequired
                    })
                }}
              >
                {(field) => (
                  <field.AuthFormPasswordField
                    label={localization.settings.currentPassword}
                    autoComplete="current-password"
                    isPending={change.isPending || !session}
                  />
                )}
              </form.AppField>
              <form.AppField
                name="newPassword"
                validators={{
                  onChange: ({ value }) => validatePassword(value)
                }}
                listeners={{ onChange: () => setCompromised(false) }}
              >
                {(field) => (
                  <field.AuthFormPasswordField
                    label={localization.auth.newPassword}
                    strengthMeter
                    isPending={change.isPending || !session}
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
                    onChangeListenTo: ["newPassword"],
                    onChange: ({ value, fieldApi }) =>
                      validatePassword(value) ??
                      validateMatchingValue(
                        value,
                        fieldApi.form.getFieldValue("newPassword"),
                        localization.auth.passwordsDoNotMatch
                      )
                  }}
                >
                  {(field) => (
                    <field.AuthFormPasswordField
                      label={localization.auth.confirmPassword}
                      isPending={change.isPending || !session}
                    />
                  )}
                </form.AppField>
              ) : null}
              <form.AuthFormSubmitButton
                isPending={change.isPending}
                isDisabled={!session}
                size="sm"
              >
                {localization.settings.updatePassword}
              </form.AuthFormSubmitButton>
            </form.AuthFormRoot>
          </form.AppForm>
        </Card.Content>
      </Card>
    </Box>
  )
}
