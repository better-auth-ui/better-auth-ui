"use client"

import { type AnyAuthConfig, useChangeEmail } from "@better-auth-ui/react"
import { Check } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/hooks/auth/use-auth"
import { useSession } from "@/hooks/auth/use-session"
import { cn } from "@/lib/utils"

export type ChangeEmailProps = AnyAuthConfig & {
  className?: string
}

/**
 * Display and edit the authenticated user's email address in a card-based form.
 *
 * Renders a loading skeleton while the session is pending. When loaded, shows
 * the current email address and a form to update it. A verification email will
 * be sent to the new address upon submission.
 *
 * @returns A JSX element containing the change email card and form
 */
export function ChangeEmail({ className, ...config }: ChangeEmailProps) {
  const context = useAuth(config)
  const { localization } = context
  const { data: sessionData } = useSession(context)

  const [state, formAction, isPending] = useChangeEmail(context)

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
  }>({})

  return (
    <form action={formAction}>
      <Card className={cn("w-full py-4 md:py-6 gap-4 md:gap-6", className)}>
        <CardHeader className="px-4 md:px-6 gap-0">
          <CardTitle className="text-xl">
            {localization.settings.changeEmail}
          </CardTitle>
        </CardHeader>

        <CardContent className="px-4 md:px-6 grid gap-4 md:gap-6">
          <Field className="gap-1">
            <FieldLabel htmlFor="email">{localization.auth.email}</FieldLabel>

            {sessionData ? (
              <Input
                key={sessionData?.user?.email}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={sessionData?.user?.email || state.email}
                placeholder={localization.auth.emailPlaceholder}
                disabled={isPending}
                required
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
            ) : (
              <Skeleton className="h-9 w-full" />
            )}

            <FieldError>{fieldErrors.email}</FieldError>
          </Field>
        </CardContent>

        <CardFooter className="px-4 md:px-6">
          <Button type="submit" disabled={isPending || !sessionData}>
            {isPending ? <Spinner /> : <Check />}

            {localization.settings.updateEmail}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
