import {
  useAuth,
  useFetchOptions,
  useRequestPasswordReset
} from "@better-auth-ui/react"
import { useState } from "react"
import { cn } from "../../lib/cn"
import { useAuthNavigation } from "../../navigation/navigation-context"
import { Button } from "../../primitives/button"
import { Card, type CardVariant } from "../../primitives/card"
import { Description } from "../../primitives/description"
import { FieldError, Label, TextField } from "../../primitives/field"
import { Form } from "../../primitives/form"
import { Input } from "../../primitives/input"
import { Link } from "../../primitives/link"
import { Box } from "../../primitives/styled"
import { toast } from "../../primitives/toast"

export interface ForgotPasswordProps {
  className?: string
  variant?: CardVariant
}

/**
 * Render a card-based "Forgot Password" form that sends a password-reset email.
 *
 * The form displays an email input, submit button, and a link back to sign-in.
 * Success toasts are shown via `useRequestPasswordReset`; errors are handled globally by `ErrorToaster`.
 *
 * @param className - Optional additional CSS class names applied to the card
 * @returns The forgot-password form UI as a JSX element
 */
export function ForgotPassword({ className, variant }: ForgotPasswordProps) {
  const { authClient, baseURL, basePaths, localization, viewPaths } = useAuth()

  const navigation = useAuthNavigation()
  const { fetchOptions, resetFetchOptions } = useFetchOptions()

  const [email, setEmail] = useState("")

  const { mutate: requestPasswordReset, isPending } = useRequestPasswordReset(
    authClient,
    {
      onError: () => {
        resetFetchOptions()
      },
      onSuccess: () => {
        toast.success(localization.auth.passwordResetEmailSent)
        navigation.push("signIn")
      }
    }
  )

  const handleSubmit = () => {
    requestPasswordReset({
      email,
      redirectTo: `${baseURL}${basePaths.auth}/${viewPaths.auth.resetPassword}`,
      fetchOptions
    })
  }

  const inputVariant = variant === "transparent" ? "primary" : "secondary"

  return (
    <Card className={cn("w-full max-w-sm gap-4", className)} variant={variant}>
      <Card.Header>
        <Card.Title className="mb-1">
          {localization.auth.forgotPassword}
        </Card.Title>
      </Card.Header>

      <Card.Content className="gap-4">
        <Form onSubmit={handleSubmit} className="gap-4">
          <TextField
            name="email"
            type="email"
            autoComplete="email"
            isDisabled={isPending}
            value={email}
            onChange={setEmail}
            validate={(value) => {
              if (!value) return localization.auth.fieldRequired
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                return localization.auth.invalidEmail
            }}
          >
            <Label>{localization.auth.email}</Label>

            <Input
              placeholder={localization.auth.emailPlaceholder}
              variant={inputVariant}
              required
            />

            <FieldError />
          </TextField>

          <Box className="gap-3">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isPending={isPending}
            >
              {localization.auth.sendResetLink}
            </Button>
          </Box>
        </Form>
      </Card.Content>

      <Card.Footer className="flex-col gap-3">
        <Description className="text-sm">
          {localization.auth.rememberYourPassword}{" "}
          <Link view="signIn">{localization.auth.signIn}</Link>
        </Description>
      </Card.Footer>
    </Card>
  )
}
