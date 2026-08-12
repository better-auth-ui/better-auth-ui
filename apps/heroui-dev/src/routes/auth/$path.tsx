import { viewPaths } from "@better-auth-ui/core"
import { Auth } from "@better-auth-ui/heroui"
import { deviceAuthorizationPlugin } from "@better-auth-ui/heroui/plugins/device-authorization"
import { emailOtpPlugin } from "@better-auth-ui/heroui/plugins/email-otp"
import { magicLinkPlugin } from "@better-auth-ui/heroui/plugins/magic-link"
import { organizationPlugin } from "@better-auth-ui/heroui/plugins/organization"
import { twoFactorPlugin } from "@better-auth-ui/heroui/plugins/two-factor"
import { createFileRoute, notFound } from "@tanstack/react-router"

/** Keep in sync with the auth-view plugins in `providers.tsx` if paths are customized. */
const validAuthPathSegments = new Set([
  ...Object.values(viewPaths.auth),
  deviceAuthorizationPlugin().viewPaths.auth.deviceAuthorization,
  magicLinkPlugin().viewPaths.auth.magicLink,
  organizationPlugin().viewPaths.auth.acceptInvitation,
  emailOtpPlugin().viewPaths.auth.emailOtp,
  twoFactorPlugin().viewPaths.auth.twoFactor
])

export const Route = createFileRoute("/auth/$path")({
  beforeLoad({ params: { path } }) {
    if (!validAuthPathSegments.has(path)) {
      throw notFound()
    }
  },
  component: AuthPage
})

function AuthPage() {
  const { path } = Route.useParams()

  return (
    <div className="flex justify-center my-auto p-4 md:p-6">
      <Auth path={path} />
    </div>
  )
}
