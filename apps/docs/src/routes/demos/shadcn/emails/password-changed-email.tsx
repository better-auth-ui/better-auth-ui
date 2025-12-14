import { PasswordChangedEmail } from "@better-auth-ui/react"
import { render } from "@react-email/render"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/demos/shadcn/emails/password-changed-email"
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

function RouteComponent() {
  return (
    <iframe
      title="Password Changed Email Preview"
      srcDoc={html}
      className="grow w-full border-0"
    />
  )
}
