"use client"

import { useAuth } from "@better-auth-ui/react"
import { Check } from "lucide-react"
import { type FormEvent, useEffect, useState } from "react"
import { toast } from "sonner"

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
 * Render a card containing a form to view and update the authenticated user's email.
 *
 * Shows a loading skeleton until session data is available, displays the current
 * email as the form's default value, and sends a verification email to the
 * new address upon successful submission.
 *
 * @returns A JSX element rendering the change-email card and form
 */
export function ChangeEmail({ className }: ChangeEmailProps) {
  const { localization } = useAuth()
  const { data: sessionData, error: sessionError } = useSession()

  useEffect(() => {
    if (sessionError)
      toast.error(sessionError.error?.message || sessionError.message)
  }, [sessionError])

  const {
    mutate: changeEmail,
    isPending,
    isSuccess: changeEmailSuccess,
    error: changeEmailError
  } = useChangeEmail()

  useEffect(() => {
    if (changeEmailSuccess)
      toast.success(localization.settings.changeEmailSuccess)
  }, [changeEmailSuccess, localization.settings.changeEmailSuccess])

  useEffect(() => {
    if (changeEmailError)
      toast.error(changeEmailError.error?.message || changeEmailError.message)
  }, [changeEmailError])

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
  }>({})

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    changeEmail({ newEmail: formData.get("email") as string })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className={cn("w-full py-4 md:py-6 gap-4", className)}>
        <CardHeader className="px-4 md:px-6 gap-0">
          <CardTitle className="text-xl">
            {localization.settings.changeEmail}
          </CardTitle>
        </CardHeader>

        <CardContent className="px-4 md:px-6">
          <Field className="gap-1" data-invalid={!!fieldErrors.email}>
            <FieldLabel htmlFor="email">{localization.auth.email}</FieldLabel>

            {sessionData ? (
              <Input
                key={sessionData?.user?.email}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={sessionData?.user?.email}
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
