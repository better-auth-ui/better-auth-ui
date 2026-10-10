import type { AuthViewProps } from "../../../lib/auth-plugin"
import { PhoneNumberFlow } from "./phone-number-flow"
export function ForgotPhoneNumberPassword(props: AuthViewProps) {
  return <PhoneNumberFlow {...props} flow="reset" initiallySent={false} />
}
