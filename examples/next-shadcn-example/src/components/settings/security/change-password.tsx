"use client"

import {
  useAuth,
  useChangePassword,
  useListAccounts,
  useRequestPasswordReset,
  useSession
} from "@better-auth-ui/react"
import { Eye, EyeOff } from "lucide-react"
import { type SyntheticEvent, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Field, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export type ChangePasswordProps = {
  className?: string
}

/**
 * Render a card form for changing the authenticated user's password.
 *
 * When the user has a credential account, displays fields for current password,
 * new password, and optionally confirm password. When the user only has social
 * accounts, displays a prompt to set a password via the reset flow.
 *
 * @returns A JSX element containing the change-password or set-password card
 */
export function ChangePassword({ className }: ChangePasswordProps) {
  const { emailAndPassword, localization } = useAuth()
  const { data: session } = useSession()
  const { data: accounts, isPending: isAccountsPending } = useListAccounts()

  const hasCredentialAccount = accounts?.some(
    (account) => account.providerId === "credential"
  )

  if (!isAccountsPending && !hasCredentialAccount) {
    return <SetPassword className={className} />
  }

  return (
    <ChangePasswordForm
      className={className}
      emailAndPassword={emailAndPassword}
      localization={localization}
      session={isAccountsPending ? undefined : session}
    />
  )
}

function SetPassword({ className }: { className?: string }) {
  const { basePaths, localization, viewPaths } = useAuth()
  const { data: session } = useSession()

  const { mutate: requestPasswordReset, isPending } = useRequestPasswordReset({
    onSuccess: () => toast.success(localization.auth.passwordResetEmailSent)
  })

  const handleSetPassword = () => {
    if (!session) return

    requestPasswordReset({
      email: session.user.email,
      redirectTo: `${basePaths.auth}/${viewPaths.auth.resetPassword}`
    })
  }

  return (
    <div>
      <h2 className="text-sm font-semibold mb-3">
        {localization.settings.changePassword}
      </h2>

      <Card className={cn(className)}>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium leading-tight">
              {localization.settings.setPassword}
            </p>

            <p className="text-muted-foreground text-xs mt-0.5">
              {localization.settings.setPasswordDescription}
            </p>
          </div>

          <Button
            size="sm"
            disabled={isPending || !session}
            onClick={handleSetPassword}
          >
            {isPending && <Spinner />}

            {localization.auth.sendResetLink}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function ChangePasswordForm({
  className,
  emailAndPassword,
  localization,
  session
}: {
  className?: string
  emailAndPassword: ReturnType<typeof useAuth>["emailAndPassword"]
  localization: ReturnType<typeof useAuth>["localization"]
  session: ReturnType<typeof useSession>["data"]
}) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const { mutate: changePassword, isPending } = useChangePassword({
    onError: (error) => {
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.error(error.error?.message || error.message)
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

  const [fieldErrors, setFieldErrors] = useState<{
    currentPassword?: string
    newPassword?: string
    confirmPassword?: string
  }>({})

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (emailAndPassword.confirmPassword && newPassword !== confirmPassword) {
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.error(localization.auth.passwordsDoNotMatch)
      return
    }

    changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true
    })
  }

  return (
    <div>
      <h2 className="text-sm font-semibold mb-3">
        {localization.settings.changePassword}
      </h2>

      <form onSubmit={handleSubmit}>
        <Card className={cn(className)}>
          <CardContent className="flex flex-col gap-6">
            <Field data-invalid={!!fieldErrors.currentPassword}>
              <Label htmlFor="currentPassword">
                {localization.settings.currentPassword}
              </Label>

              {session ? (
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  placeholder={localization.settings.currentPasswordPlaceholder}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value)

                    setFieldErrors((prev) => ({
                      ...prev,
                      currentPassword: undefined
                    }))
                  }}
                  disabled={isPending}
                  required
                  onInvalid={(e) => {
                    e.preventDefault()

                    setFieldErrors((prev) => ({
                      ...prev,
                      currentPassword: (e.target as HTMLInputElement)
                        .validationMessage
                    }))
                  }}
                  aria-invalid={!!fieldErrors.currentPassword}
                />
              ) : (
                <Skeleton>
                  <Input className="invisible" />
                </Skeleton>
              )}

              <FieldError>{fieldErrors.currentPassword}</FieldError>
            </Field>

            <Field data-invalid={!!fieldErrors.newPassword}>
              <Label htmlFor="newPassword">
                {localization.auth.newPassword}
              </Label>

              {session ? (
                <InputGroup>
                  <InputGroupInput
                    id="newPassword"
                    name="newPassword"
                    type={isNewPasswordVisible ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder={localization.auth.newPasswordPlaceholder}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value)

                      setFieldErrors((prev) => ({
                        ...prev,
                        newPassword: undefined
                      }))
                    }}
                    minLength={emailAndPassword.minPasswordLength}
                    maxLength={emailAndPassword.maxPasswordLength}
                    disabled={isPending}
                    required
                    onInvalid={(e) => {
                      e.preventDefault()
                      setFieldErrors((prev) => ({
                        ...prev,
                        newPassword: (e.target as HTMLInputElement)
                          .validationMessage
                      }))
                    }}
                    aria-invalid={!!fieldErrors.newPassword}
                  />

                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-xs"
                      aria-label={
                        isNewPasswordVisible
                          ? localization.auth.hidePassword
                          : localization.auth.showPassword
                      }
                      onClick={() =>
                        setIsNewPasswordVisible(!isNewPasswordVisible)
                      }
                      disabled={isPending}
                    >
                      {isNewPasswordVisible ? <EyeOff /> : <Eye />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              ) : (
                <Skeleton>
                  <Input className="invisible" />
                </Skeleton>
              )}

              <FieldError>{fieldErrors.newPassword}</FieldError>
            </Field>

            {emailAndPassword.confirmPassword && (
              <Field data-invalid={!!fieldErrors.confirmPassword}>
                <Label htmlFor="confirmPassword">
                  {localization.auth.confirmPassword}
                </Label>

                {session ? (
                  <InputGroup>
                    <InputGroupInput
                      id="confirmPassword"
                      name="confirmPassword"
                      type={isConfirmPasswordVisible ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder={localization.auth.confirmPasswordPlaceholder}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)

                        setFieldErrors((prev) => ({
                          ...prev,
                          confirmPassword: undefined
                        }))
                      }}
                      minLength={emailAndPassword.minPasswordLength}
                      maxLength={emailAndPassword.maxPasswordLength}
                      disabled={isPending}
                      required
                      onInvalid={(e) => {
                        e.preventDefault()

                        setFieldErrors((prev) => ({
                          ...prev,
                          confirmPassword: (e.target as HTMLInputElement)
                            .validationMessage
                        }))
                      }}
                      aria-invalid={!!fieldErrors.confirmPassword}
                    />

                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        size="icon-xs"
                        aria-label={
                          isConfirmPasswordVisible
                            ? localization.auth.hidePassword
                            : localization.auth.showPassword
                        }
                        onClick={() =>
                          setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                        }
                        disabled={isPending}
                      >
                        {isConfirmPasswordVisible ? <EyeOff /> : <Eye />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                ) : (
                  <Skeleton>
                    <Input className="invisible" />
                  </Skeleton>
                )}

                <FieldError>{fieldErrors.confirmPassword}</FieldError>
              </Field>
            )}
          </CardContent>

          <CardFooter>
            <Button type="submit" size="sm" disabled={isPending || !session}>
              {isPending && <Spinner />}

              {localization.settings.updatePassword}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
