import type { JSX } from "react/jsx-runtime"
import type { AuthViewProps } from "../../../lib/auth-plugin"
import { PhoneNumberFlow } from "./phone-number-flow"
export function ForgotPhoneNumberPassword(props: AuthViewProps): JSX.Element {
  return <PhoneNumberFlow {...props} flow="reset" initiallySent={false} />
}
