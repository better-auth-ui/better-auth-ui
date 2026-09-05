import { getViewURL, validateEmailAddress } from "@better-auth-ui/core"
import {
  useAuth,
  useFetchOptions,
  useRequestPasswordReset
} from "@better-auth-ui/react"
import {
  Card,
  type CardProps,
  cn,
  Description,
  Input,
  Label,
  Link,
  TextField
} from "@heroui/react"
import { isAuthFormFieldInvalid, useAuthForm } from "./auth-form"
import { RESET_LINK_SENT_STORAGE_KEY } from "./reset-link-sent"

export type ForgotPasswordProps = {
  className?: string
  variant?: CardProps["variant"]
}

/**
 * Render a card-based "Forgot Password" form that sends a password-reset email.
 *
 * The form displays an email input, submit button, and a link back to sign-in.
 * After a successful request the submitted email is stored in `sessionStorage`
 * and the user is redirected to the reset-link-sent view, which offers to open
 * their email provider. Errors are handled globally by `ErrorToaster`.
 *
 * @param className - Optional additional CSS class names applied to the card
 * @returns The forgot-password form UI as a JSX element
 */
export function ForgotPassword({ className, variant }: ForgotPasswordProps) {
  const {
    authClient,
    baseURL,
    basePaths,
    localization,
    viewPaths,
    navigate,
    plugins
  } = useAuth()

  const { fetchOptions, resetFetchOptions } = useFetchOptions()

  const { mutateAsync: requestPasswordReset, isPending } =
    useRequestPasswordReset(authClient, {
      onError: () => {
        resetFetchOptions()
      },
      onSuccess: (_data, { email }) => {
        sessionStorage.setItem(RESET_LINK_SENT_STORAGE_KEY, email)
        navigate({ to: `${basePaths.auth}/${viewPaths.auth.resetLinkSent}` })
      }
    })

  const form = useAuthForm({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) =>
      await requestPasswordReset({
        email: value.email,
        redirectTo: getViewURL(
          baseURL,
          basePaths.auth,
          viewPaths.auth.resetPassword
        ),
        fetchOptions
      })
  })

  const Captcha = plugins.find(
    (plugin) => plugin.captchaComponent
  )?.captchaComponent

  return (
    <Card
      className={cn("w-full max-w-sm gap-4 md:p-6", className)}
      variant={variant}
    >
      <Card.Header>
        <Card.Title className="text-xl font-semibold mb-1">
          {localization.auth.forgotPassword}
        </Card.Title>
      </Card.Header>

      <Card.Content className="gap-4">
        <form.AppForm>
          <form.AuthFormRoot className="flex flex-col gap-4">
            <form.AppField
              name="email"
              validators={{
                onChange: ({ value }) =>
                  validateEmailAddress(value, {
                    invalidMessage: localization.auth.invalidEmail,
                    requiredMessage: localization.auth.fieldRequired
                  })
              }}
            >
              {(field) => (
                <TextField
                  name={field.name}
                  type="email"
                  autoComplete="email"
                  isDisabled={isPending}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                  isInvalid={isAuthFormFieldInvalid(field.state.meta)}
                >
                  <Label>{localization.auth.email}</Label>

                  <Input
                    placeholder={localization.auth.emailPlaceholder}
                    required
                    variant={
                      variant === "transparent" ? "primary" : "secondary"
                    }
                  />

                  <field.AuthFormFieldError />
                </TextField>
              )}
            </form.AppField>

            {Captcha && <div className="flex justify-center">{Captcha}</div>}

            <div className="flex flex-col gap-3">
              <form.AuthFormSubmitButton
                isPending={isPending}
                className="w-full"
                isDisabled={isPending}
              >
                {localization.auth.sendResetLink}
              </form.AuthFormSubmitButton>
            </div>
            <form.AuthFormServerError />
          </form.AuthFormRoot>
        </form.AppForm>
      </Card.Content>

      <Card.Footer className="flex-col gap-3">
        <Description className="text-sm">
          {localization.auth.rememberYourPassword}{" "}
          <Link
            href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
            className="text-accent no-underline hover:underline decoration-accent-hover"
          >
            {localization.auth.signIn}
          </Link>
        </Description>
      </Card.Footer>
    </Card>
  )
}
