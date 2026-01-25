import { useAuth, useChangeEmail, useSession } from "@better-auth-ui/react"
import { Check, Envelope } from "@gravity-ui/icons"
import {
  Button,
  Card,
  type CardProps,
  cn,
  FieldError,
  Fieldset,
  Form,
  InputGroup,
  Label,
  Skeleton,
  Spinner,
  TextField,
  toast
} from "@heroui/react"
import { type FormEvent, useEffect } from "react"

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
}: ChangeEmailProps & CardProps) {
  const { localization } = useAuth()
  const { data: sessionData, error: sessionError } = useSession()

  useEffect(() => {
    if (sessionError)
      toast.danger(sessionError.error?.message || sessionError.message)
  }, [sessionError])

  const { mutate: changeEmail, isPending, isSuccess, error } = useChangeEmail()

  useEffect(() => {
    if (isSuccess) toast.success(localization.settings.changeEmailSuccess)
  }, [isSuccess, localization.settings.changeEmailSuccess])

  useEffect(() => {
    if (error) toast.danger(error.error?.message || error.message)
  }, [error])

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    changeEmail({ newEmail: formData.get("email") as string })
  }

  return (
    <Card
      className={cn("p-4 md:p-6 gap-4", className)}
      variant={variant}
      {...props}
    >
      <Card.Header>
        <Card.Title className="text-xl">
          {localization.settings.changeEmail}
        </Card.Title>
      </Card.Header>

      <Card.Content>
        <Form onSubmit={handleSubmit}>
          <Fieldset className="w-full gap-4">
            <Fieldset.Group>
              <TextField
                key={sessionData?.user.email}
                name="email"
                type="email"
                defaultValue={sessionData?.user.email}
                isDisabled={isPending || !sessionData}
              >
                <Label>{localization.auth.email}</Label>

                {sessionData ? (
                  <InputGroup
                    variant={
                      variant === "transparent" ? "primary" : "secondary"
                    }
                  >
                    <InputGroup.Prefix>
                      <Envelope />
                    </InputGroup.Prefix>

                    <InputGroup.Input
                      required
                      autoComplete="email"
                      placeholder={localization.auth.emailPlaceholder}
                    />
                  </InputGroup>
                ) : (
                  <Skeleton className="h-10 md:h-9 w-full rounded-xl" />
                )}

                <FieldError />
              </TextField>
            </Fieldset.Group>

            <Fieldset.Actions>
              <Button
                type="submit"
                isPending={isPending}
                isDisabled={!sessionData}
              >
                {isPending ? <Spinner color="current" size="sm" /> : <Check />}

                {localization.settings.updateEmail}
              </Button>
            </Fieldset.Actions>
          </Fieldset>
        </Form>
      </Card.Content>
    </Card>
  )
}
