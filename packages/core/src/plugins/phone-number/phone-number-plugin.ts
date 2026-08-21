import type {
  AuthPluginBase,
  AuthPluginLocalizationContext
} from "../../lib/auth-plugin"
import { createAuthPlugin } from "../../lib/create-auth-plugin"
// Side-effect import so this file participates in declaration merging on the
// same module instance that external consumers reach via `@better-auth-ui/core`.
import type {} from "../../lib/view-paths"
import {
  defaultPhoneNumberAdapter,
  type PhoneNumberAdapter,
  type PhoneNumberCountryCode
} from "./phone-number"
import {
  type PhoneNumberLocalization,
  phoneNumberLocalization
} from "./phone-number-localization"

declare module "../../lib/view-paths" {
  /** Widens `AuthViewPaths` with the phone-number routes when this plugin is imported. */
  interface AuthViewPaths {
    /** @default "phone-number" */
    phoneNumber?: string
    /** @default "phone-number-forgot-password" */
    phoneNumberForgotPassword?: string
    /** @default "phone-number-reset-password" */
    phoneNumberResetPassword?: string
  }
}

export type PhoneNumberPluginOptions = {
  /**
   * Adapter used to format, validate, and normalize phone numbers.
   * @default defaultPhoneNumberAdapter
   */
  adapter?: PhoneNumberAdapter
  /**
   * Country selected before the user enters a phone number.
   * @default The first configured country, or "US" when `countries` is omitted.
   */
  defaultCountry?: PhoneNumberCountryCode
  /** Countries shown in the country selector. Defaults to all supported countries. */
  countries?: readonly PhoneNumberCountryCode[]
  /** Locale used for country names and sorting. Defaults to the runtime locale. */
  locale?: string
  /**
   * Override the plugin's default localization strings.
   * @remarks `PhoneNumberLocalization`
   */
  localization?: Partial<PhoneNumberLocalization>
  /**
   * URL segment for the phone-number sign-in view.
   * @default "phone-number"
   */
  path?: string
  /**
   * URL segment for requesting a phone password reset.
   * @default "phone-number-forgot-password"
   */
  forgotPasswordPath?: string
  /**
   * URL segment for completing a phone password reset.
   * @default "phone-number-reset-password"
   */
  resetPasswordPath?: string
  /**
   * Number of characters rendered by the code input.
   *
   * Keep this in sync with Better Auth's `phoneNumber({ otpLength })` option.
   * @default 6
   */
  otpLength?: number
  /**
   * Offer passwordless sign-in by sending a verification code.
   * @default true
   */
  signIn?: boolean
  /**
   * Offer phone-number and password sign-in.
   *
   * Users need a Better Auth credential account before this strategy can
   * authenticate them.
   * @default false
   */
  passwordSignIn?: boolean
  /**
   * Add the phone-number password-reset routes and link.
   *
   * Requires `sendPasswordResetOTP` in the Better Auth server plugin.
   * @default false
   */
  passwordReset?: boolean
  /**
   * Add a verified phone-number card to account settings.
   * @default true
   */
  changePhoneNumber?: boolean
}

const DEFAULT_OTP_LENGTH = 6

function resolveOtpLength(value?: number) {
  if (value === undefined || !Number.isFinite(value)) {
    return DEFAULT_OTP_LENGTH
  }

  return Math.max(1, Math.floor(value))
}

export const phoneNumberPlugin = createAuthPlugin(
  "phoneNumber",
  (options: PhoneNumberPluginOptions = {}) => {
    const defaultCountry =
      options.defaultCountry ?? options.countries?.[0] ?? "US"

    if (options.countries?.length === 0) {
      throw new Error("countries must include at least one country")
    }

    if (options.countries && !options.countries.includes(defaultCountry)) {
      throw new Error("defaultCountry must be included in countries")
    }

    return {
      adapter: options.adapter ?? defaultPhoneNumberAdapter,
      countries: options.countries,
      defaultCountry,
      locale: options.locale,
      localization: { ...phoneNumberLocalization, ...options.localization },
      _localizationResolver: (
        plugin: AuthPluginBase,
        context: AuthPluginLocalizationContext
      ) => ({
        ...plugin,
        locale: options.locale ?? context.languageTag
      }),
      otpLength: resolveOtpLength(options.otpLength),
      signIn: options.signIn ?? true,
      passwordSignIn: options.passwordSignIn ?? false,
      passwordReset: options.passwordReset ?? false,
      changePhoneNumber: options.changePhoneNumber ?? true,
      viewPaths: {
        auth: {
          phoneNumber: options.path ?? "phone-number",
          phoneNumberForgotPassword:
            options.forgotPasswordPath ?? "phone-number-forgot-password",
          phoneNumberResetPassword:
            options.resetPasswordPath ?? "phone-number-reset-password"
        }
      }
    }
  }
)
