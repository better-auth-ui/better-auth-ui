import {
  authMutationKeys,
  getAuthLinkURL,
  isPasswordCompromisedError,
  parseAdditionalFieldValue
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
  Form,
  Input,
  InputGroup,
  Label,
  Link,
  Spinner,
  TextField,
  toast
} from "@heroui/react"
import { useForm } from "@tanstack/react-form"
import { useIsMutating } from "@tanstack/react-query"
import { type FormEvent, useRef, useState } from "react"
import { AdditionalField } from "./additional-field"
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

  const { mutate: signUpEmail, isPending: signUpEmailPending } = useSignUpEmail(
    authClient,
    {
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
    }
  )

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
  const form = useForm({
    defaultValues: {
      confirmPassword: "",
      email: "",
      name: "",
      password: ""
    },
    onSubmit: ({ value }) => {
      if (
        emailAndPassword?.confirmPassword &&
        value.password !== value.confirmPassword
      ) {
        toast.danger(localization.auth.passwordsDoNotMatch)
        form.setFieldValue("password", "")
        form.setFieldValue("confirmPassword", "")
        return
      }

      signUpEmail({
        name: emailAndPassword?.name === false ? "" : value.name,
        email: value.email,
        password: value.password,
        ...additionalFieldValuesRef.current,
        fetchOptions
      })
    }
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

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
          return
        }
      }

      if (value !== undefined) {
        additionalFieldValues[field.name] = value
      }
    }

    additionalFieldValuesRef.current = additionalFieldValues
    await form.handleSubmit()
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
          <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {emailAndPassword.name !== false && (
              <form.Field name="name">
                {(field) => (
                  <TextField
                    name={field.name}
                    type="text"
                    autoComplete="name"
                    isDisabled={isPending}
                    value={field.state.value}
                    onChange={field.handleChange}
                    validate={(value) => {
                      if (!value) return localization.auth.fieldRequired
                    }}
                  >
                    <Label>{localization.auth.name}</Label>

                    <Input
                      placeholder={localization.auth.namePlaceholder}
                      required
                      variant={
                        variant === "transparent" ? "primary" : "secondary"
                      }
                    />

                    <FieldError />
                  </TextField>
                )}
              </form.Field>
            )}

            <form.Field name="email">
              {(field) => (
                <TextField
                  name={field.name}
                  type="email"
                  autoComplete="email"
                  isDisabled={isPending}
                  value={field.state.value}
                  onChange={field.handleChange}
                  validate={(value) => {
                    if (!value) return localization.auth.fieldRequired
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                      return localization.auth.invalidEmail
                  }}
                >
                  <Label>{localization.auth.email}</Label>

                  <Input
                    placeholder={localization.auth.emailPlaceholder}
                    required
                    variant={
                      variant === "transparent" ? "primary" : "secondary"
                    }
                  />

                  <FieldError />
                </TextField>
              )}
            </form.Field>

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

            <form.Field name="password">
              {(field) => (
                <TextField
                  minLength={emailAndPassword?.minPasswordLength}
                  maxLength={emailAndPassword?.maxPasswordLength}
                  name={field.name}
                  autoComplete="new-password"
                  isDisabled={isPending}
                  value={field.state.value}
                  onChange={(value) => {
                    field.handleChange(value)
                    setIsCompromised(false)
                  }}
                  isInvalid={isCompromised || undefined}
                  validate={(value) => {
                    if (!value) return localization.auth.fieldRequired
                    const min = emailAndPassword?.minPasswordLength
                    const max = emailAndPassword?.maxPasswordLength
                    if (min && value.length < min)
                      return localization.auth.tooShort.replace(
                        "{{min}}",
                        String(min)
                      )
                    if (max && value.length > max)
                      return localization.auth.tooLong.replace(
                        "{{max}}",
                        String(max)
                      )
                  }}
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
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
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
                    <FieldError />
                  )}

                  <PasswordStrengthMeter password={field.state.value} />
                </TextField>
              )}
            </form.Field>

            {emailAndPassword?.confirmPassword && (
              <form.Field name="confirmPassword">
                {(field) => (
                  <TextField
                    minLength={emailAndPassword?.minPasswordLength}
                    maxLength={emailAndPassword?.maxPasswordLength}
                    name={field.name}
                    autoComplete="new-password"
                    isDisabled={isPending}
                    value={field.state.value}
                    onChange={field.handleChange}
                    validate={(value) => {
                      if (!value) return localization.auth.fieldRequired
                      const min = emailAndPassword?.minPasswordLength
                      const max = emailAndPassword?.maxPasswordLength
                      if (min && value.length < min)
                        return localization.auth.tooShort.replace(
                          "{{min}}",
                          String(min)
                        )
                      if (max && value.length > max)
                        return localization.auth.tooLong.replace(
                          "{{max}}",
                          String(max)
                        )
                    }}
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

                    <FieldError />
                  </TextField>
                )}
              </form.Field>
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
              <Button type="submit" className="w-full" isPending={isPending}>
                {signUpEmailPending && <Spinner color="current" size="sm" />}

                {localization.auth.signUp}
              </Button>

              {plugins.flatMap((plugin) =>
                plugin.authButtons?.map((AuthButton, index) => (
                  <AuthButton
                    key={`${plugin.id}-${index.toString()}`}
                    view="signUp"
                  />
                ))
              )}
            </div>
          </Form>
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
