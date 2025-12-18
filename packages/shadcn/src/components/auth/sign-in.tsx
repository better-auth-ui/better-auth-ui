"use client"

import type { AnyAuthConfig } from "@better-auth-ui/react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/hooks/auth/use-auth"
import { useSignInEmail } from "@/hooks/auth/use-sign-in-email"
import { useSignInSocial } from "@/hooks/auth/use-sign-in-social"
import { cn } from "@/lib/utils"
import { MagicLinkButton } from "./magic-link-button"
import { ProviderButtons, type SocialLayout } from "./provider-buttons"

export type SignInProps = AnyAuthConfig & {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
}

/**
 * Renders the Sign In UI with email/password, magic link, and social provider
 * options based on the provided `AuthConfig`.
 */
export function SignIn({
  className,
  socialLayout,
  socialPosition = "bottom",
  ...config
}: SignInProps) {
  const context = useAuth(config)

  const {
    basePaths,
    emailAndPassword,
    localization,
    magicLink,
    socialProviders,
    viewPaths,
    Link
  } = context

  const [{ email, password }, signInEmail, signInPending] =
    useSignInEmail(context)

  const [_, signInSocial, socialPending] = useSignInSocial(context)

  const isPending = signInPending || socialPending

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
  }>({})

  const showSeparator =
    emailAndPassword?.enabled && socialProviders && socialProviders.length > 0

  return (
    <Card className={cn("w-full max-w-sm py-4 md:py-6", className)}>
      <CardHeader className="px-4 md:px-6 -mb-4">
        <CardTitle className="text-xl">{localization.auth.signIn}</CardTitle>
      </CardHeader>

      <CardContent className="px-4 md:px-6">
        <FieldGroup className="gap-4">
          {socialPosition === "top" && (
            <>
              {socialProviders && socialProviders.length > 0 && (
                <ProviderButtons
                  {...config}
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
            <form action={signInEmail}>
              <FieldGroup className="gap-4">
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
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">
                      {localization.auth.password}
                    </FieldLabel>

                    {!emailAndPassword?.rememberMe &&
                      emailAndPassword?.forgotPassword && (
                        <Link
                          href={`${basePaths.auth}/${viewPaths.auth.forgotPassword}`}
                          className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-card-foreground!"
                        >
                          {localization.auth.forgotPasswordLink}
                        </Link>
                      )}
                  </div>

                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
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

                  <FieldError>{fieldErrors.password}</FieldError>
                </Field>

                {emailAndPassword.rememberMe && (
                  <Field className="my-1">
                    <div className="flex items-center">
                      <div className="flex items-center gap-2">
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

                      {emailAndPassword?.forgotPassword && (
                        <Link
                          href={`${basePaths.auth}/${viewPaths.auth.forgotPassword}`}
                          className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-card-foreground!"
                        >
                          {localization.auth.forgotPasswordLink}
                        </Link>
                      )}
                    </div>
                  </Field>
                )}

                <Field className="mt-1">
                  <Button type="submit" disabled={isPending}>
                    {isPending && <Spinner />}

                    {localization.auth.signIn}
                  </Button>

                  {magicLink && (
                    <MagicLinkButton
                      {...config}
                      view="signIn"
                      isPending={isPending}
                    />
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
                  {...config}
                  socialLayout={socialLayout}
                  signInSocial={signInSocial}
                  isPending={isPending}
                />
              )}
            </>
          )}

          {emailAndPassword?.enabled && (
            <FieldDescription className="flex justify-center gap-1">
              {localization.auth.needToCreateAnAccount}

              <Link
                href={`${basePaths.auth}/${viewPaths.auth.signUp}`}
                className="underline underline-offset-4"
              >
                {localization.auth.signUp}
              </Link>
            </FieldDescription>
          )}
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
