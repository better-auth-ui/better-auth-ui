import { EmailChangedEmail } from "@better-auth-ui/react"
import { render } from "@react-email/render"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/shadcn/email/email-changed-email")(
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

/**
 * Render an iframe that previews the pre-rendered EmailChangedEmail HTML.
 *
 * @returns A JSX element containing an iframe whose `srcDoc` is the pre-rendered email HTML and that fills available space.
 */
function RouteComponent() {
  return (
    <iframe
      title="Email Changed Email Preview"
      srcDoc={html}
      className="grow w-full border-0"
    />
  )
}