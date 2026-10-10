import type { AuthViewProps } from "../../../lib/auth-plugin"
import { PhoneNumberFlow } from "./phone-number-flow"
export function PhoneNumber(props: AuthViewProps) {
  return <PhoneNumberFlow {...props} flow="signIn" initiallySent={false} />
}
