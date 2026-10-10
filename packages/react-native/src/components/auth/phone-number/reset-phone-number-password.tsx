import type { AuthViewProps } from "../../../lib/auth-plugin"
import { PhoneNumberFlow } from "./phone-number-flow"
export function ResetPhoneNumberPassword(props: AuthViewProps) {
  return <PhoneNumberFlow {...props} flow="reset" initiallySent={true} />
}
