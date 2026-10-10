import type { AuthViewProps } from "../../../lib/auth-plugin"
import { EmailOtpFlow } from "./email-otp-flow"

export function VerifyEmailOtp(props: AuthViewProps) {
  return <EmailOtpFlow {...props} flow="verification" initiallySent={true} />
}
