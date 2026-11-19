import { EmailFrame } from "@/components/email-frame"

export function NewDeviceEmailDemo() {
  return (
    <EmailFrame
      title="New Device Email Preview"
      srcDoc={html}
      className="h-[840px]"
    />
  )
}

import { NewDeviceEmail } from "@better-auth-ui/heroui/email"
import { render } from "@react-email/render"

const html = await render(
  <NewDeviceEmail
    userEmail="user@example.com"
    deviceInfo={{
      browser: "Chrome 120.0",
      os: "macOS 14.2",
      location: "San Francisco, CA",
      ipAddress: "192.168.1.1",
      timestamp: "January 15, 2024 at 3:30 PM"
    }}
    appName="Better Auth UI"
    logoURL={{
      light: "/favicon-96x96.png",
      dark: "/favicon-96x96-inverted.png"
    }}
    supportEmail="support@example.com"
    secureAccountLink="https://better-auth-ui.com/secure-account"
    darkMode
    poweredBy
  />
)
