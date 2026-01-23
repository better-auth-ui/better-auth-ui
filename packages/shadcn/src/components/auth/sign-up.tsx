"use client"

import { useAuth } from "@better-auth-ui/react"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { useSignInSocial } from "@/hooks/auth/use-sign-in-social"
import { useSignUpEmail } from "@/hooks/auth/use-sign-up-email"
import { cn } from "@/lib/utils"
import { MagicLinkButton } from "./magic-link-button"
import { ProviderButtons, type SocialLayout } from "./provider-buttons"

export type SignUpProps = {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
}

/**
 * Renders a sign-up form with name, email, and password fields, optional social provider buttons, and submission handling.
 *
 * Submits credentials to the configured auth client and handles the response:
 * - If email verification is required, shows a notification and navigates to sign-in
 * - On success, refreshes the session and navigates to the configured redirect path
 * - On failure, displays error toasts
 * - Manages a pending state while the request is in-flight
 *
 * @param className - Additional CSS classes applied to the outer container
 * @param socialLayout - Social layout to apply to the component
 * @param socialPosition - Social position to apply to the component
 * @returns The sign-up form React element.
 */
export function SignUp({
  className,
  socialLayout,
  socialPosition = "bottom"
}: SignUpProps) {
  const {
    basePaths,
    emailAndPassword,
    localization,
    magicLink,
    socialProviders,
    viewPaths,
    Link
  } = useAuth()
  const [
    { name, email, password, confirmPassword },
    signUpEmail,
    signUpPending
  ] = useSignUpEmail()
  const [_, signInSocial, socialPending] = useSignInSocial({
    onError: (error) => toast.error(error.message || error.statusText)
  })

  const isPending = signUpPending || socialPending

  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false)

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
  }>({})

  const showSeparator =
    emailAndPassword?.enabled && socialProviders && socialProviders.length > 0

  return (
    <Card className={cn("w-full max-w-sm py-4 md:py-6", className)}>
      <CardHeader className="px-4 md:px-6 -mb-4">
        <CardTitle className="text-xl">{localization.auth.signUp}</CardTitle>
      </CardHeader>

      <CardContent className="px-4 md:px-6">
        <FieldGroup className="gap-4">
          {socialPosition === "top" && (
            <>
              {socialProviders && socialProviders.length > 0 && (
                <ProviderButtons
                  socialLayout={socialLayout}
                  signInSocial={signInSocial}
                  isPending={isPending}
                />
              )}

              {showSeparator && (
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card m-0 text-xs flex items-center">
                  {localization.auth.or}
                </FieldSeparator>
              )}
            </>
          )}

          {emailAndPassword?.enabled && (
            <form action={signUpEmail}>
              <FieldGroup className="gap-4">
                <Field className="gap-1">
                  <FieldLabel htmlFor="name">
                    {localization.auth.name}
                  </FieldLabel>

                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    defaultValue={name}
                    placeholder={localization.auth.namePlaceholder}
                    required
                    disabled={isPending}
                    onChange={() => {
                      setFieldErrors((prev) => ({
                        ...prev,
                        name: undefined
                      }))
                    }}
                    onInvalid={(e) => {
                      e.preventDefault()
                      setFieldErrors((prev) => ({
                        ...prev,
                        name: (e.target as HTMLInputElement).validationMessage
                      }))
                    }}
                    aria-invalid={!!fieldErrors.name}
                  />

                  <FieldError>{fieldErrors.name}</FieldError>
                </Field>

                <Field className="gap-1">
                  <FieldLabel htmlFor="email">
                    {localization.auth.email}
                  </FieldLabel>

                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    defaultValue={email}
                    placeholder={localization.auth.emailPlaceholder}
                    required
                    disabled={isPending}
                    onChange={() => {
                      setFieldErrors((prev) => ({
                        ...prev,
                        email: undefined
                      }))
                    }}
                    onInvalid={(e) => {
                      e.preventDefault()
                      setFieldErrors((prev) => ({
                        ...prev,
                        email: (e.target as HTMLInputElement).validationMessage
                      }))
                    }}
                    aria-invalid={!!fieldErrors.email}
                  />

                  <FieldError>{fieldErrors.email}</FieldError>
                </Field>

                <Field className="gap-1">
                  <FieldLabel htmlFor="password">
                    {localization.auth.password}
                  </FieldLabel>

                  <InputGroup>
                    <InputGroupInput
                      id="password"
                      name="password"
                      type={isPasswordVisible ? "text" : "password"}
                      autoComplete="new-password"
                      defaultValue={password}
                      placeholder={localization.auth.passwordPlaceholder}
                      required
                      minLength={emailAndPassword?.minPasswordLength}
                      maxLength={emailAndPassword?.maxPasswordLength}
                      disabled={isPending}
                      onChange={() => {
                        setFieldErrors((prev) => ({
                          ...prev,
                          password: undefined
                        }))
                      }}
                      onInvalid={(e) => {
                        e.preventDefault()

                        setFieldErrors((prev) => ({
                          ...prev,
                          password: (e.target as HTMLInputElement)
                            .validationMessage
                        }))
                      }}
                      aria-invalid={!!fieldErrors.password}
                    />

                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        aria-label={
                          isPasswordVisible
                            ? localization.auth.hidePassword
                            : localization.auth.showPassword
                        }
                        title={
                          isPasswordVisible
                            ? localization.auth.hidePassword
                            : localization.auth.showPassword
                        }
                        onClick={() => {
                          setIsPasswordVisible(!isPasswordVisible)
                        }}
                      >
                        {isPasswordVisible ? <EyeOff /> : <Eye />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>

                  <FieldError>{fieldErrors.password}</FieldError>
                </Field>

                {emailAndPassword?.confirmPassword && (
                  <Field className="gap-1">
                    <FieldLabel htmlFor="confirmPassword">
                      {localization.auth.confirmPassword}
                    </FieldLabel>

                    <InputGroup>
                      <InputGroupInput
                        id="confirmPassword"
                        name="confirmPassword"
                        type={isConfirmPasswordVisible ? "text" : "password"}
                        autoComplete="new-password"
                        defaultValue={confirmPassword}
                        placeholder={
                          localization.auth.confirmPasswordPlaceholder
                        }
                        required
                        minLength={emailAndPassword?.minPasswordLength}
                        maxLength={emailAndPassword?.maxPasswordLength}
                        disabled={isPending}
                        onChange={() => {
                          setFieldErrors((prev) => ({
                            ...prev,
                            confirmPassword: undefined
                          }))
                        }}
                        onInvalid={(e) => {
                          e.preventDefault()
                          setFieldErrors((prev) => ({
                            ...prev,
                            confirmPassword: (e.target as HTMLInputElement)
                              .validationMessage
                          }))
                        }}
                        aria-invalid={!!fieldErrors.confirmPassword}
                      />

                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          aria-label={
                            isConfirmPasswordVisible
                              ? localization.auth.hidePassword
                              : localization.auth.showPassword
                          }
                          title={
                            isConfirmPasswordVisible
                              ? localization.auth.hidePassword
                              : localization.auth.showPassword
                          }
                          onClick={() =>
                            setIsConfirmPasswordVisible(
                              !isConfirmPasswordVisible
                            )
                          }
                        >
                          {isConfirmPasswordVisible ? <EyeOff /> : <Eye />}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>

                    <FieldError>{fieldErrors.confirmPassword}</FieldError>
                  </Field>
                )}

                <Field className="mt-1">
                  <Button type="submit" disabled={isPending}>
                    {isPending && <Spinner />}

                    {localization.auth.signUp}
                  </Button>

                  {magicLink && (
                    <MagicLinkButton view="signUp" isPending={isPending} />
                  )}
                </Field>
              </FieldGroup>
            </form>
          )}

          {socialPosition === "bottom" && (
            <>
              {showSeparator && (
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card m-0 text-xs flex items-center">
                  {localization.auth.or}
                </FieldSeparator>
              )}

              {socialProviders && socialProviders.length > 0 && (
                <ProviderButtons
                  socialLayout={socialLayout}
                  signInSocial={signInSocial}
                  isPending={isPending}
                />
              )}
            </>
          )}

          {emailAndPassword?.enabled && (
            <FieldDescription className="flex justify-center gap-1">
              {localization.auth.alreadyHaveAnAccount}

              <Link
                href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
                className="underline underline-offset-4"
              >
                {localization.auth.signIn}
              </Link>
            </FieldDescription>
          )}
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
