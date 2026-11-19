import type { JSX } from "react/jsx-runtime"
import type { AuthViewProps } from "../../../lib/auth-plugin"
import { EmailOtpFlow } from "./email-otp-flow"

export function EmailOtp(props: AuthViewProps): JSX.Element {
  return <EmailOtpFlow {...props} flow="signIn" initiallySent={false} />
}
