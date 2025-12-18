import { PasswordChangedEmail } from "@better-auth-ui/heroui"
import { render } from "@react-email/render"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/demos/heroui/email/password-changed-email"
)({
  component: RouteComponent
})

const html = await render(
  <PasswordChangedEmail
    email="user@example.com"
    timestamp="January 15, 2024 at 3:30 PM"
    appName="Better Auth UI"
    supportEmail="support@example.com"
    secureAccountURL="https://better-auth-ui.com/secure-account"
    darkMode={true}
    poweredBy={true}
  />
)

/**
 * Displays a preview of the pre-rendered PasswordChangedEmail inside an iframe.
 *
 * @returns A React element containing an `iframe` whose `srcDoc` is the pre-rendered email HTML.
 */
function RouteComponent() {
  return (
    <iframe
      title="Password Changed Email Preview"
      srcDoc={html}
      className="grow w-full border-0"
    />
  )
}
