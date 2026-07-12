import { authMutationKeys } from "@better-auth-ui/core"
import { useAuth, useFetchOptions, useSignUpEmail } from "@better-auth-ui/react"
import { useIsMutating } from "@tanstack/react-query"
import { useState } from "react"
import { cn } from "../../lib/cn"
import { setPendingEmail } from "../../lib/pending-email"
import { useAuthNavigation } from "../../navigation/navigation-context"
import { Button } from "../../primitives/button"
import { Card, type CardVariant } from "../../primitives/card"
import { Description } from "../../primitives/description"
import { FieldError, Label, TextField } from "../../primitives/field"
import { Form } from "../../primitives/form"
import { Input, InputGroup } from "../../primitives/input"
import { Link } from "../../primitives/link"
import { Box } from "../../primitives/styled"
import { toast } from "../../primitives/toast"
import { Eye, EyeSlash } from "../../primitives/ui-icons"
import { FieldSeparator } from "./field-separator"
import { ProviderButtons, type SocialLayout } from "./provider-buttons"

export interface SignUpProps {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
  variant?: CardVariant
}

/**
 * Sign-up screen: name, email, password (and optional confirm password)
 * fields, optional social provider buttons, and password visibility
 * controls. Mirrors the heroui `SignUp`, adapted for React Native: fields
 * are controlled state (no `FormData`), the verify-email hand-off uses the
 * in-memory pending-email store (no `sessionStorage`), and navigation goes
 * through the adapter.
 */
export function SignUp({
  className,
  socialLayout,
  socialPosition = "bottom",
  variant
}: SignUpProps) {
  const {
    authClient,
    emailAndPassword,
    localization,
    plugins,
    redirectTo,
    socialProviders,
    navigate
  } = useAuth()

  const captcha = plugins.find(
    (plugin) => plugin.captchaComponent
  )?.captchaComponent

  const navigation = useAuthNavigation()
  const { fetchOptions, resetFetchOptions } = useFetchOptions()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const { mutate: signUpEmail } = useSignUpEmail(authClient, {
    onError: () => {
      setPassword("")
      setConfirmPassword("")
      resetFetchOptions()
    },
    onSuccess: (_data, { email: submittedEmail }) => {
      if (emailAndPassword?.requireEmailVerification) {
        setPendingEmail(submittedEmail)
        navigation.push("verifyEmail")
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

  const handleSubmit = () => {
    if (emailAndPassword?.confirmPassword && password !== confirmPassword) {
      toast.danger(localization.auth.passwordsDoNotMatch)
      setPassword("")
      setConfirmPassword("")
      return
    }

    signUpEmail({
      name,
      email,
      password,
      fetchOptions
    })
  }

  const showSeparator = emailAndPassword?.enabled && !!socialProviders?.length
  const inputVariant = variant === "transparent" ? "primary" : "secondary"

  return (
    <Card className={cn("w-full max-w-sm gap-4", className)} variant={variant}>
      <Card.Header>
        <Card.Title className="mb-1">{localization.auth.signUp}</Card.Title>
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
          <Form onSubmit={handleSubmit} className="gap-4">
            {emailAndPassword.name !== false && (
              <TextField
                name="name"
                type="text"
                autoComplete="name"
                isDisabled={isPending}
                value={name}
                onChange={setName}
                validate={(value) => {
                  if (!value) return localization.auth.fieldRequired
                }}
              >
                <Label>{localization.auth.name}</Label>
                <Input
                  placeholder={localization.auth.namePlaceholder}
                  variant={inputVariant}
                  required
                />
                <FieldError />
              </TextField>
            )}

            <TextField
              name="email"
              type="email"
              autoComplete="email"
              isDisabled={isPending}
              value={email}
              onChange={setEmail}
              validate={(value) => {
                if (!value) return localization.auth.fieldRequired
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                  return localization.auth.invalidEmail
              }}
            >
              <Label>{localization.auth.email}</Label>
              <Input
                placeholder={localization.auth.emailPlaceholder}
                variant={inputVariant}
                required
              />
              <FieldError />
            </TextField>

            <TextField
              name="password"
              type="password"
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
              <InputGroup variant={inputVariant}>
                <InputGroup.Input
                  name="password"
                  placeholder={localization.auth.passwordPlaceholder}
                  type={isPasswordVisible ? "text" : "password"}
                  required
                />
                <InputGroup.Suffix className="px-0">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    isDisabled={isPending}
                    aria-label={
                      isPasswordVisible
                        ? localization.auth.hidePassword
                        : localization.auth.showPassword
                    }
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    {isPasswordVisible ? (
                      <EyeSlash width={18} height={18} color="#525252" />
                    ) : (
                      <Eye width={18} height={18} color="#525252" />
                    )}
                  </Button>
                </InputGroup.Suffix>
              </InputGroup>
              <FieldError />
            </TextField>

            {emailAndPassword?.confirmPassword && (
              <TextField
                name="confirmPassword"
                type="password"
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
                <InputGroup variant={inputVariant}>
                  <InputGroup.Input
                    name="confirmPassword"
                    placeholder={localization.auth.confirmPasswordPlaceholder}
                    type={isConfirmPasswordVisible ? "text" : "password"}
                    required
                  />
                  <InputGroup.Suffix className="px-0">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="ghost"
                      isDisabled={isPending}
                      aria-label={
                        isConfirmPasswordVisible
                          ? localization.auth.hidePassword
                          : localization.auth.showPassword
                      }
                      onPress={() =>
                        setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                      }
                    >
                      {isConfirmPasswordVisible ? (
                        <EyeSlash width={18} height={18} color="#525252" />
                      ) : (
                        <Eye width={18} height={18} color="#525252" />
                      )}
                    </Button>
                  </InputGroup.Suffix>
                </InputGroup>
                <FieldError />
              </TextField>
            )}

            {captcha}

            <Box className="gap-3">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isPending={isPending}
              >
                {localization.auth.signUp}
              </Button>

              {plugins.flatMap((plugin) =>
                (plugin.authButtons ?? []).map((AuthButton, index) => (
                  <AuthButton
                    key={`${plugin.id}-${index.toString()}`}
                    view="signUp"
                  />
                ))
              )}
            </Box>
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
          <Link view="signIn">{localization.auth.signIn}</Link>
        </Description>
      </Card.Footer>
    </Card>
  )
}
