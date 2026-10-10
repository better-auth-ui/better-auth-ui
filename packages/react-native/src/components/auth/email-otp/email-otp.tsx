import type { AuthViewProps } from "../../../lib/auth-plugin"
import { EmailOtpFlow } from "./email-otp-flow"

export function EmailOtp(props: AuthViewProps) {
  return <EmailOtpFlow {...props} flow="signIn" initiallySent={false} />
}
