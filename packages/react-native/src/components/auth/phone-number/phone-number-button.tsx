import { useAuthPlugin, type AuthButtonProps } from "@better-auth-ui/react"
import { phoneNumberPlugin } from "../../../lib/auth/phone-number-plugin"
import { useAuthNavigation } from "../../../navigation/navigation-context"
import { Button } from "../../../primitives/button"
export function PhoneNumberButton({ view, className }: AuthButtonProps) {
  const { localization } = useAuthPlugin(phoneNumberPlugin)
  const navigation = useAuthNavigation()
  return view === "phoneNumber" ? null : (
    <Button
      className={className}
      onPress={() => navigation.push("phoneNumber")}
    >
      {localization.phoneNumber}
    </Button>
  )
}
