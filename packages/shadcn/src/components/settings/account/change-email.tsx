"use client"

import { useAuth } from "@better-auth-ui/react"
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
import { useSession } from "@/hooks/auth/use-session"
import { useChangeEmail } from "@/hooks/settings/use-change-email"
import { cn } from "@/lib/utils"

export type ChangeEmailProps = {
  className?: string
}

/**
 * Render a card-based form for viewing and updating the authenticated user's email.
 *
 * Shows a loading skeleton while session data is pending. When a session is available,
 * displays the current email in an editable field and captures inline validation messages.
 * Submitting the form triggers sending a verification email to the new address.
 *
 * @returns A JSX element containing the change-email card and form
 */
export function ChangeEmail({ className }: ChangeEmailProps) {
  const { localization } = useAuth()
  const { data: sessionData } = useSession()

  const [state, formAction, isPending] = useChangeEmail()

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
