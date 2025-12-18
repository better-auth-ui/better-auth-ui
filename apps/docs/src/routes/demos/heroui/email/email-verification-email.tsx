import { EmailVerificationEmail } from "@better-auth-ui/heroui"
import { render } from "@react-email/render"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/demos/heroui/email/email-verification-email"
)({
  component: RouteComponent
})

const html = await render(
  <EmailVerificationEmail
    url="https://better-auth-ui.com/auth/verify-email?token=example-token"
    appName="Better Auth UI"
    email="user@example.com"
    expirationMinutes={60}
    darkMode={true}
    poweredBy={true}
  />
)

function RouteComponent() {
  return (
    <iframe
      title="Email Verification Email Preview"
      srcDoc={html}
      className="grow w-full border-0"
    />
  )
}
