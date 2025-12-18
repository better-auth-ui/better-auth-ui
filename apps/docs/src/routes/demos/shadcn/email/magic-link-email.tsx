import { MagicLinkEmail } from "@better-auth-ui/react"
import { render } from "@react-email/render"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/shadcn/email/magic-link-email")({
  component: RouteComponent
})

const html = await render(
  <MagicLinkEmail
    url="https://better-auth-ui.com/auth/verify?token=example-token"
    appName="Better Auth UI"
    email="user@example.com"
    expirationMinutes={5}
    darkMode={true}
    poweredBy={true}
  />
)

/**
 * Renders an iframe that previews the Magic Link email HTML.
 *
 * @returns An iframe JSX element whose `srcDoc` contains the rendered email HTML for previewing.
 */
function RouteComponent() {
  return (
    <iframe
      title="Magic Link Email Preview"
      srcDoc={html}
      className="grow w-full border-0"
    />
  )
}