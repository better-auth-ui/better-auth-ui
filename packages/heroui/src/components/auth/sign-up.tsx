import {
  authMutationKeys,
  getAuthLinkURL,
  isPasswordCompromisedError,
  parseAdditionalFieldValue,
  validateEmailAddress,
  validateMatchingValue,
  validateStringLength
} from "@better-auth-ui/core"
import {
  AuthPrompts,
  useAuth,
  useFetchOptions,
  useSignUpEmail
} from "@better-auth-ui/react"
import { Eye, EyeSlash } from "@gravity-ui/icons"
import {
  Button,
  Card,
  type CardProps,
  cn,
  Description,
  FieldError,
  Input,
  InputGroup,
  Label,
  Link,
  TextField,
  toast
} from "@heroui/react"
import { useIsMutating } from "@tanstack/react-query"
import { useRef, useState } from "react"
import { AdditionalField } from "./additional-field"
import { isAuthFormFieldInvalid, useAuthForm } from "./auth-form"
import { FieldSeparator } from "./field-separator"
import { PasswordStrengthMeter } from "./password-strength-meter"
import { ProviderButtons, type SocialLayout } from "./provider-buttons"

export type SignUpProps = {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
  variant?: CardProps["variant"]
  /**
   * Runs instead of the post-sign-up redirect, but only when the sign-up
   * created an immediately usable session. Email verification still takes
   * priority, and social sign-ups are unaffected.
   */
  onSignUpSuccess?: () => void
}

/**
 * Render a sign-up form with name, email, password (and optional confirm password) fields, optional social provider buttons, and password visibility controls.
 *
 * The component reflects request state by disabling inputs and showing a pending indicator during sign-up or social sign-in.
 *
 * @param className - Additional CSS classes applied to the outer card container
 * @param socialLayout - Social layout to apply to the provider buttons component
 * @param socialPosition - Position of social provider buttons relative to the form; `"top"` or `"bottom"` (default `"bottom"`)
 * @param onSignUpSuccess - Replaces the post-sign-up redirect when the new account is immediately usable
 * @returns The sign-up form React element
 */
export function SignUp({
  className,
  socialLayout,
  socialPosition = "bottom",
  variant,
  onSignUpSuccess
}: SignUpProps) {
  const {
    additionalFields,
    authClient,
    basePaths,
    emailAndPassword,
    localization,
    plugins,
    redirectTo,
    socialProviders,
    viewPaths,
    navigate
  } = useAuth()

  const { fetchOptions, resetFetchOptions } = useFetchOptions()

  const [isCompromised, setIsCompromised] = useState(false)

  const { mutateAsync: signUpEmail } = useSignUpEmail(authClient, {
    onError: (error) => {
      // The haveIBeenPwned plugin rejects on the password itself, so
      // it belongs against the field rather than in a toast.
      setIsCompromised(isPasswordCompromisedError(error))

      form.setFieldValue("password", "")
      form.setFieldValue("confirmPassword", "")
      resetFetchOptions()
    },
    onSuccess: (_data, { email }) => {
      if (emailAndPassword?.requireEmailVerification) {
        sessionStorage.setItem("better-auth-ui.verify-email", email)
        navigate({
          to: getAuthLinkURL(
            `${basePaths.auth}/${viewPaths.auth.verifyEmail}`,
            redirectTo
          )
        })
      } else if (onSignUpSuccess) {
        onSignUpSuccess()
      } else {
        navigate({ to: redirectTo })
      }
    }
  })

  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false)

  const signInMutating = useIsMutating({
    mutationKey: authMutationKeys.signIn.all
  })
  const signUpMutating = useIsMutating({
    mutationKey: authMutationKeys.signUp.all
  })
  const isPending = signInMutating + signUpMutating > 0

  const Captcha = plugins.find(
    (plugin) => plugin.captchaComponent
  )?.captchaComponent
  const additionalFieldValuesRef = useRef<Record<string, unknown>>({})
  const form = useAuthForm({
    defaultValues: {
      confirmPassword: "",
      email: "",
      name: "",
      password: ""
    },
    onSubmit: async ({ value }) => {
      try {
        await signUpEmail({
          name: emailAndPassword?.name === false ? "" : value.name,
          email: value.email.trim(),
          password: value.password,
          ...additionalFieldValuesRef.current,
          fetchOptions
        })
      } catch {
        // The mutation reports the error through its configured handler.
      }
    }
  })

  const prepareSubmit = async (formElement: HTMLFormElement) => {
    const formData = new FormData(formElement)

    const additionalFieldValues: Record<string, unknown> = {}

    for (const field of additionalFields ?? []) {
      if (!field.signUp || field.readOnly) continue
      const value = parseAdditionalFieldValue(
        field,
        formData.get(field.name) as string | null
      )

      if (field.validate) {
        try {
          await field.validate(value)
        } catch (error) {
          toast.danger(error instanceof Error ? error.message : String(error))
          return false
        }
      }

      if (value !== undefined) {
        additionalFieldValues[field.name] = value
      }
    }

    additionalFieldValuesRef.current = additionalFieldValues
  }

  const showSeparator = emailAndPassword?.enabled && !!socialProviders?.length

  return (
    <Card
      className={cn("w-full max-w-sm gap-4 md:p-6", className)}
      variant={variant}
    >
      <AuthPrompts view="signUp" />
      <Card.Header>
        <Card.Title className="text-xl font-semibold mb-1">
          {localization.auth.signUp}
        </Card.Title>
      </Card.Header>

      <Card.Content className="gap-4">
        {socialPosition === "top" && (
          <>
            {!!socialProviders?.length && (
              <ProviderButtons socialLayout={socialLayout} view="signUp" />
            )}

            {showSeparator && (
              <FieldSeparator>{localization.auth.or}</FieldSeparator>
            )}
          </>
        )}

        {emailAndPassword?.enabled && (
          <form.AppForm>
            <form.AuthFormRoot
              className="flex flex-col gap-4"
              prepareSubmit={prepareSubmit}
            >
              {emailAndPassword.name !== false && (
                <form.AppField
                  name="name"
                  validators={{
                    onChange: ({ value }) =>
                      validateStringLength(value, {
                        requiredMessage: localization.auth.fieldRequired,
                        trim: true
                      })
                  }}
                >
                  {(field) => (
                    <TextField
                      name={field.name}
                      type="text"
                      autoComplete="name"
                      isDisabled={isPending}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={field.handleChange}
                      isInvalid={
                        isAuthFormFieldInvalid(field.state.meta) || undefined
                      }
                      validationBehavior="aria"
                    >
                      <Label>{localization.auth.name}</Label>

                      <Input
                        placeholder={localization.auth.namePlaceholder}
                        required
                        variant={
                          variant === "transparent" ? "primary" : "secondary"
                        }
                      />

                      <field.AuthFormFieldError />
                    </TextField>
                  )}
                </form.AppField>
              )}

              <form.AppField
                name="email"
                validators={{
                  onChange: ({ value }) =>
                    validateEmailAddress(value, {
                      invalidMessage: localization.auth.invalidEmail,
                      requiredMessage: localization.auth.fieldRequired
                    })
                }}
              >
                {(field) => (
                  <TextField
                    name={field.name}
                    type="email"
                    autoComplete="email"
                    isDisabled={isPending}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                    isInvalid={
                      isAuthFormFieldInvalid(field.state.meta) || undefined
                    }
                    validationBehavior="aria"
                  >
                    <Label>{localization.auth.email}</Label>

                    <Input
                      placeholder={localization.auth.emailPlaceholder}
                      required
                      variant={
                        variant === "transparent" ? "primary" : "secondary"
                      }
                    />

                    <field.AuthFormFieldError />
                  </TextField>
                )}
              </form.AppField>

              {additionalFields?.map(
                (field) =>
                  field.signUp === "above" && (
                    <AdditionalField
                      key={field.name}
                      name={field.name}
                      field={field}
                      isPending={isPending}
                      optionalLabel={localization.auth.optional}
                      variant={variant}
                    />
                  )
              )}

              <form.AppField
                name="password"
                validators={{
                  onChange: ({ value }) =>
                    validateStringLength(value, {
                      maxLength: emailAndPassword?.maxPasswordLength,
                      maxLengthMessage: localization.auth.tooLong.replace(
                        "{{max}}",
                        String(emailAndPassword?.maxPasswordLength)
                      ),
                      minLength: emailAndPassword?.minPasswordLength,
                      minLengthMessage: localization.auth.tooShort.replace(
                        "{{min}}",
                        String(emailAndPassword?.minPasswordLength)
                      ),
                      requiredMessage: localization.auth.fieldRequired
                    })
                }}
              >
                {(field) => {
                  const isInvalid =
                    isAuthFormFieldInvalid(field.state.meta) || isCompromised

                  return (
                    <TextField
                      minLength={emailAndPassword?.minPasswordLength}
                      maxLength={emailAndPassword?.maxPasswordLength}
                      name={field.name}
                      autoComplete="new-password"
                      isDisabled={isPending}
                      onBlur={field.handleBlur}
                      value={field.state.value}
                      onChange={(value) => {
                        field.handleChange(value)
                        setIsCompromised(false)
                      }}
                      isInvalid={isInvalid || undefined}
                      validationBehavior="aria"
                    >
                      <Label>{localization.auth.password}</Label>

                      <InputGroup
                        variant={
                          variant === "transparent" ? "primary" : "secondary"
                        }
                      >
                        <InputGroup.Input
                          placeholder={localization.auth.passwordPlaceholder}
                          type={isPasswordVisible ? "text" : "password"}
                          name="password"
                          required
                        />

                        <InputGroup.Suffix className="px-0">
                          <Button
                            isIconOnly
                            aria-label={
                              isPasswordVisible
                                ? localization.auth.hidePassword
                                : localization.auth.showPassword
                            }
                            size="sm"
                            variant="ghost"
                            onPress={() =>
                              setIsPasswordVisible(!isPasswordVisible)
                            }
                            isDisabled={isPending}
                          >
                            {isPasswordVisible ? <EyeSlash /> : <Eye />}
                          </Button>
                        </InputGroup.Suffix>
                      </InputGroup>

                      {isCompromised ? (
                        <FieldError>
                          {localization.auth.passwordCompromised}
                        </FieldError>
                      ) : (
                        <field.AuthFormFieldError />
                      )}

                      <PasswordStrengthMeter password={field.state.value} />
                    </TextField>
                  )
                }}
              </form.AppField>

              {emailAndPassword?.confirmPassword && (
                <form.AppField
                  name="confirmPassword"
                  validators={{
                    onChangeListenTo: ["password"],
                    onChange: ({ fieldApi, value }) =>
                      validateStringLength(value, {
                        maxLength: emailAndPassword?.maxPasswordLength,
                        maxLengthMessage: localization.auth.tooLong.replace(
                          "{{max}}",
                          String(emailAndPassword?.maxPasswordLength)
                        ),
                        minLength: emailAndPassword?.minPasswordLength,
                        minLengthMessage: localization.auth.tooShort.replace(
                          "{{min}}",
                          String(emailAndPassword?.minPasswordLength)
                        ),
                        requiredMessage: localization.auth.fieldRequired
                      }) ??
                      validateMatchingValue(
                        value,
                        fieldApi.form.getFieldValue("password"),
                        localization.auth.passwordsDoNotMatch
                      )
                  }}
                >
                  {(field) => (
                    <TextField
                      minLength={emailAndPassword?.minPasswordLength}
                      maxLength={emailAndPassword?.maxPasswordLength}
                      name={field.name}
                      autoComplete="new-password"
                      isDisabled={isPending}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={field.handleChange}
                      isInvalid={
                        isAuthFormFieldInvalid(field.state.meta) || undefined
                      }
                      validationBehavior="aria"
                    >
                      <Label>{localization.auth.confirmPassword}</Label>

                      <InputGroup
                        variant={
                          variant === "transparent" ? "primary" : "secondary"
                        }
                      >
                        <InputGroup.Input
                          name="confirmPassword"
                          placeholder={
                            localization.auth.confirmPasswordPlaceholder
                          }
                          type={isConfirmPasswordVisible ? "text" : "password"}
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
                              setIsConfirmPasswordVisible(
                                !isConfirmPasswordVisible
                              )
                            }
                            isDisabled={isPending}
                          >
                            {isConfirmPasswordVisible ? <EyeSlash /> : <Eye />}
                          </Button>
                        </InputGroup.Suffix>
                      </InputGroup>

                      <field.AuthFormFieldError />
                    </TextField>
                  )}
                </form.AppField>
              )}

              {additionalFields?.map(
                (field) =>
                  field.signUp &&
                  field.signUp !== "above" && (
                    <AdditionalField
                      key={field.name}
                      name={field.name}
                      field={field}
                      isPending={isPending}
                      optionalLabel={localization.auth.optional}
                      variant={variant}
                    />
                  )
              )}

              {Captcha && <div className="flex justify-center">{Captcha}</div>}

              <div className="flex flex-col gap-3">
                <form.AuthFormSubmitButton
                  className="w-full"
                  isDisabled={isPending}
                >
                  {localization.auth.signUp}
                </form.AuthFormSubmitButton>

                {plugins.flatMap((plugin) =>
                  plugin.authButtons?.map((AuthButton, index) => (
                    <AuthButton
                      key={`${plugin.id}-${index.toString()}`}
                      view="signUp"
                    />
                  ))
                )}
              </div>
            </form.AuthFormRoot>
          </form.AppForm>
        )}

        {socialPosition === "bottom" && (
          <>
            {showSeparator && (
              <FieldSeparator>{localization.auth.or}</FieldSeparator>
            )}

            {!!socialProviders?.length && (
              <ProviderButtons socialLayout={socialLayout} view="signUp" />
            )}
          </>
        )}
      </Card.Content>

      <Card.Footer className="flex-col gap-3">
        <Description className="text-sm">
          {localization.auth.alreadyHaveAnAccount}{" "}
          <Link
            href={getAuthLinkURL(
              `${basePaths.auth}/${viewPaths.auth.signIn}`,
              redirectTo
            )}
            className="text-accent no-underline hover:underline decoration-accent-hover"
          >
            {localization.auth.signIn}
          </Link>
        </Description>
      </Card.Footer>
    </Card>
  )
}
