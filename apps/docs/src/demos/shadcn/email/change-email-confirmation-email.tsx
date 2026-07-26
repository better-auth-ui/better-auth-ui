import { EmailFrame } from "@/components/email-frame"

export function ChangeEmailConfirmationEmailDemo() {
  return (
    <EmailFrame
      title="Change Email Confirmation Preview"
      srcDoc={html}
      className="h-[680px]"
    />
  )
}

import { ChangeEmailConfirmationEmail } from "@better-auth-ui/react/email"
import { render } from "@react-email/render"

const html = await render(
  <ChangeEmailConfirmationEmail
    url="https://better-auth-ui.com/api/auth/change-email/verify?token=example-token"
    appName="Better Auth UI"
    logoURL={{
      light: "/favicon-96x96.png",
      dark: "/favicon-96x96-inverted.png"
    }}
    currentEmail="current@example.com"
    newEmail="new@example.com"
    expirationMinutes={60}
    darkMode={true}
    poweredBy={true}
  />
)
