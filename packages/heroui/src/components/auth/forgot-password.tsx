import { type AnyAuthConfig, useForgotPassword } from "@better-auth-ui/react"
import {
  Button,
  Card,
  Description,
  FieldError,
  Fieldset,
  Form,
  Input,
  Label,
  Spinner,
  TextField
} from "@heroui/react"

import { useAuth } from "../../hooks/use-auth"
import { cn } from "../../lib/utils"

export type ForgotPasswordProps = AnyAuthConfig & {
  className?: string
}

/**
 * Renders a "Forgot Password" form with an email input and submit button.
 */
export function ForgotPassword({ className, ...config }: ForgotPasswordProps) {
  const context = useAuth(config)

  const { basePaths, localization, viewPaths, Link } = context

  const [{ email }, forgotPassword, isPending] = useForgotPassword(context)

  return (
    <Card className={cn("w-full max-w-sm p-4 md:p-6", className)}>
      <Card.Content>
        <Form action={forgotPassword}>
          <Fieldset className="gap-4">
            <Fieldset.Legend className="text-xl">
              {localization.auth.forgotPassword}
            </Fieldset.Legend>

            <Description />

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
                className="link link--underline-hover text-accent"
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
