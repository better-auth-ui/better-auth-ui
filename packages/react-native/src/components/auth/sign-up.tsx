import { getAuthButtonKey } from "@better-auth-ui/react"
import {
  authMutationKeys,
  getAdditionalFieldDefaultValues,
  getAdditionalFieldSubmitValues,
  getAuthCallbackURL,
  isPasswordCompromisedError,
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
import { useIsMutating } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { cn } from "../../lib/cn"
import { setPendingEmail } from "../../lib/pending-email"
import { useAuthNavigation } from "../../navigation/navigation-context"
import { Card, type CardVariant } from "../../primitives/card"
import { Link } from "../../primitives/link"
import { Description } from "../../primitives/description"
import { getAuthAdditionalFieldValidators, useAuthForm } from "./auth-form"
import { FieldSeparator } from "./field-separator"
import { ProviderButtons, type SocialLayout } from "./provider-buttons"

export interface SignUpProps {
  verificationRedirectTo?: string
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
  variant?: CardVariant
  onSignUpSuccess?: () => void
}

export function SignUp({
  className,
  socialLayout,
  socialPosition = "bottom",
  variant,
  onSignUpSuccess,
  verificationRedirectTo
}: SignUpProps) {
  const {
    additionalFields,
    authClient,
    baseURL,
    emailAndPassword,
    localization,
    plugins,
    redirectTo,
    socialProviders,
    navigate
  } = useAuth()
  const navigation = useAuthNavigation()
  const { fetchOptions, resetFetchOptions } = useFetchOptions()
  const [isCompromised, setIsCompromised] = useState(false)
  const fields = useMemo(
    () => additionalFields?.filter((field) => field.signUp) ?? [],
    [additionalFields]
  )
  const { mutateAsync: signUpEmail } = useSignUpEmail(authClient, {
    onError: (error) => {
      setIsCompromised(isPasswordCompromisedError(error))
      form.setFieldValue("password", "")
      form.setFieldValue("confirmPassword", "")
      resetFetchOptions()
    },
    onSuccess: (_data, { email }) => {
      if (emailAndPassword?.requireEmailVerification) {
        setPendingEmail(email)
        navigation.push("verifyEmail", {
          params: { redirectTo: verificationRedirectTo ?? redirectTo }
        })
      } else if (onSignUpSuccess) onSignUpSuccess()
      else navigate({ to: redirectTo })
    }
  })
  const form = useAuthForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      additionalFields: getAdditionalFieldDefaultValues(fields)
    },
    onSubmit: async ({ value }) => {
      await signUpEmail({
        ...getAdditionalFieldSubmitValues(fields, value.additionalFields),
        name: emailAndPassword?.name === false ? "" : value.name,
        email: value.email.trim(),
        password: value.password,
        callbackURL: getAuthCallbackURL(
          baseURL,
          verificationRedirectTo ?? redirectTo
        ),
        fetchOptions
      })
    }
  })
  const pendingSignIn = useIsMutating({
    mutationKey: authMutationKeys.signIn.all
  })
  const pendingSignUp = useIsMutating({
    mutationKey: authMutationKeys.signUp.all
  })
  const isPending = pendingSignIn + pendingSignUp > 0
  const passwordValidation = (value: string) =>
    validateStringLength(value, {
      requiredMessage: localization.auth.fieldRequired,
      minLength: emailAndPassword?.minPasswordLength,
      maxLength: emailAndPassword?.maxPasswordLength,
      minLengthMessage: localization.auth.tooShort.replace(
        "{{min}}",
        String(emailAndPassword?.minPasswordLength)
      ),
      maxLengthMessage: localization.auth.tooLong.replace(
        "{{max}}",
        String(emailAndPassword?.maxPasswordLength)
      )
    })
  const renderAdditionalFields = (position: "above" | "below") =>
    fields
      .filter((field) =>
        position === "above"
          ? field.signUp === "above"
          : field.signUp !== "above"
      )
      .map((configured) => (
        <form.AppField
          key={configured.name}
          name={`additionalFields.${configured.name}`}
          validators={getAuthAdditionalFieldValidators(
            configured,
            localization.auth.fieldRequired
          )}
        >
          {(field) => (
            <field.AuthFormAdditionalField
              field={configured}
              isPending={isPending}
              variant={variant}
              optionalLabel={localization.auth.optional}
            />
          )}
        </form.AppField>
      ))
  const providers = (
    <>
      {!!socialProviders?.length && (
        <ProviderButtons socialLayout={socialLayout} />
      )}
    </>
  )
  const separator =
    emailAndPassword?.enabled && !!socialProviders?.length ? (
      <FieldSeparator>{localization.auth.or}</FieldSeparator>
    ) : null
  return (
    <Card className={cn("w-full max-w-sm gap-4", className)} variant={variant}>
      <AuthPrompts view="signUp" />
      <Card.Header>
        <Card.Title>{localization.auth.signUp}</Card.Title>
      </Card.Header>
      <Card.Content className="gap-4">
        {socialPosition === "top" ? (
          <>
            {providers}
            {separator}
          </>
        ) : null}
        {emailAndPassword?.enabled ? (
          <form.AppForm>
            <form.AuthFormRoot className="gap-4">
              {emailAndPassword.name !== false ? (
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
                    <field.AuthFormTextField
                      label={localization.auth.name}
                      autoComplete="name"
                      isDisabled={isPending}
                      inputProps={{
                        placeholder: localization.auth.namePlaceholder
                      }}
                    />
                  )}
                </form.AppField>
              ) : null}
              <form.AppField
                name="email"
                validators={{
                  onChange: ({ value }) =>
                    validateEmailAddress(value, {
                      requiredMessage: localization.auth.fieldRequired,
                      invalidMessage: localization.auth.invalidEmail
                    })
                }}
              >
                {(field) => (
                  <field.AuthFormTextField
                    label={localization.auth.email}
                    type="email"
                    autoComplete="email"
                    isDisabled={isPending}
                    inputProps={{
                      placeholder: localization.auth.emailPlaceholder
                    }}
                  />
                )}
              </form.AppField>
              {renderAdditionalFields("above")}
              <form.AppField
                name="password"
                validators={{
                  onChange: ({ value }) => passwordValidation(value)
                }}
                listeners={{ onChange: () => setIsCompromised(false) }}
              >
                {(field) => (
                  <field.AuthFormPasswordField
                    label={localization.auth.password}
                    isPending={isPending}
                    strengthMeter
                    error={
                      isCompromised
                        ? localization.auth.passwordCompromised
                        : undefined
                    }
                  />
                )}
              </form.AppField>
              {emailAndPassword.confirmPassword ? (
                <form.AppField
                  name="confirmPassword"
                  validators={{
                    onChangeListenTo: ["password"],
                    onChange: ({ value, fieldApi }) =>
                      passwordValidation(value) ??
                      validateMatchingValue(
                        value,
                        fieldApi.form.getFieldValue("password"),
                        localization.auth.passwordsDoNotMatch
                      )
                  }}
                >
                  {(field) => (
                    <field.AuthFormPasswordField
                      label={localization.auth.confirmPassword}
                      isPending={isPending}
                    />
                  )}
                </form.AppField>
              ) : null}
              {renderAdditionalFields("below")}
              {
                plugins.find((plugin) => plugin.captchaComponent)
                  ?.captchaComponent
              }
              <form.AuthFormSubmitButton isPending={isPending}>
                {localization.auth.signUp}
              </form.AuthFormSubmitButton>
              {plugins.flatMap(
                (plugin) =>
                  plugin.authButtons?.map((AuthButton) => (
                    <AuthButton
                      key={getAuthButtonKey(plugin.id, AuthButton)}
                      view="signUp"
                    />
                  )) ?? []
              )}
            </form.AuthFormRoot>
          </form.AppForm>
        ) : null}
        {socialPosition === "bottom" ? (
          <>
            {separator}
            {providers}
          </>
        ) : null}
        <Description>
          {localization.auth.alreadyHaveAnAccount}{" "}
          <Link onPress={() => navigation.push("signIn")}>
            {localization.auth.signIn}
          </Link>
        </Description>
      </Card.Content>
    </Card>
  )
}
