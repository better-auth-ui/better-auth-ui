import {
  authMutationKeys,
  parseAdditionalFieldValue
} from "@better-auth-ui/core"
import { useAuth, useFetchOptions, useSignUpEmail } from "@better-auth-ui/react"
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
import { useIsMutating } from "@tanstack/react-query"
import { type SyntheticEvent, useState } from "react"
import { AdditionalField } from "./additional-field"
import { FieldSeparator } from "./field-separator"
import { ProviderButtons, type SocialLayout } from "./provider-buttons"

export type SignUpProps = {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
  variant?: CardProps["variant"]
}

/**
 * Render a sign-up form with name, email, password (and optional confirm password) fields, optional social provider buttons, and password visibility controls.
 *
 * The component reflects request state by disabling inputs and showing a pending indicator during sign-up or social sign-in.
 *
 * @param className - Additional CSS classes applied to the outer card container
 * @param socialLayout - Social layout to apply to the provider buttons component
 * @param socialPosition - Position of social provider buttons relative to the form; `"top"` or `"bottom"` (default `"bottom"`)
 * @returns The sign-up form React element
 */
export function SignUp({
  className,
  socialLayout,
  socialPosition = "bottom",
  variant,
  ...props
}: SignUpProps & Omit<CardProps, "children">) {
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

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const { mutate: signUpEmail, isPending: signUpEmailPending } = useSignUpEmail(
    authClient,
    {
      onError: () => {
        setPassword("")
        setConfirmPassword("")
        resetFetchOptions()
      },
      onSuccess: () => {
        if (emailAndPassword?.requireEmailVerification) {
          toast.success(localization.auth.verifyYourEmail)
          navigate({ to: `${basePaths.auth}/${viewPaths.auth.signIn}` })
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

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    // `emailAndPassword.name === false` hides the name field and submits "".
    const name = (formData.get("name") as string | null) ?? ""
    const email = formData.get("email") as string

    if (emailAndPassword?.confirmPassword && password !== confirmPassword) {
      toast.danger(localization.auth.passwordsDoNotMatch)
      setPassword("")
      setConfirmPassword("")
      return
    }

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

    signUpEmail({
      name,
      email,
      password,
      ...additionalFieldValues,
      fetchOptions
    })
  }

  const showSeparator = emailAndPassword?.enabled && !!socialProviders?.length

  return (
    <Card
      className={cn("w-full max-w-sm gap-4 md:p-6", className)}
      variant={variant}
      {...props}
    >
      <Card.Header>
        <Card.Title className="text-xl font-semibold mb-1">
          {localization.auth.signUp}
        </Card.Title>
      </Card.Header>

      <Card.Content className="gap-4">
        {socialPosition === "top" && (
          <>
            {!!socialProviders?.length && (
              <ProviderButtons socialLayout={socialLayout} />
            )}

            {showSeparator && (
              <FieldSeparator>{localization.auth.or}</FieldSeparator>
            )}
          </>
        )}

        {emailAndPassword?.enabled && (
          <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {emailAndPassword.name !== false && (
              <TextField
                name="name"
                type="text"
                autoComplete="name"
                isDisabled={isPending}
                validate={(value) => {
                  if (!value) return localization.auth.fieldRequired
                }}
              >
                <Label>{localization.auth.name}</Label>

                <Input
                  placeholder={localization.auth.namePlaceholder}
                  required
                  variant={variant === "transparent" ? "primary" : "secondary"}
                />

                <FieldError />
              </TextField>
            )}

            <TextField
              name="email"
              type="email"
              autoComplete="email"
              isDisabled={isPending}
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
                variant={variant === "transparent" ? "primary" : "secondary"}
              />

              <FieldError />
            </TextField>

            {additionalFields?.map(
              (field) =>
                field.signUp === "above" && (
                  <AdditionalField
                    key={field.name}
                    name={field.name}
                    field={field}
                    isPending={isPending}
                    variant={variant}
                  />
                )
            )}

            <TextField
              minLength={emailAndPassword?.minPasswordLength}
              maxLength={emailAndPassword?.maxPasswordLength}
              name="password"
              autoComplete="new-password"
              isDisabled={isPending}
              value={password}
              onChange={setPassword}
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
                variant={variant === "transparent" ? "primary" : "secondary"}
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

              <FieldError />
            </TextField>

            {emailAndPassword?.confirmPassword && (
              <TextField
                minLength={emailAndPassword?.minPasswordLength}
                maxLength={emailAndPassword?.maxPasswordLength}
                name="confirmPassword"
                autoComplete="new-password"
                isDisabled={isPending}
                value={confirmPassword}
                onChange={setConfirmPassword}
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
                  variant={variant === "transparent" ? "primary" : "secondary"}
                >
                  <InputGroup.Input
                    name="confirmPassword"
                    placeholder={localization.auth.confirmPasswordPlaceholder}
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
                        setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
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

            {additionalFields?.map(
              (field) =>
                field.signUp &&
                field.signUp !== "above" && (
                  <AdditionalField
                    key={field.name}
                    name={field.name}
                    field={field}
                    isPending={isPending}
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
              <ProviderButtons socialLayout={socialLayout} />
            )}
          </>
        )}
      </Card.Content>

      <Card.Footer className="flex-col gap-3">
        <Description className="text-sm">
          {localization.auth.alreadyHaveAnAccount}{" "}
          <Link
            href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
            className="text-accent no-underline hover:underline decoration-accent-hover"
          >
            {localization.auth.signIn}
          </Link>
        </Description>
      </Card.Footer>
    </Card>
  )
}
