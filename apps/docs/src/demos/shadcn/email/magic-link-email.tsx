import { EmailFrame } from "@/components/email-frame"

export function MagicLinkEmailDemo() {
  return (
    <EmailFrame
      title="Magic Link Email Preview"
      srcDoc={html}
      className="h-[600px]"
    />
  )
}

import { MagicLinkEmail } from "@better-auth-ui/react/email"
import { render } from "@react-email/render"

const html = await render(
  <MagicLinkEmail
    url="https://better-auth-ui.com/auth/verify?token=example-token"
    appName="Better Auth UI"
    logoURL={{
      light: "/favicon-96x96.png",
      dark: "/favicon-96x96-inverted.png"
    }}
    email="user@example.com"
    expirationMinutes={5}
    darkMode
    poweredBy
  />
)
