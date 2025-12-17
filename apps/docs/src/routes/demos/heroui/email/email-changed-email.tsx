import { EmailChangedEmail } from "@better-auth-ui/heroui"
import { render } from "@react-email/render"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/heroui/email/email-changed-email")(
  {
    component: RouteComponent
  }
)

const html = await render(
  <EmailChangedEmail
    oldEmail="old@example.com"
    newEmail="new@example.com"
    appName="Better Auth UI"
    supportEmail="support@example.com"
    revertURL="https://better-auth-ui.com/revert-email"
    darkMode={true}
    poweredBy={true}
  />
)

function RouteComponent() {
  return (
    <iframe
      title="Email Changed Email Preview"
      srcDoc={html}
      className="grow w-full border-0"
    />
  )
}
