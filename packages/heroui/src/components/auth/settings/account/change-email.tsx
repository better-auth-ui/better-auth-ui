import { getViewURL } from "@better-auth-ui/core"
import { useAuth, useChangeEmail, useSession } from "@better-auth-ui/react"
import {
  Button,
  Card,
  type CardProps,
  cn,
  FieldError,
  Fieldset,
  Form,
  Input,
  Label,
  Skeleton,
  Spinner,
  TextField,
  toast
} from "@heroui/react"
import type { SyntheticEvent } from "react"

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

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    changeEmail({
      newEmail: formData.get("email") as string,
      callbackURL: getViewURL(
        baseURL,
        basePaths.settings,
        viewPaths.settings.account
      )
    })
  }

  return (
    <div>
      <h2 className={cn("text-sm font-semibold mb-3")}>
        {localization.settings.changeEmail}
      </h2>

      <Card className={cn("p-4 gap-4", className)} variant={variant} {...props}>
        <Card.Content>
          <Form onSubmit={handleSubmit}>
            <Fieldset className="w-full gap-4">
              <Fieldset.Group>
                <TextField
                  key={`${session?.user.id}-${session?.user.email}-email`}
                  name="email"
                  type="email"
                  defaultValue={session?.user.email}
                  isDisabled={isPending || !session}
                >
                  <Label>{localization.auth.email}</Label>

                  {session ? (
                    <Input
                      required
                      variant={
                        variant === "transparent" ? "primary" : "secondary"
                      }
                      autoComplete="email"
                      placeholder={localization.auth.emailPlaceholder}
                    />
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
                  isDisabled={!session}
                  size="sm"
                >
                  {isPending && <Spinner color="current" size="sm" />}

                  {localization.settings.updateEmail}
                </Button>
              </Fieldset.Actions>
            </Fieldset>
          </Form>
        </Card.Content>
      </Card>
    </div>
  )
}
