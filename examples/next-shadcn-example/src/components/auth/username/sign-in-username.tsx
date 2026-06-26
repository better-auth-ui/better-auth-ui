"use client"

import { authMutationKeys } from "@better-auth-ui/core"
import {
  type UsernameAuthClient,
  useAuth,
  useAuthPlugin,
  useFetchOptions,
  useSignInEmail,
  useSignInUsername
} from "@better-auth-ui/react"
import { useIsMutating } from "@tanstack/react-query"
import { type SyntheticEvent, useState } from "react"
import {
  ProviderButtons,
  type SocialLayout
} from "@/components/auth/provider-buttons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldSeparator
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { usernamePlugin } from "@/lib/auth/username-plugin"
import { cn } from "@/lib/utils"

export type SignInUsernameProps = {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

/**
 * Render the username-based sign-in form. Identical to the built-in `<SignIn>`
 * design but routes non-email inputs through `signInUsername` instead of
 * `signInEmail`.
 */
export function SignInUsername({
  className,
  socialLayout,
  socialPosition = "bottom"
}: SignInUsernameProps) {
  const {
    authClient,
    basePaths,
    emailAndPassword,
    localization,
    plugins,
    redirectTo,
    socialProviders,
    viewPaths,
    navigate,
    Link
  } = useAuth<UsernameAuthClient>()

  const { fetchOptions, resetFetchOptions } = useFetchOptions()

  const { localization: usernameLocalization } = useAuthPlugin(usernamePlugin)

  const [password, setPassword] = useState("")

  const { mutate: signInEmail, isPending: isSignInEmailPending } =
    useSignInEmail(authClient, {
      onError: (error, { email }) => {
        setPassword("")

        if (error.error?.code === "EMAIL_NOT_VERIFIED") {
          sessionStorage.setItem("better-auth-ui.verify-email", email)
          navigate({
            to: `${basePaths.auth}/${viewPaths.auth.verifyEmail}`
          })
        }

        resetFetchOptions()
      },
      onSuccess: () => {
        sessionStorage.removeItem("better-auth-ui.verify-email")
        navigate({ to: redirectTo })
      }
    })

  const { mutate: signInUsername, isPending: isSignInUsernamePending } =
    useSignInUsername(authClient, {
      onError: (error) => {
        setPassword("")

        if (error.error?.code === "EMAIL_NOT_VERIFIED") {
          sessionStorage.removeItem("better-auth-ui.verify-email")

          navigate({
            to: `${basePaths.auth}/${viewPaths.auth.verifyEmail}`
          })
        }

        resetFetchOptions()
      },
      onSuccess: () => {
        sessionStorage.removeItem("better-auth-ui.verify-email")
        navigate({ to: redirectTo })
      }
    })

  const signInMutating = useIsMutating({
    mutationKey: authMutationKeys.signIn.all
  })
  const signUpMutating = useIsMutating({
    mutationKey: authMutationKeys.signUp.all
  })
  const isPending = signInMutating + signUpMutating > 0
  const isSignInPending = isSignInEmailPending || isSignInUsernamePending

  const Captcha = plugins.find(
    (plugin) => plugin.captchaComponent
  )?.captchaComponent

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
  }>({})

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const rememberMe = formData.get("rememberMe") === "on"

    if (isEmail(email)) {
      signInEmail({
        email,
        password,
        ...(emailAndPassword?.rememberMe ? { rememberMe } : {}),
        fetchOptions
      })
    } else {
      signInUsername({
        username: email,
        password,
        ...(emailAndPassword?.rememberMe ? { rememberMe } : {}),
        fetchOptions
      })
    }
  }

  const showSeparator =
    emailAndPassword?.enabled && socialProviders && socialProviders.length > 0

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {localization.auth.signIn}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-6">
          {socialPosition === "top" && (
            <>
              {socialProviders && socialProviders.length > 0 && (
                <ProviderButtons socialLayout={socialLayout} />
              )}

              {showSeparator && (
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card m-0 text-xs flex items-center">
                  {localization.auth.or}
                </FieldSeparator>
              )}
            </>
          )}

          {emailAndPassword?.enabled && (
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field data-invalid={!!fieldErrors.email}>
                  <Label htmlFor="email">{usernameLocalization.username}</Label>

                  <Input
                    id="email"
                    name="email"
                    type="text"
                    autoComplete="username"
                    placeholder={
                      usernameLocalization.usernameOrEmailPlaceholder
                    }
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
                        email: localization.auth.fieldRequired
                      }))
                    }}
                    aria-invalid={!!fieldErrors.email}
                  />

                  <FieldError>{fieldErrors.email}</FieldError>
                </Field>

                <Field data-invalid={!!fieldErrors.password}>
                  <Label htmlFor="password">{localization.auth.password}</Label>

                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)

                      setFieldErrors((prev) => ({
                        ...prev,
                        password: undefined
                      }))
                    }}
                    placeholder={localization.auth.passwordPlaceholder}
                    required
                    minLength={emailAndPassword?.minPasswordLength}
                    maxLength={emailAndPassword?.maxPasswordLength}
                    disabled={isPending}
                    onInvalid={(e) => {
                      e.preventDefault()
                      const el = e.target as HTMLInputElement
                      const min = emailAndPassword?.minPasswordLength
                      const max = emailAndPassword?.maxPasswordLength
                      const msg = el.validity.valueMissing
                        ? localization.auth.fieldRequired
                        : el.validity.tooShort
                          ? localization.auth.tooShort.replace(
                              "{{min}}",
                              String(min)
                            )
                          : localization.auth.tooLong.replace(
                              "{{max}}",
                              String(max)
                            )

                      setFieldErrors((prev) => ({
                        ...prev,
                        password: msg
                      }))
                    }}
                    aria-invalid={!!fieldErrors.password}
                  />

                  <FieldError>{fieldErrors.password}</FieldError>
                </Field>

                {emailAndPassword.rememberMe && (
                  <Field className="my-1">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="rememberMe"
                        name="rememberMe"
                        disabled={isPending}
                      />

                      <Label
                        htmlFor="rememberMe"
                        className="cursor-pointer text-sm font-normal"
                      >
                        {localization.auth.rememberMe}
                      </Label>
                    </div>
                  </Field>
                )}

                {Captcha && (
                  <div className="flex justify-center">{Captcha}</div>
                )}

                <div className="flex flex-col gap-3">
                  <Button type="submit" disabled={isPending}>
                    {isSignInPending && <Spinner />}

                    {localization.auth.signIn}
                  </Button>

                  {plugins.flatMap((plugin) =>
                    (plugin.authButtons ?? []).map((AuthButton, index) => (
                      <AuthButton
                        key={`${plugin.id}-${index.toString()}`}
                        view="signIn"
                      />
                    ))
                  )}
                </div>
              </FieldGroup>
            </form>
          )}

          {socialPosition === "bottom" && (
            <>
              {showSeparator && (
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card text-xs flex items-center">
                  {localization.auth.or}
                </FieldSeparator>
              )}

              {socialProviders && socialProviders.length > 0 && (
                <ProviderButtons socialLayout={socialLayout} />
              )}
            </>
          )}
        </div>

        <div className="flex flex-col gap-3 items-center w-full mt-4">
          {emailAndPassword?.enabled && emailAndPassword?.forgotPassword && (
            <Link
              href={`${basePaths.auth}/${viewPaths.auth.forgotPassword}`}
              className="self-center text-sm underline-offset-4 hover:underline"
            >
              {localization.auth.forgotPasswordLink}
            </Link>
          )}

          {emailAndPassword?.enabled && (
            <FieldDescription className="text-center">
              {localization.auth.needToCreateAnAccount}{" "}
              <Link
                href={`${basePaths.auth}/${viewPaths.auth.signUp}`}
                className="underline underline-offset-4"
              >
                {localization.auth.signUp}
              </Link>
            </FieldDescription>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
