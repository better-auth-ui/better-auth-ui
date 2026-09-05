"use client"

import { getViewURL, validateEmailAddress } from "@better-auth-ui/core"
import { useAuth, useChangeEmail, useSession } from "@better-auth-ui/react"
import { useEffect } from "react"
import { toast } from "sonner"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { isAuthFormFieldInvalid, useAuthForm } from "../../auth-form"

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
  const { authClient, basePaths, baseURL, localization, viewPaths } = useAuth()
  const { data: session } = useSession(authClient)

  const { mutateAsync: changeEmail, isPending } = useChangeEmail(authClient, {
    onSuccess: () => toast.success(localization.settings.changeEmailSuccess)
  })

  const form = useAuthForm({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) =>
      await changeEmail({
        callbackURL: getViewURL(
          baseURL,
          basePaths.settings,
          viewPaths.settings.account
        ),
        newEmail: value.email
      })
  })

  useEffect(() => {
    if (session) form.reset({ email: session.user.email })
  }, [form, session])

  return (
    <div>
      <h2 className="text-sm font-semibold mb-3">
        {localization.settings.changeEmail}
      </h2>

      <form.AppForm>
        <form.AuthFormRoot>
          <Card className={cn(className)}>
            <CardContent className="flex flex-col gap-6">
              <form.AppField
                name="email"
                validators={{
                  onChange: ({ value }) =>
                    validateEmailAddress(value, {
                      invalidMessage: localization.auth.invalidEmail,
                      requiredMessage: localization.auth.fieldRequired
                    })
                }}
              >
                {(field) => {
                  const isInvalid = isAuthFormFieldInvalid(field.state.meta)
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="email">
                        {localization.auth.email}
                      </FieldLabel>
                      {session ? (
                        <Input
                          id="email"
                          name={field.name}
                          type="email"
                          autoComplete="email"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          placeholder={localization.auth.emailPlaceholder}
                          disabled={isPending}
                          required
                          aria-invalid={isInvalid}
                        />
                      ) : (
                        <Skeleton>
                          <Input className="invisible" />
                        </Skeleton>
                      )}
                      <field.AuthFormFieldError />
                    </Field>
                  )
                }}
              </form.AppField>
            </CardContent>

            <CardFooter>
              <form.AuthFormSubmitButton
                isPending={isPending}
                size="sm"
                disabled={isPending || !session}
              >
                {localization.settings.updateEmail}
              </form.AuthFormSubmitButton>
            </CardFooter>
          </Card>
        </form.AuthFormRoot>
      </form.AppForm>
    </div>
  )
}
