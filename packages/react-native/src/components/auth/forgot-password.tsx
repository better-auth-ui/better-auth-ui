import { getViewURL, validateEmailAddress } from "@better-auth-ui/core"
import { setPendingEmail } from "../../lib/pending-email"
import { AuthPrompts } from "@better-auth-ui/react"
import {
  useAuth,
  useFetchOptions,
  useRequestPasswordReset
} from "@better-auth-ui/react"
import { cn } from "../../lib/cn"
import { useAuthNavigation } from "../../navigation/navigation-context"
import { Card, type CardVariant } from "../../primitives/card"
import { Description } from "../../primitives/description"
import { useAuthForm } from "./auth-form"
import { Link } from "../../primitives/link"
import { Box } from "../../primitives/styled"
import { toast } from "../../primitives/toast"

export interface ForgotPasswordProps {
  className?: string
  variant?: CardVariant
}

/** Request a password-reset link and retain the email for the next screen. */
export function ForgotPassword({ className, variant }: ForgotPasswordProps) {
  const { authClient, baseURL, basePaths, localization, viewPaths } = useAuth()

  const navigation = useAuthNavigation()
  const { fetchOptions, resetFetchOptions } = useFetchOptions()

  const { mutateAsync: requestPasswordReset, isPending } =
    useRequestPasswordReset(authClient, {
      meta: { errorPresentation: "inline" },
      onError: () => {
        resetFetchOptions()
      },
      onSuccess: (_data, { email: submittedEmail }) => {
        toast.success(localization.auth.passwordResetEmailSent)
        setPendingEmail(submittedEmail, "resetLinkSent")
        navigation.push("resetLinkSent", {
          params: { redirectTo: navigation.getParam("redirectTo") ?? "/" }
        })
      }
    })

  const form = useAuthForm({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) => {
      await requestPasswordReset({
        email: value.email.trim(),
        redirectTo: getViewURL(
          baseURL,
          basePaths.auth,
          viewPaths.auth.resetPassword
        ),
        fetchOptions
      })
    }
  })

  const inputVariant = variant === "transparent" ? "primary" : "secondary"

  return (
    <Card className={cn("w-full max-w-sm gap-4", className)} variant={variant}>
      <AuthPrompts view="forgotPassword" />
      <Card.Header>
        <Card.Title className="mb-1">
          {localization.auth.forgotPassword}
        </Card.Title>
      </Card.Header>

      <Card.Content className="gap-4">
        <form.AppForm>
          <form.AuthFormRoot
            serverErrorMessage={localization.errors.generic}
            className="gap-4"
          >
            <form.AppField
              name="email"
              validators={{
                onChange: ({ value }) => {
                  return validateEmailAddress(value, {
                    requiredMessage: localization.auth.fieldRequired,
                    invalidMessage: localization.auth.invalidEmail
                  })?.message
                }
              }}
            >
              {(field) => (
                <field.AuthFormTextField
                  type="email"
                  autoComplete="email"
                  isDisabled={isPending}
                  label={localization.auth.email}
                  inputProps={{
                    placeholder: localization.auth.emailPlaceholder,
                    variant: inputVariant,
                    required: true
                  }}
                />
              )}
            </form.AppField>

            <Box className="gap-3">
              <form.AuthFormSubmitButton
                variant="primary"
                className="w-full"
                isPending={isPending}
              >
                {localization.auth.sendResetLink}
              </form.AuthFormSubmitButton>
            </Box>
          </form.AuthFormRoot>
        </form.AppForm>
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
