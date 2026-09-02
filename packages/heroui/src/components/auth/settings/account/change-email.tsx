import { getViewURL } from "@better-auth-ui/core"
import { useAuth, useChangeEmail, useSession } from "@better-auth-ui/react"
import {
  Card,
  type CardProps,
  cn,
  FieldError,
  Fieldset,
  Input,
  Label,
  Skeleton,
  Spinner,
  TextField,
  toast
} from "@heroui/react"
import { useEffect } from "react"
import { useAuthForm } from "../../auth-form"

export type ChangeEmailProps = {
  className?: string
  variant?: CardProps["variant"]
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
export function ChangeEmail({
  className,
  variant,
  ...props
}: ChangeEmailProps & Omit<CardProps, "children">) {
  const { authClient, basePaths, baseURL, localization, viewPaths } = useAuth()
  const { data: session } = useSession(authClient)

  const { mutate: changeEmail, isPending } = useChangeEmail(authClient, {
    onSuccess: () => toast.success(localization.settings.changeEmailSuccess)
  })

  const form = useAuthForm({
    defaultValues: { email: "" },
    onSubmit: ({ value }) =>
      changeEmail({
        newEmail: value.email,
        callbackURL: getViewURL(
          baseURL,
          basePaths.settings,
          viewPaths.settings.account
        )
      })
  })
  useEffect(() => {
    if (session) form.setFieldValue("email", session.user.email)
  }, [form.setFieldValue, session])

  return (
    <div>
      <h2 className={cn("text-sm font-semibold mb-3")}>
        {localization.settings.changeEmail}
      </h2>

      <Card className={cn("p-4 gap-4", className)} variant={variant} {...props}>
        <Card.Content>
          <form.AppForm>
            <form.AuthFormRoot>
              <Fieldset className="w-full gap-4">
                <Fieldset.Group>
                  <form.AppField name="email">
                    {(field) => (
                      <TextField
                        key={`${session?.user.id}-${session?.user.email}-email`}
                        name={field.name}
                        type="email"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={field.handleChange}
                        isDisabled={isPending || !session}
                      >
                        <Label>{localization.auth.email}</Label>

                        {session ? (
                          <Input
                            required
                            variant={
                              variant === "transparent"
                                ? "primary"
                                : "secondary"
                            }
                            autoComplete="email"
                            placeholder={localization.auth.emailPlaceholder}
                          />
                        ) : (
                          <Skeleton className="h-10 md:h-9 w-full rounded-xl" />
                        )}

                        <FieldError />
                      </TextField>
                    )}
                  </form.AppField>
                </Fieldset.Group>

                <Fieldset.Actions>
                  <form.AuthFormSubmitButton
                    isDisabled={!session || isPending}
                    size="sm"
                  >
                    {isPending && <Spinner color="current" size="sm" />}

                    {localization.settings.updateEmail}
                  </form.AuthFormSubmitButton>
                </Fieldset.Actions>
              </Fieldset>
            </form.AuthFormRoot>
          </form.AppForm>
        </Card.Content>
      </Card>
    </div>
  )
}
