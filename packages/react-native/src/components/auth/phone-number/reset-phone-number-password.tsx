import type { JSX } from "react/jsx-runtime"
import type { AuthViewProps } from "../../../lib/auth-plugin"
import { PhoneNumberFlow } from "./phone-number-flow"
export function ResetPhoneNumberPassword(props: AuthViewProps): JSX.Element {
  return <PhoneNumberFlow {...props} flow="reset" initiallySent={true} />
}
