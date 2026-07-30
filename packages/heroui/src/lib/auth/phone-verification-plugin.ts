import { createAuthPlugin } from "@better-auth-ui/core"
import {
  phoneVerificationPlugin as corePhoneVerificationPlugin,
  type PhoneVerificationPluginOptions
} from "@better-auth-ui/core/plugins"

import { PhoneVerification } from "../../components/auth/phone-verification/phone-verification"

export const phoneVerificationPlugin = createAuthPlugin(
  corePhoneVerificationPlugin.id,
  (options: PhoneVerificationPluginOptions = {}) => ({
    ...corePhoneVerificationPlugin(options),
    views: {
      auth: { phoneVerification: PhoneVerification }
    }
  })
)
