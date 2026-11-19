import { EmailFrame } from "@/components/email-frame"

export function PasswordChangedEmailDemo() {
  return (
    <EmailFrame
      title="Password Changed Email Preview"
      srcDoc={html}
      className="h-[720px]"
    />
  )
}

import { PasswordChangedEmail } from "@better-auth-ui/react/email"
import { render } from "@react-email/render"

const html = await render(
  <PasswordChangedEmail
    email="user@example.com"
    timestamp="January 15, 2024 at 3:30 PM"
    appName="Better Auth UI"
    logoURL={{
      light: "/favicon-96x96.png",
      dark: "/favicon-96x96-inverted.png"
    }}
    supportEmail="support@example.com"
    secureAccountURL="https://better-auth-ui.com/secure-account"
    darkMode
    poweredBy
  />
)
