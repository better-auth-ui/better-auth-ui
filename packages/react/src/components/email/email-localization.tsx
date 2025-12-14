import EmailChangedEmail from "./email-changed"
import EmailVerificationEmail from "./email-verification"
import MagicLinkEmail from "./magic-link"
import NewDeviceEmail from "./new-device"
import OtpEmail from "./otp-email"
import PasswordChangedEmail from "./password-changed"
import ResetPasswordEmail from "./reset-password"

/**
 * Aggregated localization strings for all email components.
 *
 * Combines localization strings from all email templates (EmailChangedEmail,
 * EmailVerificationEmail, MagicLinkEmail, NewDeviceEmail, OtpEmail,
 * PasswordChangedEmail, ResetPasswordEmail) into a single object for convenient
 * bulk customization.
 */
export const emailLocalization = {
  ...EmailChangedEmail.localization,
  ...EmailVerificationEmail.localization,
  ...MagicLinkEmail.localization,
  ...NewDeviceEmail.localization,
  ...OtpEmail.localization,
  ...PasswordChangedEmail.localization,
  ...ResetPasswordEmail.localization
}

/**
 * Type representing all available email localization strings.
 *
 * Derived from the emailLocalization constant, this type can be used for
 * type-safe localization overrides across all email templates.
 */
export type EmailLocalization = typeof emailLocalization
