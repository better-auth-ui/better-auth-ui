import { viewPaths } from "@better-auth-ui/core"
import { createFileRoute, redirect } from "@tanstack/react-router"

import { Auth } from "@/components/auth/auth"
import { emailOtpPlugin } from "@/lib/auth/email-otp-plugin"
import { magicLinkPlugin } from "@/lib/auth/magic-link-plugin"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { twoFactorPlugin } from "@/lib/auth/two-factor-plugin"

const validAuthPathSegments = new Set([
  ...Object.values(viewPaths.auth),
  magicLinkPlugin().viewPaths.auth.magicLink,
  organizationPlugin().viewPaths.auth.acceptInvitation,
  emailOtpPlugin().viewPaths.auth.emailOtp,
  twoFactorPlugin().viewPaths.auth.twoFactor
])

export const Route = createFileRoute("/auth/$path")({
  beforeLoad({ params: { path } }) {
    if (!validAuthPathSegments.has(path)) {
      throw redirect({ to: "/" })
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
