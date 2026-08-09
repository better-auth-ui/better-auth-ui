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

import { OrganizationInvitationEmail } from "@better-auth-ui/heroui/email"
import { render } from "@react-email/render"

const html = await render(
  // biome-ignore lint/a11y/useValidAriaRole: `role` is a prop on the email component, not an ARIA role.
  <OrganizationInvitationEmail
    url="https://better-auth-ui.com/auth/accept-invitation?invitationId=example"
    email="invitee@example.com"
    inviterName="Jane Doe"
    inviterEmail="jane@example.com"
    organizationName="Acme Inc."
    role="member"
    appName="Better Auth UI"
    logoURL={{
      light: "/favicon-96x96.png",
      dark: "/favicon-96x96-inverted.png"
    }}
    expirationHours={48}
    darkMode={true}
    poweredBy={true}
  />
)
