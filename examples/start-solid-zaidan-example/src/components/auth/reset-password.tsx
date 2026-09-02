import {
  type FormFieldError as FormFieldErrorValue,
  getAuthLinkURL,
  isPasswordCompromisedError,
  validateMatchingValue,
  validateStringLength
} from "@better-auth-ui/core"
import { AuthLink, useAuth, useResetPassword } from "@better-auth-ui/solid"
import { Eye, EyeOff } from "lucide-solid"
import { createSignal, Show } from "solid-js"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { createAuthForm, isAuthFormFieldInvalid } from "./auth-form"
import { PasswordStrengthMeter } from "./password-strength-meter"

export type ResetPasswordProps = {
  class?: string
  token?: string
}

const tokenFromLocation = () => {
  if (typeof window === "undefined") return undefined

  return new URLSearchParams(window.location.search).get("token")
}

export function ResetPassword(props: ResetPasswordProps) {
  const auth = useAuth()
  const [isCompromised, setIsCompromised] = createSignal(false)
  const [tokenError, setTokenError] = createSignal<string>()
  const [isPasswordVisible, setIsPasswordVisible] = createSignal(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    createSignal(false)
  const resetPassword = useResetPassword(auth.authClient, () => ({
    onError: (error) => {
      // The haveIBeenPwned plugin rejects on the password itself, so it
      // belongs against the field rather than in a toast.
      if (isPasswordCompromisedError(error)) {
        setIsCompromised(true)
      }
    }
  }))
  const form = createAuthForm(() => ({
    defaultValues: { confirmPassword: "", password: "" },
    onSubmit: ({ value }) => {
      const token = props.token ?? tokenFromLocation()

      setTokenError(
        token ? undefined : auth.localization.auth.invalidResetPasswordToken
      )
      if (!token) return
      resetPassword.mutate({ token, newPassword: value.password })
    }
  }))

  return (
    <Card class={cn("w-full max-w-sm", props.class)}>
      <CardHeader>
        <CardTitle class="text-xl font-semibold">
          {auth.localization.auth.resetPassword}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form
          aria-label="Reset password"
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
        >
          <div class="flex flex-col gap-6">
            <form.AppField
              name="password"
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
                  isAuthFormFieldInvalid(field().state.meta) || isCompromised()

                return (
                  <Field data-invalid={isInvalid()}>
                    <FieldLabel for="reset-password-new">
                      {auth.localization.auth.newPassword}
                    </FieldLabel>
                    <div class="relative">
                      <Input
                        aria-invalid={isInvalid()}
                        autocomplete="new-password"
                        class="pr-12"
                        id="reset-password-new"
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
                        type={isPasswordVisible() ? "text" : "password"}
                        value={field().state.value}
                      />

                      <Button
                        aria-label={
                          isPasswordVisible()
                            ? auth.localization.auth.hidePassword
                            : auth.localization.auth.showPassword
                        }
                        class="absolute right-1 top-1/2 -translate-y-1/2"
                        onClick={() =>
                          setIsPasswordVisible((visible) => !visible)
                        }
                        size="icon-sm"
                        title={
                          isPasswordVisible()
                            ? auth.localization.auth.hidePassword
                            : auth.localization.auth.showPassword
                        }
                        type="button"
                        variant="ghost"
                      >
                        {isPasswordVisible() ? (
                          <EyeOff aria-hidden class="size-4" />
                        ) : (
                          <Eye aria-hidden class="size-4" />
                        )}
                      </Button>
                    </div>

                    <Show
                      when={
                        isCompromised()
                          ? auth.localization.auth.passwordCompromised
                          : undefined
                      }
                      fallback={
                        <FieldError
                          errors={
                            field().state.meta.errors as Array<
                              FormFieldErrorValue | undefined
                            >
                          }
                        />
                      }
                    >
                      {(message) => <FieldError>{message()}</FieldError>}
                    </Show>

                    <PasswordStrengthMeter password={field().state.value} />
                  </Field>
                )
              }}
            </form.AppField>
            <form.AppField
              name="confirmPassword"
              validators={{
                onChangeListenTo: ["password"],
                onChange: ({ fieldApi, value }) =>
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
                  }) ??
                  validateMatchingValue(
                    value,
                    fieldApi.form.getFieldValue("password"),
                    auth.localization.auth.passwordsDoNotMatch
                  )
              }}
            >
              {(field) => {
                const isInvalid = () =>
                  isAuthFormFieldInvalid(field().state.meta)

                return (
                  <Field data-invalid={isInvalid()}>
                    <FieldLabel for="reset-password-confirm">
                      {auth.localization.auth.confirmPassword}
                    </FieldLabel>
                    <div class="relative">
                      <Input
                        aria-invalid={isInvalid()}
                        autocomplete="new-password"
                        class="pr-12"
                        id="reset-password-confirm"
                        maxLength={auth.emailAndPassword.maxPasswordLength}
                        minLength={auth.emailAndPassword.minPasswordLength}
                        name={field().name}
                        onBlur={field().handleBlur}
                        onInput={(event) =>
                          field().handleChange(event.currentTarget.value)
                        }
                        placeholder={
                          auth.localization.auth.confirmPasswordPlaceholder
                        }
                        required
                        type={isConfirmPasswordVisible() ? "text" : "password"}
                        value={field().state.value}
                      />

                      <Button
                        aria-label={
                          isConfirmPasswordVisible()
                            ? auth.localization.auth.hidePassword
                            : auth.localization.auth.showPassword
                        }
                        class="absolute right-1 top-1/2 -translate-y-1/2"
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

                    <FieldError
                      errors={
                        field().state.meta.errors as Array<
                          FormFieldErrorValue | undefined
                        >
                      }
                    />
                  </Field>
                )
              }}
            </form.AppField>
            <form.Subscribe
              selector={(state) =>
                [state.canSubmit, state.isSubmitting] as const
              }
            >
              {(formState) => (
                <Button
                  disabled={
                    !formState()[0] || formState()[1] || resetPassword.isPending
                  }
                  type="submit"
                >
                  {formState()[1] || resetPassword.isPending
                    ? `${auth.localization.auth.resetPassword}…`
                    : auth.localization.auth.resetPassword}
                </Button>
              )}
            </form.Subscribe>
            <Show when={tokenError()}>
              {(message) => (
                <Alert variant="destructive">
                  <AlertDescription>{message()}</AlertDescription>
                </Alert>
              )}
            </Show>
            <Show when={resetPassword.isSuccess}>
              <Alert>
                <AlertDescription role="status">
                  {auth.localization.auth.passwordResetSuccessDescription}
                </AlertDescription>
              </Alert>
            </Show>
            <Show
              when={
                resetPassword.isError &&
                !isPasswordCompromisedError(resetPassword.error)
              }
            >
              <Alert variant="destructive">
                <AlertDescription>
                  {auth.localization.auth.passwordResetErrorDescription}
                </AlertDescription>
              </Alert>
            </Show>
          </div>
        </form>

        <div class="mt-4 flex w-full flex-col items-center gap-3">
          <p class="text-center text-sm text-muted-foreground">
            {auth.localization.auth.rememberYourPassword}{" "}
            <AuthLink
              class="underline underline-offset-4"
              href={getAuthLinkURL(
                `${auth.basePaths.auth}/${auth.viewPaths.auth.signIn}`,
                auth.redirectTo
              )}
            >
              {auth.localization.auth.signIn}
            </AuthLink>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
