import { useAuthPlugin } from "@better-auth-ui/react"
import type { AuthButtonProps } from "@better-auth-ui/react"
import { emailOtpPlugin } from "../../../lib/auth/email-otp-plugin"
import { useAuthNavigation } from "../../../navigation/navigation-context"
import { Button } from "../../../primitives/button"

export function EmailOtpButton({ view, className }: AuthButtonProps) {
  const { localization } = useAuthPlugin(emailOtpPlugin)
  const navigation = useAuthNavigation()
  return view === "emailOtp" ? null : (
    <Button className={className} onPress={() => navigation.push("emailOtp")}>
      {localization.emailOtp}
    </Button>
  )
}
