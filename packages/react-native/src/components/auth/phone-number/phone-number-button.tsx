import { useAuthPlugin, type AuthButtonProps } from "@better-auth-ui/react"
import { phoneNumberPlugin } from "@better-auth-ui/core/plugins/phone-number"
import { useAuthNavigation } from "../../../navigation/navigation-context"
import { Button } from "../../../primitives/button"
import type { JSX } from "react/jsx-runtime"
export function PhoneNumberButton({
  view,
  className
}: AuthButtonProps): JSX.Element | null {
  const { localization } = useAuthPlugin(phoneNumberPlugin)
  const navigation = useAuthNavigation()
  return view === "phoneNumber" ? null : (
    <Button
      className={className}
      onPress={() => {
        navigation.push("phoneNumber")
      }}
    >
      {localization.phoneNumber}
    </Button>
  )
}
