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
import { FieldError, Label, TextField } from "../../../../primitives/field"
import { Form } from "../../../../primitives/form"
import { Input, InputGroup } from "../../../../primitives/input"
import { Skeleton } from "../../../../primitives/skeleton"
import { Box, Txt } from "../../../../primitives/styled"
import { toast } from "../../../../primitives/toast"
import { Eye, EyeSlash } from "../../../../primitives/ui-icons"

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
  emailAndPassword,
  localization,
  session
}: {
  className?: string
  variant?: CardVariant
  emailAndPassword: ReturnType<typeof useAuth>["emailAndPassword"]
  localization: ReturnType<typeof useAuth>["localization"]
  session: ReturnType<typeof useSession>["data"]
}) {
  const { authClient } = useAuth()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const { mutate: changePassword, isPending } = useChangePassword(authClient, {
    onError: () => {
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    },
    onSuccess: () => {
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.success(localization.settings.changePasswordSuccess)
    }
  })

  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false)

  const handleSubmit = () => {
    if (emailAndPassword?.confirmPassword && newPassword !== confirmPassword) {
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.danger(localization.auth.passwordsDoNotMatch)
      return
    }

    changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true
    })
  }

  const inputVariant = variant === "transparent" ? "primary" : "secondary"

  return (
    <Box className={cn(className)}>
      <Txt className="mb-3 text-sm font-semibold text-foreground">
        {localization.settings.changePassword}
      </Txt>

      <Card className="gap-4" variant={variant}>
        <Card.Content>
          <Form onSubmit={handleSubmit} className="gap-4">
            <TextField
              name="currentPassword"
              type="password"
              isDisabled={isPending || !session}
              value={currentPassword}
              onChange={setCurrentPassword}
            >
              <Label>{localization.settings.currentPassword}</Label>

              {session ? (
                <Input
                  autoComplete="current-password"
                  placeholder={localization.settings.currentPasswordPlaceholder}
                  required
                  variant={inputVariant}
                />
              ) : (
                <Skeleton className="h-11 w-full rounded-lg" />
              )}

              <FieldError />
            </TextField>

            <TextField
              minLength={emailAndPassword?.minPasswordLength}
              maxLength={emailAndPassword?.maxPasswordLength}
              isDisabled={isPending || !session}
              value={newPassword}
              onChange={setNewPassword}
            >
              <Label>{localization.auth.newPassword}</Label>

              {session ? (
                <InputGroup variant={inputVariant}>
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
                <Skeleton className="h-11 w-full rounded-lg" />
              )}

              <FieldError />
            </TextField>

            {emailAndPassword?.confirmPassword && (
              <TextField
                minLength={emailAndPassword?.minPasswordLength}
                maxLength={emailAndPassword?.maxPasswordLength}
                isDisabled={isPending || !session}
                value={confirmPassword}
                onChange={setConfirmPassword}
              >
                <Label>{localization.auth.confirmPassword}</Label>

                {session ? (
                  <InputGroup variant={inputVariant}>
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
                ) : (
                  <Skeleton className="h-11 w-full rounded-lg" />
                )}

                <FieldError />
              </TextField>
            )}

            <Box className="items-start">
              <Button
                type="submit"
                isPending={isPending}
                isDisabled={!session}
                size="sm"
              >
                {localization.settings.updatePassword}
              </Button>
            </Box>
          </Form>
        </Card.Content>
      </Card>
    </Box>
  )
}
