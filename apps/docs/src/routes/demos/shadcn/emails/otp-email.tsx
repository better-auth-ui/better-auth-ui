import { OtpEmail } from "@better-auth-ui/react"
import { render } from "@react-email/render"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/shadcn/emails/otp-email")({
  component: RouteComponent
})

const html = await render(
  <OtpEmail
    verificationCode="123456"
    email="user@example.com"
    appName="Better Auth UI"
    expirationMinutes={10}
    darkMode={true}
    poweredBy={true}
  />
)

function RouteComponent() {
  return (
    <iframe
      title="OTP Email Preview"
      srcDoc={html}
      className="grow w-full border-0"
    />
  )
}
