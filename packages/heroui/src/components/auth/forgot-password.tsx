import { useAuth, useRequestPasswordReset } from "@better-auth-ui/react"
import {
  Button,
  Card,
  type CardProps,
  cn,
  Description,
  FieldError,
  Form,
  Input,
  Label,
  Link,
  Spinner,
  TextField,
  toast
} from "@heroui/react"
import type { SyntheticEvent } from "react"

export type ForgotPasswordProps = {
  className?: string
  variant?: CardProps["variant"]
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
export function ForgotPassword({
  className,
  variant,
  ...props
}: ForgotPasswordProps & Omit<CardProps, "children">) {
  const { basePaths, localization, viewPaths, navigate } = useAuth()

  const { mutate: requestPasswordReset, isPending } = useRequestPasswordReset({
    onSuccess: () => {
      toast.success(localization.auth.passwordResetEmailSent)
      navigate({ to: `${basePaths.auth}/${viewPaths.auth.signIn}` })
    }
  })

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    requestPasswordReset({
      email: formData.get("email") as string,
      redirectTo: `${basePaths.auth}/${viewPaths.auth.resetPassword}`
    })
  }

  return (
    <Card
      className={cn("w-full max-w-sm p-4 md:p-6", className)}
      variant={variant}
      {...props}
    >
      <Card.Header>
        <Card.Title className="text-xl font-semibold mb-1">
          {localization.auth.forgotPassword}
        </Card.Title>
      </Card.Header>

      <Card.Content>
        <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField
            name="email"
            type="email"
            autoComplete="email"
            isDisabled={isPending}
          >
            <Label>{localization.auth.email}</Label>

            <Input
              placeholder={localization.auth.emailPlaceholder}
              required
              variant={variant === "transparent" ? "primary" : "secondary"}
            />

            <FieldError />
          </TextField>

          <Button type="submit" className="w-full" isPending={isPending}>
            {isPending && <Spinner color="current" size="sm" />}

            {localization.auth.sendResetLink}
          </Button>
        </Form>
      </Card.Content>

      <Card.Footer className="flex-col">
        <Description className="text-sm">
          {localization.auth.rememberYourPassword}{" "}
          <Link
            href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
            className="text-accent decoration-accent no-underline hover:underline"
          >
            {localization.auth.signIn}
          </Link>
        </Description>
      </Card.Footer>
    </Card>
  )
}
