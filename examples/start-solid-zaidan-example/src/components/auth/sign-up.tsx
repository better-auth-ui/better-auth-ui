import {
  authQueryKeys,
  getAdditionalFieldDefaultValues,
  getAdditionalFieldSubmitValues,
  getAuthLinkURL,
  getFormFieldErrors,
  isPasswordCompromisedError,
  validateEmailAddress,
  validateMatchingValue,
  validateStringLength
} from "@better-auth-ui/core"
import {
  AuthLink,
  type AuthPlugin,
  AuthPrompts,
  useAuth,
  useFetchOptions,
  useSignUpEmail
} from "@better-auth-ui/solid"
import { useQueryClient } from "@tanstack/solid-query"
import { Eye, EyeOff } from "lucide-solid"
import { createSignal, For, Show } from "solid-js"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  createAuthForm,
  getAuthAdditionalFieldValidators,
  isAuthFormFieldInvalid
} from "./auth-form"
import { PasswordStrengthMeter } from "./password-strength-meter"
import { ProviderButtons, type SocialLayout } from "./provider-buttons"

export type SignUpProps = {
  class?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
  /**
   * Runs instead of the post-sign-up redirect, but only when the sign-up
   * created an immediately usable session. Email verification still takes
   * priority, and social sign-ups are unaffected.
   */
  onSignUpSuccess?: () => void
}

export function SignUp(props: SignUpProps) {
  const auth = useAuth()
  const { fetchOptions, resetFetchOptions } = useFetchOptions()
  const queryClient = useQueryClient()
  const [passwordError, setPasswordError] = createSignal<string>()
  const [isPasswordVisible, setIsPasswordVisible] = createSignal(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    createSignal(false)
  const signUp = useSignUpEmail(auth.authClient, () => ({
    onError: (error) => {
      // The haveIBeenPwned plugin rejects on the password itself, so it
      // belongs against the field rather than in a toast.
      if (isPasswordCompromisedError(error)) {
        setPasswordError(auth.localization.auth.passwordCompromised)
      }

      form.setFieldValue("password", "")
      form.setFieldValue("confirmPassword", "")
      resetFetchOptions()
    },
    onSuccess: (_data, variables) => {
      if (auth.emailAndPassword.requireEmailVerification) {
        sessionStorage.setItem("better-auth-ui.verify-email", variables.email)
        auth.navigate({
          to: getAuthLinkURL(
            `${auth.basePaths.auth}/${auth.viewPaths.auth.verifyEmail}`,
            auth.redirectTo
          )
        })
        return
      }

      queryClient.invalidateQueries({ queryKey: authQueryKeys.session })

      if (props.onSignUpSuccess) {
        props.onSignUpSuccess()
        return
      }

      auth.navigate({ to: auth.redirectTo })
    }
  }))
  const captchaComponent = () =>
    (auth.plugins as AuthPlugin[]).find((plugin) => plugin.captchaComponent)
      ?.captchaComponent
  const socialPosition = () => props.socialPosition ?? "bottom"
  const showSeparator = () =>
    Boolean(auth.emailAndPassword?.enabled && auth.socialProviders?.length)

  const signUpFieldsAbove = () =>
    auth.additionalFields?.filter((field) => field.signUp === "above") ?? []
  const signUpFieldsBelow = () =>
    auth.additionalFields?.filter(
      (field) => field.signUp && field.signUp !== "above"
    ) ?? []
  const signUpFields = () => [...signUpFieldsAbove(), ...signUpFieldsBelow()]
  const form = createAuthForm(() => ({
    defaultValues: {
      additionalFields: getAdditionalFieldDefaultValues(signUpFields()),
      confirmPassword: "",
      email: "",
      name: "",
      password: ""
    },
    onSubmit: async ({ value }) => {
      try {
        await signUp.mutateAsync({
          email: value.email.trim(),
          fetchOptions: fetchOptions(),
          name: auth.emailAndPassword.name ? value.name : "",
          password: value.password,
          ...getAdditionalFieldSubmitValues(
            signUpFields(),
            value.additionalFields
          )
        } as Parameters<typeof signUp.mutate>[0])
      } catch {
        // The mutation reports the error through its configured handler.
      }
    }
  }))

  return (
    <Card class={cn("w-full max-w-sm", props.class)}>
      <AuthPrompts view="signUp" />
      <CardHeader>
        <CardTitle class="text-xl font-semibold">
          {auth.localization.auth.signUp}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Show when={socialPosition() === "top"}>
          <Show when={auth.socialProviders?.length}>
            <ProviderButtons socialLayout={props.socialLayout} view="signUp" />
          </Show>
          <Show when={showSeparator()}>
            <div class="my-4 text-center text-muted-foreground text-xs">
              {auth.localization.auth.or}
            </div>
          </Show>
        </Show>

        <form.AppForm>
          <form.AuthFormRoot aria-label="Sign up">
            <div class="flex flex-col gap-6">
              <Show when={auth.emailAndPassword.name}>
                <form.AppField
                  name="name"
                  validators={{
                    onChange: ({ value }) =>
                      validateStringLength(value, {
                        requiredMessage: auth.localization.auth.fieldRequired,
                        trim: true
                      })
                  }}
                >
                  {(field) => {
                    const isInvalid = () =>
                      isAuthFormFieldInvalid(field().state.meta)

                    return (
                      <Field data-invalid={isInvalid()}>
                        <FieldLabel for="sign-up-name">
                          {auth.localization.auth.name}
                        </FieldLabel>
                        <Input
                          aria-invalid={isInvalid()}
                          autocomplete="name"
                          id="sign-up-name"
                          name={field().name}
                          onBlur={field().handleBlur}
                          onInput={(event) =>
                            field().handleChange(event.currentTarget.value)
                          }
                          placeholder={auth.localization.auth.namePlaceholder}
                          required={auth.emailAndPassword.name}
                          type="text"
                          value={field().state.value}
                        />

                        <FieldError
                          errors={getFormFieldErrors(field().state.meta.errors)}
                        />
                      </Field>
                    )
                  }}
                </form.AppField>
              </Show>
              <form.AppField
                name="email"
                validators={{
                  onChange: ({ value }) =>
                    validateEmailAddress(value, {
                      invalidMessage: auth.localization.auth.invalidEmail,
                      requiredMessage: auth.localization.auth.fieldRequired
                    })
                }}
              >
                {(field) => {
                  const isInvalid = () =>
                    isAuthFormFieldInvalid(field().state.meta)

                  return (
                    <Field data-invalid={isInvalid()}>
                      <FieldLabel for="sign-up-email">
                        {auth.localization.auth.email}
                      </FieldLabel>
                      <Input
                        aria-invalid={isInvalid()}
                        autocomplete="email"
                        id="sign-up-email"
                        name={field().name}
                        onBlur={field().handleBlur}
                        onInput={(event) =>
                          field().handleChange(event.currentTarget.value)
                        }
                        placeholder={auth.localization.auth.emailPlaceholder}
                        required
                        type="email"
                        value={field().state.value}
                      />

                      <FieldError
                        errors={getFormFieldErrors(field().state.meta.errors)}
                      />
                    </Field>
                  )
                }}
              </form.AppField>
              <For each={signUpFieldsAbove()}>
                {(configuredField) => (
                  <form.AppField
                    name={`additionalFields.${configuredField.name}`}
                    validators={getAuthAdditionalFieldValidators(
                      configuredField,
                      auth.localization.auth.fieldRequired
                    )}
                  >
                    {(field) => (
                      <field.AuthFormAdditionalField
                        field={configuredField}
                        isPending={signUp.isPending}
                        optionalLabel={auth.localization.auth.optional}
                      />
                    )}
                  </form.AppField>
                )}
              </For>
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
                    isAuthFormFieldInvalid(field().state.meta) ||
                    Boolean(passwordError())

                  return (
                    <Field data-invalid={isInvalid()}>
                      <FieldLabel for="sign-up-password">
                        {auth.localization.auth.password}
                      </FieldLabel>
                      <div class="relative">
                        <Input
                          aria-invalid={isInvalid()}
                          autocomplete="new-password"
                          class="pr-12"
                          id="sign-up-password"
                          maxLength={auth.emailAndPassword.maxPasswordLength}
                          minLength={auth.emailAndPassword.minPasswordLength}
                          name={field().name}
                          onBlur={field().handleBlur}
                          onInput={(event) => {
                            field().handleChange(event.currentTarget.value)
                            setPasswordError(undefined)
                          }}
                          placeholder={
                            auth.localization.auth.passwordPlaceholder
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

                      <Show when={passwordError()}>
                        {(message) => <FieldError>{message()}</FieldError>}
                      </Show>
                      <Show when={!passwordError()}>
                        <FieldError
                          errors={getFormFieldErrors(field().state.meta.errors)}
                        />
                      </Show>

                      <PasswordStrengthMeter password={field().state.value} />
                    </Field>
                  )
                }}
              </form.AppField>
              <Show when={auth.emailAndPassword.confirmPassword}>
                <form.AppField
                  name="confirmPassword"
                  validators={{
                    onChangeListenTo: ["password"],
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
                        <FieldLabel for="sign-up-confirm-password">
                          {auth.localization.auth.confirmPassword}
                        </FieldLabel>
                        <div class="relative">
                          <Input
                            aria-invalid={isInvalid()}
                            autocomplete="new-password"
                            class="pr-12"
                            id="sign-up-confirm-password"
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
                            type={
                              isConfirmPasswordVisible() ? "text" : "password"
                            }
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
                          errors={getFormFieldErrors(field().state.meta.errors)}
                        />
                      </Field>
                    )
                  }}
                </form.AppField>
              </Show>
              <For each={signUpFieldsBelow()}>
                {(configuredField) => (
                  <form.AppField
                    name={`additionalFields.${configuredField.name}`}
                    validators={getAuthAdditionalFieldValidators(
                      configuredField,
                      auth.localization.auth.fieldRequired
                    )}
                  >
                    {(field) => (
                      <field.AuthFormAdditionalField
                        field={configuredField}
                        isPending={signUp.isPending}
                        optionalLabel={auth.localization.auth.optional}
                      />
                    )}
                  </form.AppField>
                )}
              </For>
              <Show when={captchaComponent()} keyed>
                {(Captcha) => <Captcha />}
              </Show>
              <form.AuthFormSubmitButton disabled={signUp.isPending}>
                {auth.localization.auth.signUp}
              </form.AuthFormSubmitButton>
              <Show when={signUp.isSuccess}>
                <Alert>
                  <AlertDescription role="status">
                    Account created. Check your email if verification is
                    required.
                  </AlertDescription>
                </Alert>
              </Show>
              <Show
                when={
                  signUp.isError && !isPasswordCompromisedError(signUp.error)
                }
              >
                <Alert variant="destructive">
                  <AlertDescription>
                    Unable to create an account. Try again.
                  </AlertDescription>
                </Alert>
              </Show>
            </div>
          </form.AuthFormRoot>
        </form.AppForm>

        <Show
          when={socialPosition() === "bottom" && auth.socialProviders?.length}
        >
          <div class="my-4 text-center text-muted-foreground text-xs">
            {auth.localization.auth.or}
          </div>
          <ProviderButtons socialLayout={props.socialLayout} view="signUp" />
        </Show>

        <div class="mt-4 flex w-full flex-col items-center gap-3">
          <p class="text-center text-sm text-muted-foreground">
            {auth.localization.auth.alreadyHaveAnAccount}{" "}
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
