import {
  changePasswordOptions,
  listAccountsOptions,
  requestPasswordResetOptions,
  useAuth,
  useSession
} from "@better-auth-ui/solid"
import { createMutation, createQuery } from "@tanstack/solid-query"
import { Eye, EyeOff } from "lucide-solid"
import { createSignal, Show } from "solid-js"
import { toast } from "solid-sonner"
import { shouldLoadAccounts } from "@/components/auth/settings/shared/helpers"
import type { ChangePasswordFieldErrors } from "@/components/auth/settings/shared/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

function ChangePasswordSkeletonInput() {
  return (
    <Skeleton>
      <Input class="invisible" />
    </Skeleton>
  )
}

export type ChangePasswordSettingsProps = {
  class?: string
  confirmPassword?: boolean
}

export function ChangePasswordSettings(
  props: ChangePasswordSettingsProps = {}
) {
  const auth = useAuth()
  const session = useSession(auth.authClient)
  const userId = () => session.data?.user.id
  const linkedAccounts = createQuery(() => ({
    ...listAccountsOptions(auth.authClient, userId()),
    enabled: shouldLoadAccounts({
      isSsr: import.meta.env.SSR,
      userId: userId()
    })
  }))
  const hasCredentialAccount = () =>
    linkedAccounts.data?.some(
      (account: { providerId?: string }) => account.providerId === "credential"
    )
  const requestPasswordReset = createMutation(() => ({
    ...requestPasswordResetOptions(auth.authClient),
    onSuccess: () =>
      toast.success(auth.localization.auth.passwordResetEmailSent)
  }))
  const changePassword = createMutation(() => ({
    ...changePasswordOptions(auth.authClient),
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
      toast.success(auth.localization.settings.changePasswordSuccess)
    }
  }))
  const [currentPassword, setCurrentPassword] = createSignal("")
  const [newPassword, setNewPassword] = createSignal("")
  const [confirmPassword, setConfirmPassword] = createSignal("")
  const [isNewPasswordVisible, setIsNewPasswordVisible] = createSignal(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    createSignal(false)
  const [fieldErrors, setFieldErrors] = createSignal<ChangePasswordFieldErrors>(
    {}
  )

  const setPasswordFieldError = (
    field: keyof ChangePasswordFieldErrors,
    message?: string
  ) => {
    setFieldErrors((previous) => ({ ...previous, [field]: message }))
  }

  const resetPasswordFields = () => {
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const sendResetLink = () => {
    if (!session.data) return

    requestPasswordReset.mutate({
      email: session.data.user.email
    } as Parameters<typeof requestPasswordReset.mutate>[0])
  }

  const submitChangePassword = (event: SubmitEvent) => {
    event.preventDefault()

    if (props.confirmPassword && newPassword() !== confirmPassword()) {
      resetPasswordFields()
      toast.error(auth.localization.auth.passwordsDoNotMatch)
      return
    }

    changePassword.mutate({
      currentPassword: currentPassword(),
      newPassword: newPassword(),
      revokeOtherSessions: true
    } as Parameters<typeof changePassword.mutate>[0])
  }

  const isPasswordPending = () =>
    changePassword.isPending || requestPasswordReset.isPending

  if (!linkedAccounts.isPending && !hasCredentialAccount()) {
    return (
      <div class={cn(props.class)}>
        <h2 class="mb-3 text-sm font-semibold">
          {auth.localization.settings.changePassword}
        </h2>

        <Card>
          <CardContent class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="font-medium text-sm leading-tight">
                {auth.localization.settings.setPassword}
              </p>
              <p class="mt-0.5 text-muted-foreground text-xs">
                {auth.localization.settings.setPasswordDescription}
              </p>
            </div>

            <Button
              disabled={requestPasswordReset.isPending || !session.data}
              onClick={sendResetLink}
              size="sm"
              type="button"
            >
              {requestPasswordReset.isPending
                ? `${auth.localization.auth.sendResetLink}…`
                : auth.localization.auth.sendResetLink}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div class={cn(props.class)}>
      <h2 class="mb-3 text-sm font-semibold">
        {auth.localization.settings.changePassword}
      </h2>

      <form onSubmit={submitChangePassword}>
        <Card>
          <CardContent class="flex flex-col gap-6">
            <div class="grid gap-2">
              <Label for="currentPassword">
                {auth.localization.settings.currentPassword}
              </Label>
              <Show
                fallback={<ChangePasswordSkeletonInput />}
                when={session.data && !linkedAccounts.isPending}
              >
                <Input
                  aria-invalid={!!fieldErrors().currentPassword}
                  autocomplete="current-password"
                  disabled={isPasswordPending()}
                  id="currentPassword"
                  name="currentPassword"
                  onInput={(event) => {
                    setCurrentPassword(event.currentTarget.value)
                    setPasswordFieldError("currentPassword")
                  }}
                  onInvalid={(event) => {
                    event.preventDefault()
                    setPasswordFieldError(
                      "currentPassword",
                      event.currentTarget.validationMessage
                    )
                  }}
                  placeholder={
                    auth.localization.settings.currentPasswordPlaceholder
                  }
                  required
                  type="password"
                  value={currentPassword()}
                />
              </Show>
              <Show when={fieldErrors().currentPassword}>
                {(message) => (
                  <p class="text-destructive text-sm" role="alert">
                    {message()}
                  </p>
                )}
              </Show>
            </div>

            <div class="grid gap-2">
              <Label for="newPassword">
                {auth.localization.auth.newPassword}
              </Label>
              <Show
                fallback={<ChangePasswordSkeletonInput />}
                when={session.data && !linkedAccounts.isPending}
              >
                <div class="relative">
                  <Input
                    aria-invalid={!!fieldErrors().newPassword}
                    autocomplete="new-password"
                    class="pr-12"
                    disabled={isPasswordPending()}
                    id="newPassword"
                    maxLength={auth.emailAndPassword.maxPasswordLength}
                    minLength={auth.emailAndPassword.minPasswordLength}
                    name="newPassword"
                    onInput={(event) => {
                      setNewPassword(event.currentTarget.value)
                      setPasswordFieldError("newPassword")
                    }}
                    onInvalid={(event) => {
                      event.preventDefault()
                      setPasswordFieldError(
                        "newPassword",
                        event.currentTarget.validationMessage
                      )
                    }}
                    placeholder={auth.localization.auth.newPasswordPlaceholder}
                    required
                    type={isNewPasswordVisible() ? "text" : "password"}
                    value={newPassword()}
                  />
                  <Button
                    aria-label={
                      isNewPasswordVisible()
                        ? auth.localization.auth.hidePassword
                        : auth.localization.auth.showPassword
                    }
                    class="absolute right-1 top-1/2 -translate-y-1/2"
                    disabled={isPasswordPending()}
                    onClick={() =>
                      setIsNewPasswordVisible((visible) => !visible)
                    }
                    size="icon-sm"
                    title={
                      isNewPasswordVisible()
                        ? auth.localization.auth.hidePassword
                        : auth.localization.auth.showPassword
                    }
                    type="button"
                    variant="ghost"
                  >
                    {isNewPasswordVisible() ? (
                      <EyeOff aria-hidden class="size-4" />
                    ) : (
                      <Eye aria-hidden class="size-4" />
                    )}
                  </Button>
                </div>
              </Show>
              <Show when={fieldErrors().newPassword}>
                {(message) => (
                  <p class="text-destructive text-sm" role="alert">
                    {message()}
                  </p>
                )}
              </Show>
            </div>

            <Show when={props.confirmPassword}>
              <div class="grid gap-2">
                <Label for="confirmPassword">
                  {auth.localization.auth.confirmPassword}
                </Label>
                <Show
                  fallback={<ChangePasswordSkeletonInput />}
                  when={session.data && !linkedAccounts.isPending}
                >
                  <div class="relative">
                    <Input
                      aria-invalid={!!fieldErrors().confirmPassword}
                      autocomplete="new-password"
                      class="pr-12"
                      disabled={isPasswordPending()}
                      id="confirmPassword"
                      maxLength={auth.emailAndPassword.maxPasswordLength}
                      minLength={auth.emailAndPassword.minPasswordLength}
                      name="confirmPassword"
                      onInput={(event) => {
                        setConfirmPassword(event.currentTarget.value)
                        setPasswordFieldError("confirmPassword")
                      }}
                      onInvalid={(event) => {
                        event.preventDefault()
                        setPasswordFieldError(
                          "confirmPassword",
                          event.currentTarget.validationMessage
                        )
                      }}
                      placeholder={
                        auth.localization.auth.confirmPasswordPlaceholder
                      }
                      required
                      type={isConfirmPasswordVisible() ? "text" : "password"}
                      value={confirmPassword()}
                    />
                    <Button
                      aria-label={
                        isConfirmPasswordVisible()
                          ? auth.localization.auth.hidePassword
                          : auth.localization.auth.showPassword
                      }
                      class="absolute right-1 top-1/2 -translate-y-1/2"
                      disabled={isPasswordPending()}
                      onClick={() =>
                        setIsConfirmPasswordVisible((visible) => !visible)
                      }
                      size="icon-sm"
                      title={
                        isConfirmPasswordVisible()
                          ? auth.localization.auth.hidePassword
                          : auth.localization.auth.showPassword
                      }
                      type="button"
                      variant="ghost"
                    >
                      {isConfirmPasswordVisible() ? (
                        <EyeOff aria-hidden class="size-4" />
                      ) : (
                        <Eye aria-hidden class="size-4" />
                      )}
                    </Button>
                  </div>
                </Show>
                <Show when={fieldErrors().confirmPassword}>
                  {(message) => (
                    <p class="text-destructive text-sm" role="alert">
                      {message()}
                    </p>
                  )}
                </Show>
              </div>
            </Show>
          </CardContent>

          <CardFooter>
            <Button
              disabled={isPasswordPending() || !session.data}
              size="sm"
              type="submit"
            >
              {changePassword.isPending
                ? `${auth.localization.settings.updatePassword}…`
                : auth.localization.settings.updatePassword}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
