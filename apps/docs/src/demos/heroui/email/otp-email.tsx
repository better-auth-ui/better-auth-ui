import { EmailFrame } from "@/components/email-frame"

export function OtpEmailDemo() {
  return (
    <EmailFrame
      title="One-Time Password Email Preview"
      srcDoc={html}
      className="h-[620px]"
    />
  )
}

import { OtpEmail } from "@better-auth-ui/heroui/email"
import { render } from "@react-email/render"

const html = await render(
  <OtpEmail
    verificationCode="123456"
    email="user@example.com"
    appName="Better Auth UI"
    logoURL={{
      light: "/favicon-96x96.png",
      dark: "/favicon-96x96-inverted.png"
    }}
    expirationMinutes={10}
    darkMode
    poweredBy
  />
)
