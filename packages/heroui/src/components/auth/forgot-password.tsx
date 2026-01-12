import { useAuth, useForgotPassword } from "@better-auth-ui/react"
import {
  Button,
  Card,
  Description,
  FieldError,
  Fieldset,
  Form,
  Input,
  Label,
  Link,
  Spinner,
  TextField
} from "@heroui/react"

import { cn } from "../../lib/utils"

export type ForgotPasswordProps = {
  className?: string
}

/**
 * Render a card-based "Forgot Password" form that sends a password-reset email.
 *
 * The form displays an email input, submit button, and a link back to sign-in.
 * Toasts are displayed on success or error via the `useForgotPassword` hook.
 *
 * @param className - Optional additional CSS class names applied to the card
 * @returns The forgot-password form UI as a JSX element
 */
export function ForgotPassword({ className }: ForgotPasswordProps) {
  const { basePaths, localization, viewPaths } = useAuth()
  const [{ email }, forgotPassword, isPending] = useForgotPassword()

  return (
    <Card className={cn("w-full max-w-sm p-4 md:p-6", className)}>
      <Card.Content>
        <Form action={forgotPassword}>
          <Fieldset className="gap-4">
            <Label className="text-xl">
              {localization.auth.forgotPassword}
            </Label>

            <TextField
              defaultValue={email}
              name="email"
              type="email"
              autoComplete="email"
              isDisabled={isPending}
            >
              <Label>{localization.auth.email}</Label>

              <Input
                placeholder={localization.auth.emailPlaceholder}
                required
              />

              <FieldError className="text-wrap" />
            </TextField>

            <Fieldset.Actions>
              <Button type="submit" className="w-full" isPending={isPending}>
                {isPending && <Spinner color="current" size="sm" />}

                {localization.auth.sendResetLink}
              </Button>
            </Fieldset.Actions>

            <Description className="flex justify-center gap-1.5 text-foreground text-sm">
              {localization.auth.rememberYourPassword}

              <Link
                href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
                className="text-accent rounded"
              >
                {localization.auth.signIn}
              </Link>
            </Description>
          </Fieldset>
        </Form>
      </Card.Content>
    </Card>
  )
}
