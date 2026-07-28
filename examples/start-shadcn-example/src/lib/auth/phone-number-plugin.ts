import { createAuthPlugin } from "@better-auth-ui/core"
import {
  phoneNumberPlugin as corePhoneNumberPlugin,
  type PhoneNumberPluginOptions
} from "@better-auth-ui/core/plugins"

import { ChangePhoneNumber } from "@/components/auth/phone-number/change-phone-number"
import { ForgotPhoneNumberPassword } from "@/components/auth/phone-number/forgot-phone-number-password"
import { PhoneNumber } from "@/components/auth/phone-number/phone-number"
import { PhoneNumberButton } from "@/components/auth/phone-number/phone-number-button"
import { ResetPhoneNumberPassword } from "@/components/auth/phone-number/reset-phone-number-password"

export const phoneNumberPlugin = createAuthPlugin(
  corePhoneNumberPlugin.id,
  (options: PhoneNumberPluginOptions = {}) => {
    const plugin = corePhoneNumberPlugin(options)
    const hasSignIn = plugin.signIn || plugin.passwordSignIn

    return {
      ...plugin,
      authButtons: hasSignIn ? [PhoneNumberButton] : [],
      views: {
        auth: {
          ...(hasSignIn && { phoneNumber: PhoneNumber }),
          ...(plugin.passwordReset && {
            phoneNumberForgotPassword: ForgotPhoneNumberPassword,
            phoneNumberResetPassword: ResetPhoneNumberPassword
          })
        }
      },
      ...(hasSignIn && {
        fallbackViews: { auth: { signIn: PhoneNumber } }
      }),
      accountCards: plugin.changePhoneNumber ? [ChangePhoneNumber] : []
    }
  }
)
