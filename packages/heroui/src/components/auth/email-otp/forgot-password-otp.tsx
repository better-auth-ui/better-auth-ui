import { getAuthLinkURL } from "@better-auth-ui/core"
import {
  type EmailOtpAuthClient,
  useAuth,
  useAuthPlugin,
  useFetchOptions,
  useRequestPasswordResetOtp
} from "@better-auth-ui/react"
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
  TextField
} from "@heroui/react"
import type { SyntheticEvent } from "react"

import { emailOtpPlugin } from "../../../lib/auth/email-otp-plugin"

/** `sessionStorage` key the reset-code form reads the pending address from. */
export const RESET_PASSWORD_OTP_STORAGE_KEY =
  "better-auth-ui.reset-password-otp"

export type ForgotPasswordOtpProps = {
  className?: string
  variant?: CardProps["variant"]
}

/**
 * Request a password-reset code instead of a reset link.
 *
 * Replaces the built-in `<ForgotPassword />` view when the email-OTP plugin
 * runs with `passwordReset: true`. On success the address is stored and the
 * user continues on `/auth/reset-password`, which asks for the code and the
 * new password — the reset-link-sent view is skipped entirely.
 *
 * @param className - Additional CSS classes applied to the card.
 * @param variant - Card variant.
 */
export function ForgotPasswordOtp({
  className,
  variant
}: ForgotPasswordOtpProps) {
  const {
    authClient,
    basePaths,
    localization,
    navigate,
    plugins,
    redirectTo,
    viewPaths
  } = useAuth()
  const { localization: emailOtpLocalization } = useAuthPlugin(emailOtpPlugin)

  const { fetchOptions, resetFetchOptions } = useFetchOptions()

  const { mutate: requestPasswordResetOtp, isPending } =
    useRequestPasswordResetOtp(authClient as EmailOtpAuthClient, {
      onError: () => resetFetchOptions(),
      onSuccess: (_data, { email }) => {
        sessionStorage.setItem(RESET_PASSWORD_OTP_STORAGE_KEY, email)
        navigate({ to: `${basePaths.auth}/${viewPaths.auth.resetPassword}` })
      }
    })

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    requestPasswordResetOtp({
      email: formData.get("email") as string,
      fetchOptions
    })
  }

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
        <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField
            name="email"
            type="email"
            autoComplete="email"
            isDisabled={isPending}
            validate={(value) => {
              if (!value) return localization.auth.fieldRequired
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                return localization.auth.invalidEmail
            }}
          >
            <Label>{localization.auth.email}</Label>

            <Input
              placeholder={localization.auth.emailPlaceholder}
              required
              variant={variant === "transparent" ? "primary" : "secondary"}
            />

            <FieldError />
          </TextField>

          {Captcha && <div className="flex justify-center">{Captcha}</div>}

          <Button type="submit" className="w-full" isPending={isPending}>
            {isPending && <Spinner color="current" size="sm" />}

            {emailOtpLocalization.sendCode}
          </Button>
        </Form>
      </Card.Content>

      <Card.Footer className="flex-col gap-3">
        <Description className="text-sm">
          {localization.auth.rememberYourPassword}{" "}
          <Link
            href={getAuthLinkURL(
              `${basePaths.auth}/${viewPaths.auth.signIn}`,
              redirectTo
            )}
            className="text-accent no-underline hover:underline decoration-accent-hover"
          >
            {localization.auth.signIn}
          </Link>
        </Description>
      </Card.Footer>
    </Card>
  )
}
