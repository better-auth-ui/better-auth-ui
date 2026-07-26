import { createAuthPlugin } from "../../lib/create-auth-plugin"
// Side-effect import so this file participates in declaration merging on the
// same module instance that external consumers reach via `@better-auth-ui/core`.
import type {} from "../../lib/view-paths"
import {
  type EmailOtpLocalization,
  emailOtpLocalization
} from "./email-otp-localization"

declare module "../../lib/view-paths" {
  /** Widens `AuthViewPaths` with the email-OTP path when this plugin is imported. */
  interface AuthViewPaths {
    /** @default "email-otp" */
    emailOtp?: string
  }
}

export type EmailOtpPluginOptions = {
  /**
   * Override the plugin's default localization strings.
   * @remarks `EmailOtpLocalization`
   */
  localization?: Partial<EmailOtpLocalization>
  /**
   * URL segment for the email-OTP sign-in view.
   * @remarks `string`
   * @default "email-otp"
   */
  path?: string
  /**
   * Number of characters rendered by the code inputs.
   *
   * Keep this in sync with Better Auth's `emailOTP({ otpLength })` server
   * option.
   *
   * @remarks `number`
   * @default 6
   */
  otpLength?: number
  /**
   * Offer passwordless sign-in with an emailed code.
   *
   * Adds the `/auth/email-otp` view plus a "Continue with Email Code" button,
   * and takes over `/auth/sign-in` when `emailAndPassword.enabled === false`.
   *
   * @remarks `boolean`
   * @default true
   */
  signIn?: boolean
  /**
   * Replace the link-based verify-email view with a code form.
   *
   * Requires `emailOTP({ overrideDefaultEmailVerification: true })` on the
   * server so sign-up sends a code instead of a link.
   *
   * @remarks `boolean`
   * @default false
   */
  emailVerification?: boolean
  /**
   * Replace the link-based password reset views with code forms.
   *
   * `/auth/forgot-password` sends a code and `/auth/reset-password` takes the
   * code plus the new password, so the emailed reset link is never used.
   *
   * @remarks `boolean`
   * @default false
   */
  passwordReset?: boolean
  /**
   * Replace the change-email card in account settings with the code flow.
   *
   * Requires `emailOTP({ changeEmail: { enabled: true } })` on the server.
   *
   * @remarks `boolean`
   * @default false
   */
  changeEmail?: boolean
  /**
   * Ask for a code sent to the current address before changing the email.
   *
   * Mirrors Better Auth's `emailOTP({ changeEmail: { verifyCurrentEmail } })`
   * server option — set both or neither.
   *
   * @remarks `boolean`
   * @default false
   */
  verifyCurrentEmail?: boolean
  /**
   * Mirrors Better Auth's `emailOTP({ disableSignUp })` server option.
   *
   * Left on by default: with sign-up enabled the server creates an account for
   * any address that completes the code flow, and collecting a name only for
   * unknown addresses would leak whether an account exists.
   *
   * @remarks `boolean`
   * @default true
   */
  disableSignUp?: boolean
}

const DEFAULT_OTP_LENGTH = 6

function resolveOtpLength(value?: number) {
  if (value === undefined || !Number.isFinite(value)) {
    return DEFAULT_OTP_LENGTH
  }

  return Math.max(1, Math.floor(value))
}

export const emailOtpPlugin = createAuthPlugin(
  "emailOtp",
  (options: EmailOtpPluginOptions = {}) => ({
    localization: { ...emailOtpLocalization, ...options.localization },
    otpLength: resolveOtpLength(options.otpLength),
    signIn: options.signIn ?? true,
    emailVerification: options.emailVerification ?? false,
    passwordReset: options.passwordReset ?? false,
    changeEmail: options.changeEmail ?? false,
    verifyCurrentEmail: options.verifyCurrentEmail ?? false,
    disableSignUp: options.disableSignUp ?? true,
    viewPaths: {
      auth: {
        emailOtp: options.path ?? "email-otp"
      }
    }
  })
)
