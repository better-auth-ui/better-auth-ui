import { type AnyAuthConfig, useChangeEmail } from "@better-auth-ui/react"
import { Check } from "@gravity-ui/icons"
import {
  Button,
  Card,
  cn,
  FieldError,
  Fieldset,
  Form,
  Input,
  Label,
  Skeleton,
  Spinner,
  TextField
} from "@heroui/react"

import { useAuth } from "../../../hooks/use-auth"

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
  const { authClient, localization } = context

  const { data: sessionData } = authClient.useSession()

  const [state, formAction, isPending] = useChangeEmail(context)

  return (
    <Card className={cn("p-4 md:p-6 gap-4 md:gap-6", className)}>
      <Card.Header>
        <Card.Title className="text-xl">
          {localization.settings.changeEmail}
        </Card.Title>
      </Card.Header>

      <Form action={formAction}>
        <Fieldset className="w-full gap-4 md:gap-6">
          <Fieldset.Group>
            <TextField
              key={sessionData?.user?.email}
              name="email"
              type="email"
              defaultValue={sessionData?.user?.email || state.email}
              isDisabled={isPending || !sessionData}
            >
              <Label>{localization.auth.email}</Label>

              {sessionData ? (
                <Input
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
              isDisabled={!sessionData}
            >
              {isPending ? <Spinner color="current" size="sm" /> : <Check />}

              {localization.settings.updateEmail}
            </Button>
          </Fieldset.Actions>
        </Fieldset>
      </Form>
    </Card>
  )
}
