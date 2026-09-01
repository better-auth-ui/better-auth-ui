import { getViewURL, isPasswordCompromisedError } from "@better-auth-ui/core"
import {
  useAuth,
  useChangePassword,
  useListAccounts,
  useRequestPasswordReset,
  useSession
} from "@better-auth-ui/solid"
import { createForm } from "@tanstack/solid-form"
import type { BetterFetchError } from "better-auth/client"
import { Eye, EyeOff } from "lucide-solid"
import { createSignal, Show } from "solid-js"
import { toast } from "solid-sonner"
import { OpenEmailButton } from "@/components/auth/open-email-button"
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter"
import type { ChangePasswordFieldErrors } from "@/components/auth/settings/shared/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from "@/components/ui/input-group"
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
  const linkedAccounts = useListAccounts(auth.authClient, () => ({
    enabled: !import.meta.env.SSR && Boolean(userId())
  }))
  const hasCredentialAccount = () =>
    linkedAccounts.data?.some(
      (account: { providerId?: string }) => account.providerId === "credential"
    )
  const requestPasswordReset = useRequestPasswordReset(auth.authClient)
  const changePassword = useChangePassword(auth.authClient, () => ({
    onError: (error: BetterFetchError) => {
      form.reset()

      // The haveIBeenPwned plugin rejects on the password itself, so it
      // belongs against the field rather than in a toast.
      if (isPasswordCompromisedError(error)) {
        setPasswordFieldError(
          "newPassword",
          auth.localization.auth.passwordCompromised
        )
        return
      }

      toast.error(error.error?.message || error.message)
    },
    onSuccess: () => {
      form.reset()
      toast.success(auth.localization.settings.changePasswordSuccess)
    }
  }))
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] =
    createSignal(false)
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

  const sendResetLink = () => {
    if (!session.data) return

    requestPasswordReset.mutate({
      email: session.data.user.email,
      redirectTo: getViewURL(
        auth.baseURL,
        auth.basePaths.auth,
        auth.viewPaths.auth.resetPassword
      )
    } as Parameters<typeof requestPasswordReset.mutate>[0])
  }

  const form = createForm(() => ({
    defaultValues: {
      confirmPassword: "",
      currentPassword: "",
      newPassword: ""
    },
    onSubmit: ({ value }) => {
      if (
        props.confirmPassword &&
        value.newPassword !== value.confirmPassword
      ) {
        form.reset()
        toast.error(auth.localization.auth.passwordsDoNotMatch)
        return
      }

      changePassword.mutate({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
        revokeOtherSessions: true
      } as Parameters<typeof changePassword.mutate>[0])
    }
  }))

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

            <Show
              fallback={
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
              }
              when={requestPasswordReset.isSuccess && session.data?.user.email}
              keyed
            >
              {(sentEmail) => (
                <div class="flex flex-col items-start gap-3 sm:items-end">
                  <p class="text-sm" role="status">
                    {auth.localization.auth.resetLinkSentTo.replace(
                      "{{email}}",
                      sentEmail
                    )}
                  </p>

                  <OpenEmailButton class="w-auto" email={sentEmail} />
                </div>
              )}
            </Show>
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

      <form
        onSubmit={(event) => {
          event.preventDefault()
          void form.handleSubmit()
        }}
      >
        <Card>
          <CardContent class="flex flex-col gap-6">
            <form.Field name="currentPassword">
              {(field) => (
                <Field data-invalid={Boolean(fieldErrors().currentPassword)}>
                  <FieldLabel for="currentPassword">
                    {auth.localization.settings.currentPassword}
                  </FieldLabel>
                  <Show
                    fallback={<ChangePasswordSkeletonInput />}
                    when={session.data && !linkedAccounts.isPending}
                  >
                    <InputGroup>
                      <InputGroupInput
                        aria-invalid={!!fieldErrors().currentPassword}
                        autocomplete="current-password"
                        disabled={isPasswordPending()}
                        id="currentPassword"
                        name={field().name}
                        onInput={(event) => {
                          field().handleChange(event.currentTarget.value)
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
                        type={isCurrentPasswordVisible() ? "text" : "password"}
                        value={field().state.value}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          aria-label={
                            isCurrentPasswordVisible()
                              ? auth.localization.auth.hidePassword
                              : auth.localization.auth.showPassword
                          }
                          disabled={isPasswordPending()}
                          onClick={() =>
                            setIsCurrentPasswordVisible((visible) => !visible)
                          }
                          size="icon-sm"
                          title={
                            isCurrentPasswordVisible()
                              ? auth.localization.auth.hidePassword
                              : auth.localization.auth.showPassword
                          }
                        >
                          <Show
                            when={isCurrentPasswordVisible()}
                            fallback={<Eye aria-hidden class="size-4" />}
                          >
                            <EyeOff aria-hidden class="size-4" />
                          </Show>
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                  </Show>
                  <Show when={fieldErrors().currentPassword}>
                    {(message) => <FieldError>{message()}</FieldError>}
                  </Show>
                </Field>
              )}
            </form.Field>

            <form.Field name="newPassword">
              {(field) => (
                <Field data-invalid={Boolean(fieldErrors().newPassword)}>
                  <FieldLabel for="newPassword">
                    {auth.localization.auth.newPassword}
                  </FieldLabel>
                  <Show
                    fallback={<ChangePasswordSkeletonInput />}
                    when={session.data && !linkedAccounts.isPending}
                  >
                    <InputGroup>
                      <InputGroupInput
                        aria-invalid={!!fieldErrors().newPassword}
                        autocomplete="new-password"
                        disabled={isPasswordPending()}
                        id="newPassword"
                        maxLength={auth.emailAndPassword.maxPasswordLength}
                        minLength={auth.emailAndPassword.minPasswordLength}
                        name={field().name}
                        onInput={(event) => {
                          field().handleChange(event.currentTarget.value)
                          setPasswordFieldError("newPassword")
                        }}
                        onInvalid={(event) => {
                          event.preventDefault()
                          setPasswordFieldError(
                            "newPassword",
                            event.currentTarget.validationMessage
                          )
                        }}
                        placeholder={
                          auth.localization.auth.newPasswordPlaceholder
                        }
                        required
                        type={isNewPasswordVisible() ? "text" : "password"}
                        value={field().state.value}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          aria-label={
                            isNewPasswordVisible()
                              ? auth.localization.auth.hidePassword
                              : auth.localization.auth.showPassword
                          }
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
                        >
                          {isNewPasswordVisible() ? (
                            <EyeOff aria-hidden class="size-4" />
                          ) : (
                            <Eye aria-hidden class="size-4" />
                          )}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                  </Show>
                  <Show when={fieldErrors().newPassword}>
                    {(message) => <FieldError>{message()}</FieldError>}
                  </Show>

                  <PasswordStrengthMeter password={field().state.value} />
                </Field>
              )}
            </form.Field>

            <Show when={props.confirmPassword}>
              <form.Field name="confirmPassword">
                {(field) => (
                  <Field data-invalid={Boolean(fieldErrors().confirmPassword)}>
                    <FieldLabel for="confirmPassword">
                      {auth.localization.auth.confirmPassword}
                    </FieldLabel>
                    <Show
                      fallback={<ChangePasswordSkeletonInput />}
                      when={session.data && !linkedAccounts.isPending}
                    >
                      <InputGroup>
                        <InputGroupInput
                          aria-invalid={!!fieldErrors().confirmPassword}
                          autocomplete="new-password"
                          disabled={isPasswordPending()}
                          id="confirmPassword"
                          maxLength={auth.emailAndPassword.maxPasswordLength}
                          minLength={auth.emailAndPassword.minPasswordLength}
                          name={field().name}
                          onInput={(event) => {
                            field().handleChange(event.currentTarget.value)
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
                          type={
                            isConfirmPasswordVisible() ? "text" : "password"
                          }
                          value={field().state.value}
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton
                            aria-label={
                              isConfirmPasswordVisible()
                                ? auth.localization.auth.hidePassword
                                : auth.localization.auth.showPassword
                            }
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
                          >
                            {isConfirmPasswordVisible() ? (
                              <EyeOff aria-hidden class="size-4" />
                            ) : (
                              <Eye aria-hidden class="size-4" />
                            )}
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                    </Show>
                    <Show when={fieldErrors().confirmPassword}>
                      {(message) => <FieldError>{message()}</FieldError>}
                    </Show>
                  </Field>
                )}
              </form.Field>
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
