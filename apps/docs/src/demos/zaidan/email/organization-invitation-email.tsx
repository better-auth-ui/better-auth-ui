import { EmailFrame } from "@/components/email-frame"

export function OrganizationInvitationEmailDemo() {
  return (
    <EmailFrame
      title="Organization Invitation Email Preview"
      srcDoc={html}
      className="h-[840px]"
    />
  )
}

import { OrganizationInvitationEmail } from "@better-auth-ui/solid/email"
import { render } from "@solidjs-email/main"

const html = await render(() =>
  OrganizationInvitationEmail({
    url: "https://better-auth-ui.com/auth/accept-invitation?invitationId=example",
    email: "invitee@example.com",
    inviterName: "Jane Doe",
    inviterEmail: "jane@example.com",
    organizationName: "Acme Inc.",
    role: "member",
    appName: "Better Auth UI",
    logoURL: {
      light: "/favicon-96x96.png",
      dark: "/favicon-96x96-inverted.png"
    },
    expirationHours: 48,
    darkMode: true,
    poweredBy: true
  })
)
