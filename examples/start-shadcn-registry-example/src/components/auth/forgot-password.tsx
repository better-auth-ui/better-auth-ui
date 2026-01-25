import type { AnyAuthConfig } from "@better-auth-ui/react"
import { useState } from "react"

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
import { useAuth } from "@/hooks/auth/use-auth"
import { useForgotPassword } from "@/hooks/auth/use-forgot-password"
import { cn } from "@/lib/utils"

export type ForgotPasswordProps = AnyAuthConfig & {
  className?: string
}

/**
 * Renders a "Forgot Password" form with an email input and submit button.
 */
export function ForgotPassword({ className, ...config }: ForgotPasswordProps) {
  const context = useAuth(config)

  const { basePaths, localization, toast, viewPaths, Link } = context

  const { mutate, isPending } = useForgotPassword(context)

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
  }>({})

  return (
    <Card className={cn("w-full max-w-sm py-4 md:py-6", className)}>
      <CardHeader className="px-4 md:px-6 -mb-4">
        <CardTitle className="text-xl">
          {localization.auth.forgotPassword}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 md:px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const email = formData.get("email") as string

            mutate(
              { email },
              {
                onError: (error) =>
                  toast.error(error.message || error.statusText),
                onSuccess: () =>
                  toast.success(localization.auth.passwordResetEmailSent)
              }
            )
          }}
        >
          <FieldGroup className="gap-4">
            <Field className="gap-1">
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

                {localization.auth.sendResetLink}
              </Button>
            </Field>

            <FieldDescription className="flex justify-center gap-1">
              {localization.auth.rememberYourPassword}

              <Link
                href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
                className="underline underline-offset-4"
              >
                {localization.auth.signIn}
              </Link>
            </FieldDescription>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
