import {
  getViewURL,
  isPasswordCompromisedError,
  validateMatchingValue,
  validateStringLength
} from "@better-auth-ui/core"
import {
  useAuth,
  useChangePassword,
  useListAccounts,
  useRequestPasswordReset,
  useSession
} from "@better-auth-ui/solid"
import type { BetterFetchError } from "better-auth/client"
import { Eye, EyeOff } from "lucide-solid"
import { createSignal, Show } from "solid-js"
import { toast } from "solid-sonner"
import { OpenEmailButton } from "@/components/auth/open-email-button"
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter"
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
import { createAuthForm, isAuthFormFieldInvalid } from "../../auth-form"

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
      // The haveIBeenPwned plugin rejects on the password itself, so it
      // belongs against the field rather than in a toast.
      if (isPasswordCompromisedError(error)) {
        setIsCompromised(true)
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
  const [isCompromised, setIsCompromised] = createSignal(false)

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

  const form = createAuthForm(() => ({
    defaultValues: {
      confirmPassword: "",
      currentPassword: "",
      newPassword: ""
    },
    onSubmit: async ({ value }) => {
      try {
        await changePassword.mutateAsync({
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
          revokeOtherSessions: true
        } as Parameters<typeof changePassword.mutate>[0])
      } catch {
        // The mutation reports the error through its configured handler.
      }
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

      <form.AppForm>
        <form.AuthFormRoot>
          <Card>
            <CardContent class="flex flex-col gap-6">
              <form.AppField
                name="currentPassword"
                validators={{
                  onChange: ({ value }) =>
                    validateStringLength(value, {
                      requiredMessage: auth.localization.auth.fieldRequired
                    })
                }}
              >
                {(field) => {
                  const isInvalid = () =>
                    isAuthFormFieldInvalid(field().state.meta)

                  return (
                    <Field data-invalid={isInvalid()}>
                      <FieldLabel for="currentPassword">
                        {auth.localization.settings.currentPassword}
                      </FieldLabel>
                      <Show
                        fallback={<ChangePasswordSkeletonInput />}
                        when={session.data && !linkedAccounts.isPending}
                      >
                        <InputGroup>
                          <InputGroupInput
                            aria-invalid={isInvalid()}
                            autocomplete="current-password"
                            disabled={isPasswordPending()}
                            id="currentPassword"
                            name={field().name}
                            onBlur={field().handleBlur}
                            onInput={(event) =>
                              field().handleChange(event.currentTarget.value)
                            }
                            placeholder={
                              auth.localization.settings
                                .currentPasswordPlaceholder
                            }
                            required
                            type={
                              isCurrentPasswordVisible() ? "text" : "password"
                            }
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
                                setIsCurrentPasswordVisible(
                                  (visible) => !visible
                                )
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
                      <field.AuthFormFieldError />
                    </Field>
                  )
                }}
              </form.AppField>

              <form.AppField
                name="newPassword"
                validators={{
                  onChange: ({ value }) =>
                    validateStringLength(value, {
                      maxLength: auth.emailAndPassword.maxPasswordLength,
                      maxLengthMessage: auth.localization.auth.tooLong.replace(
                        "{{max}}",
                        String(auth.emailAndPassword.maxPasswordLength)
                      ),
                      minLength: auth.emailAndPassword.minPasswordLength,
                      minLengthMessage: auth.localization.auth.tooShort.replace(
                        "{{min}}",
                        String(auth.emailAndPassword.minPasswordLength)
                      ),
                      requiredMessage: auth.localization.auth.fieldRequired
                    })
                }}
              >
                {(field) => {
                  const isInvalid = () =>
                    isAuthFormFieldInvalid(field().state.meta) ||
                    isCompromised()

                  return (
                    <Field data-invalid={isInvalid()}>
                      <FieldLabel for="newPassword">
                        {auth.localization.auth.newPassword}
                      </FieldLabel>
                      <Show
                        fallback={<ChangePasswordSkeletonInput />}
                        when={session.data && !linkedAccounts.isPending}
                      >
                        <InputGroup>
                          <InputGroupInput
                            aria-invalid={isInvalid()}
                            autocomplete="new-password"
                            disabled={isPasswordPending()}
                            id="newPassword"
                            maxLength={auth.emailAndPassword.maxPasswordLength}
                            minLength={auth.emailAndPassword.minPasswordLength}
                            name={field().name}
                            onBlur={field().handleBlur}
                            onInput={(event) => {
                              field().handleChange(event.currentTarget.value)
                              setIsCompromised(false)
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
                      <Show
                        when={
                          isCompromised()
                            ? auth.localization.auth.passwordCompromised
                            : undefined
                        }
                        fallback={<field.AuthFormFieldError />}
                      >
                        {(message) => <FieldError>{message()}</FieldError>}
                      </Show>

                      <PasswordStrengthMeter password={field().state.value} />
                    </Field>
                  )
                }}
              </form.AppField>

              <Show when={props.confirmPassword}>
                <form.AppField
                  name="confirmPassword"
                  validators={{
                    onChangeListenTo: ["newPassword"],
                    onChange: ({ fieldApi, value }) =>
                      validateStringLength(value, {
                        maxLength: auth.emailAndPassword.maxPasswordLength,
                        maxLengthMessage:
                          auth.localization.auth.tooLong.replace(
                            "{{max}}",
                            String(auth.emailAndPassword.maxPasswordLength)
                          ),
                        minLength: auth.emailAndPassword.minPasswordLength,
                        minLengthMessage:
                          auth.localization.auth.tooShort.replace(
                            "{{min}}",
                            String(auth.emailAndPassword.minPasswordLength)
                          ),
                        requiredMessage: auth.localization.auth.fieldRequired
                      }) ??
                      validateMatchingValue(
                        value,
                        fieldApi.form.getFieldValue("newPassword"),
                        auth.localization.auth.passwordsDoNotMatch
                      )
                  }}
                >
                  {(field) => {
                    const isInvalid = () =>
                      isAuthFormFieldInvalid(field().state.meta)

                    return (
                      <Field data-invalid={isInvalid()}>
                        <FieldLabel for="confirmPassword">
                          {auth.localization.auth.confirmPassword}
                        </FieldLabel>
                        <Show
                          fallback={<ChangePasswordSkeletonInput />}
                          when={session.data && !linkedAccounts.isPending}
                        >
                          <InputGroup>
                            <InputGroupInput
                              aria-invalid={isInvalid()}
                              autocomplete="new-password"
                              disabled={isPasswordPending()}
                              id="confirmPassword"
                              maxLength={
                                auth.emailAndPassword.maxPasswordLength
                              }
                              minLength={
                                auth.emailAndPassword.minPasswordLength
                              }
                              name={field().name}
                              onBlur={field().handleBlur}
                              onInput={(event) =>
                                field().handleChange(event.currentTarget.value)
                              }
                              placeholder={
                                auth.localization.auth
                                  .confirmPasswordPlaceholder
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
                                  setIsConfirmPasswordVisible(
                                    (visible) => !visible
                                  )
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
                        <field.AuthFormFieldError />
                      </Field>
                    )
                  }}
                </form.AppField>
              </Show>
            </CardContent>

            <CardFooter>
              <form.AuthFormSubmitButton
                disabled={isPasswordPending() || !session.data}
                size="sm"
              >
                {auth.localization.settings.updatePassword}
              </form.AuthFormSubmitButton>
            </CardFooter>
          </Card>
        </form.AuthFormRoot>
      </form.AppForm>
    </div>
  )
}
