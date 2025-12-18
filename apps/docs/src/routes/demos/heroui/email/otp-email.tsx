import { OtpEmail } from "@better-auth-ui/heroui"
import { render } from "@react-email/render"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/heroui/email/otp-email")({
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

/**
 * Renders an iframe that previews the pre-rendered OTP email HTML.
 *
 * @returns A React element containing an iframe whose `srcDoc` is the rendered OTP email HTML.
 */
function RouteComponent() {
  return (
    <iframe
      title="OTP Email Preview"
      srcDoc={html}
      className="grow w-full border-0"
    />
  )
}
