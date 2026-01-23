"use client"

import { useAuth } from "@better-auth-ui/react"
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
import { Spinner } from "@/components/ui/spinner"
import { useSignInMagicLink } from "@/hooks/auth/use-sign-in-magic-link"
import { useSignInSocial } from "@/hooks/auth/use-sign-in-social"
import { cn } from "@/lib/utils"
import { MagicLinkButton } from "./magic-link-button"
import { ProviderButtons, type SocialLayout } from "./provider-buttons"

export type MagicLinkProps = {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
}

/**
 * Render a card-based sign-in form that sends an email magic link and optionally shows social provider buttons.
 *
 * @param className - Additional CSS class names applied to the card container
 * @param socialLayout - Layout style for social provider buttons
 * @param socialPosition - Position of social provider buttons; `"top"` or `"bottom"`. Defaults to `"bottom"`.
 * @returns The magic-link sign-in UI as a JSX element
 */
export function MagicLink({
  className,
  socialLayout,
  socialPosition = "bottom",
  ...config
}: MagicLinkProps) {
  const { basePaths, localization, socialProviders, viewPaths, Link } =
    useAuth()
  const [{ email }, signInMagicLink, magicLinkPending] = useSignInMagicLink({
    onError: (error) => toast.error(error.message || error.statusText),
    onSuccess: () => toast.success(localization.auth.magicLinkSent)
  })
  const [_, signInSocial, socialPending] = useSignInSocial({
    onError: (error) => toast.error(error.message || error.statusText)
  })

  const isPending = magicLinkPending || socialPending

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
  }>({})

  const showSeparator = socialProviders && socialProviders.length > 0

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

          <form action={signInMagicLink}>
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

              <Field className="mt-1">
                <Button type="submit" disabled={isPending} className="w-full">
                  {isPending && <Spinner />}

                  {localization.auth.sendMagicLink}
                </Button>

                <MagicLinkButton
                  {...config}
                  view="magicLink"
                  isPending={isPending}
                />
              </Field>
            </FieldGroup>
          </form>

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

          <FieldDescription className="flex justify-center gap-1">
            {localization.auth.needToCreateAnAccount}

            <Link
              href={`${basePaths.auth}/${viewPaths.auth.signUp}`}
              className="underline underline-offset-4"
            >
              {localization.auth.signUp}
            </Link>
          </FieldDescription>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
