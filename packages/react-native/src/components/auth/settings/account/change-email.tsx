import {
  getFormFieldErrorMessage,
  validateEmailAddress
} from "@better-auth-ui/core"
import { useAuth, useChangeEmail, useSession } from "@better-auth-ui/react"
import { useEffect } from "react"
import { cn } from "../../../../lib/cn"
import { Card, type CardVariant } from "../../../../primitives/card"
import { FieldError, Label, TextField } from "../../../../primitives/field"
import {
  useAuthForm,
  clearAuthFormFieldServerError,
  isAuthFormFieldInvalid
} from "../../auth-form"
import { Input } from "../../../../primitives/input"
import { Skeleton } from "../../../../primitives/skeleton"
import { Box, Txt } from "../../../../primitives/styled"
import { toast } from "../../../../primitives/toast"

export interface ChangeEmailProps {
  className?: string
  variant?: CardVariant
}

/** Edit the session email through the shared native form. */
export function ChangeEmail({ className, variant }: ChangeEmailProps) {
  const { authClient, baseURL, basePaths, localization, viewPaths } = useAuth()
  const { data: session } = useSession(authClient)

  const { mutateAsync: changeEmail, isPending } = useChangeEmail(authClient, {
    meta: { errorPresentation: "inline" },
    onSuccess: () => toast.success(localization.settings.changeEmailSuccess)
  })

  const form = useAuthForm({
    defaultValues: { email: session?.user.email ?? "" },
    onSubmit: async ({ value }) => {
      await changeEmail({
        newEmail: value.email.trim(),
        callbackURL: `${baseURL}${basePaths.settings}/${viewPaths.settings.account}`
      })
    }
  })
  useEffect(() => {
    form.reset({ email: session?.user.email ?? "" })
  }, [form, session?.user.email])

  return (
    <Box>
      <Txt className={cn("text-sm font-semibold mb-3 text-foreground")}>
        {localization.settings.changeEmail}
      </Txt>

      <Card className={cn("gap-4", className)} variant={variant}>
        <Card.Content>
          <form.AppForm>
            <form.AuthFormRoot
              serverErrorMessage={localization.errors.generic}
              className="gap-4"
            >
              <form.AppField
                name="email"
                validators={{
                  onChange: ({ value }) =>
                    validateEmailAddress(value, {
                      requiredMessage: localization.auth.fieldRequired,
                      invalidMessage: localization.auth.invalidEmail
                    })
                }}
              >
                {(field) => (
                  <TextField
                    type="email"
                    autoComplete="email"
                    isDisabled={isPending || !session}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(value) => {
                      clearAuthFormFieldServerError(form, field.name)
                      field.handleChange(value)
                    }}
                    error={
                      isAuthFormFieldInvalid(field.state.meta)
                        ? getFormFieldErrorMessage(field.state.meta.errors)
                        : undefined
                    }
                  >
                    <Label>{localization.auth.email}</Label>

                    {session ? (
                      <Input
                        placeholder={localization.auth.emailPlaceholder}
                        variant={
                          variant === "transparent" ? "primary" : "secondary"
                        }
                        required
                      />
                    ) : (
                      <Skeleton className="h-10 w-full rounded-xl" />
                    )}

                    <FieldError />
                  </TextField>
                )}
              </form.AppField>

              <Box className="items-end">
                <form.AuthFormSubmitButton
                  isPending={isPending}
                  isDisabled={!session}
                  size="sm"
                >
                  {localization.settings.updateEmail}
                </form.AuthFormSubmitButton>
              </Box>
            </form.AuthFormRoot>
          </form.AppForm>
        </Card.Content>
      </Card>
    </Box>
  )
}
