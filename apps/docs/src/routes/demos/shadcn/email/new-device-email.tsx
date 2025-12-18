import { NewDeviceEmail } from "@better-auth-ui/react"
import { render } from "@react-email/render"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/shadcn/email/new-device-email")({
  component: RouteComponent
})

const html = await render(
  <NewDeviceEmail
    userEmail="user@example.com"
    deviceInfo={{
      browser: "Chrome 120.0",
      os: "macOS 14.2",
      location: "San Francisco, CA",
      ipAddress: "192.168.1.1",
      timestamp: "January 15, 2024 at 3:30 PM"
    }}
    appName="Better Auth UI"
    supportEmail="support@example.com"
    secureAccountLink="https://better-auth-ui.com/secure-account"
    darkMode={true}
    poweredBy={true}
  />
)

/**
 * Displays the rendered new-device email HTML inside an iframe for preview.
 *
 * @returns A React element containing an iframe whose `srcDoc` is the pre-rendered email HTML.
 */
function RouteComponent() {
  return (
    <iframe
      title="New Device Email Preview"
      srcDoc={html}
      className="grow w-full border-0"
    />
  )
}
