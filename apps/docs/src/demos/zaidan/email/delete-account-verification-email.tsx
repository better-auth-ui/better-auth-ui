import { EmailFrame } from "@/components/email-frame"

export function DeleteAccountVerificationEmailDemo() {
  return (
    <EmailFrame
      title="Delete Account Verification Preview"
      srcDoc={html}
      className="h-[680px]"
    />
  )
}

import { DeleteAccountVerificationEmail } from "@better-auth-ui/solid/email"
import { render } from "@solidjs-email/main"

const html = await render(() =>
  DeleteAccountVerificationEmail({
    url: "https://better-auth-ui.com/api/auth/delete-user/callback?token=example-token",
    appName: "Better Auth UI",
    logoURL: {
      light: "/favicon-96x96.png",
      dark: "/favicon-96x96-inverted.png"
    },
    email: "user@example.com",
    expirationHours: 24,
    darkMode: true,
    poweredBy: true
  })
)
