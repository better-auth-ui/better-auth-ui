"use client"

import {
  useAuth,
  useFetchOptions,
  useRequestPasswordReset
} from "@better-auth-ui/react"
import { type SyntheticEvent, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export type ForgotPasswordProps = {
  className?: string
}

/**
 * Render a card-based "Forgot Password" form that sends a password-reset email.
 *
 * The form displays an email input, submit button, and a link back to sign-in.
 * Toasts are displayed on success or error via the `useForgotPassword` hook.
 *
 * @param className - Optional additional CSS class names applied to the card
 * @returns The forgot-password form UI as a JSX element
 */
export function ForgotPassword({ className }: ForgotPasswordProps) {
  const {
    authClient,
    baseURL,
    basePaths,
    localization,
    plugins,
    viewPaths,
    Link
  } = useAuth()

  const { fetchOptions, resetFetchOptions } = useFetchOptions()

  const { mutate: requestPasswordReset, isPending } = useRequestPasswordReset(
    authClient,
    {
      onError: () => {
        resetFetchOptions()
      },
      onSuccess: () => toast.success(localization.auth.passwordResetEmailSent)
    }
  )

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    requestPasswordReset({
      email: formData.get("email") as string,
      redirectTo: `${baseURL}${basePaths.auth}/${viewPaths.auth.resetPassword}`,
      fetchOptions
    })
  }

  const Captcha = plugins.find(
    (plugin) => plugin.captchaComponent
  )?.captchaComponent

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
  }>({})

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {localization.auth.forgotPassword}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field data-invalid={!!fieldErrors.email}>
              <FieldLabel htmlFor="email">{localization.auth.email}</FieldLabel>

              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
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
                  const el = e.target as HTMLInputElement
                  const msg = el.validity.valueMissing
                    ? localization.auth.fieldRequired
                    : localization.auth.invalidEmail

                  setFieldErrors((prev) => ({
                    ...prev,
                    email: msg
                  }))
                }}
                aria-invalid={!!fieldErrors.email}
              />

              <FieldError>{fieldErrors.email}</FieldError>
            </Field>

            {Captcha && <div className="flex justify-center">{Captcha}</div>}

            <div className="flex flex-col gap-3">
              <Button type="submit" disabled={isPending}>
                {isPending && <Spinner />}

                {localization.auth.sendResetLink}
              </Button>
            </div>
          </FieldGroup>
        </form>

        <div className="flex flex-col gap-3 items-center w-full mt-4">
          <FieldDescription className="text-center">
            {localization.auth.rememberYourPassword}{" "}
            <Link
              href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
              className="underline underline-offset-4"
            >
              {localization.auth.signIn}
            </Link>
          </FieldDescription>
        </div>
      </CardContent>
    </Card>
  )
}
