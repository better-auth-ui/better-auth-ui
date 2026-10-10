import type { AuthViewProps } from "../../../lib/auth-plugin"
import { EmailOtpFlow } from "./email-otp-flow"

export function ResetPasswordOtp(props: AuthViewProps) {
  return <EmailOtpFlow {...props} flow="reset" initiallySent={true} />
}
