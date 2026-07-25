"use client"

import { authMutationKeys } from "@better-auth-ui/core"
import {
  type MagicLinkAuthClient,
  useAuth,
  useAuthPlugin,
  useSignInMagicLink
} from "@better-auth-ui/react"
import { useIsMutating } from "@tanstack/react-query"
import { type SyntheticEvent, useState } from "react"

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
import { magicLinkPlugin } from "@/lib/auth/magic-link-plugin"
import { cn } from "@/lib/utils"
import { MAGIC_LINK_SENT_STORAGE_KEY } from "./magic-link-sent"
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
  socialPosition = "bottom"
}: MagicLinkProps) {
  const {
    authClient,
    basePaths,
    baseURL,
    emailAndPassword,
    localization,
    navigate,
    plugins,
    redirectTo,
    socialProviders,
    viewPaths,
    Link
  } = useAuth()
  const { localization: magicLinkLocalization, viewPaths: magicLinkViewPaths } =
    useAuthPlugin(magicLinkPlugin)

  const [email, setEmail] = useState("")

  const { mutate: signInMagicLink, isPending: signInMagicLinkPending } =
    useSignInMagicLink(authClient as MagicLinkAuthClient, {
      onSuccess: (_data, variables) => {
        sessionStorage.setItem(MAGIC_LINK_SENT_STORAGE_KEY, variables.email)
        navigate({
          to: `${basePaths.auth}/${magicLinkViewPaths.auth.magicLinkSent}`
        })
      }
    })

  const signInMutating = useIsMutating({
    mutationKey: authMutationKeys.signIn.all
  })
  const signUpMutating = useIsMutating({
    mutationKey: authMutationKeys.signUp.all
  })
  const isPending = signInMutating + signUpMutating > 0

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
  }>({})

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    signInMagicLink({ email, callbackURL: `${baseURL}${redirectTo}` })
  }

  const showSeparator = socialProviders && socialProviders.length > 0

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader>
        <CardTitle className="text-xl">{localization.auth.signIn}</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-6">
          {socialPosition === "top" && (
            <>
              {socialProviders && socialProviders.length > 0 && (
                <ProviderButtons socialLayout={socialLayout} view="magicLink" />
              )}

              {showSeparator && (
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card m-0 text-xs flex items-center">
                  {localization.auth.or}
                </FieldSeparator>
              )}
            </>
          )}

          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field data-invalid={!!fieldErrors.email}>
                <FieldLabel htmlFor="email">
                  {localization.auth.email}
                </FieldLabel>

                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)

                    setFieldErrors((prev) => ({
                      ...prev,
                      email: undefined
                    }))
                  }}
                  placeholder={localization.auth.emailPlaceholder}
                  required
                  disabled={isPending}
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

              <div className="flex flex-col gap-3">
                <Button type="submit" disabled={isPending}>
                  {signInMagicLinkPending && <Spinner />}

                  {magicLinkLocalization.sendMagicLink}
                </Button>

                {plugins.flatMap((plugin) =>
                  (plugin.authButtons ?? []).map((AuthButton, index) => (
                    <AuthButton
                      key={`${plugin.id}-${index.toString()}`}
                      view="magicLink"
                    />
                  ))
                )}
              </div>
            </FieldGroup>
          </form>

          {socialPosition === "bottom" && (
            <>
              {showSeparator && (
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card text-xs flex items-center">
                  {localization.auth.or}
                </FieldSeparator>
              )}

              {socialProviders && socialProviders.length > 0 && (
                <ProviderButtons socialLayout={socialLayout} view="magicLink" />
              )}
            </>
          )}
        </div>

        {emailAndPassword?.enabled && (
          <div className="flex flex-col gap-3 items-center w-full mt-4">
            <FieldDescription className="text-center">
              {localization.auth.needToCreateAnAccount}{" "}
              <Link
                href={`${basePaths.auth}/${viewPaths.auth.signUp}`}
                className="underline underline-offset-4"
              >
                {localization.auth.signUp}
              </Link>
            </FieldDescription>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
