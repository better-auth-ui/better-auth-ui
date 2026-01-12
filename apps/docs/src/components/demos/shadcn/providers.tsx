import { AuthProvider } from "@better-auth-ui/shadcn"
import { Link, useNavigate } from "@tanstack/react-router"
import type { ReactNode } from "react"

import { authClient } from "@/lib/auth-client"

/**
 * Wraps children with an AuthProvider preconfigured for magic link, multi-session, social sign-in, and app navigation.
 *
 * @returns The AuthProvider React element that renders `children` within the configured authentication context.
 */
export function Providers({ children }: { children: ReactNode }) {
  const navigate = useNavigate()

  return (
    <AuthProvider
      authClient={authClient}
      magicLink
      multiSession
      navigate={(path) => navigate({ to: path })}
      replace={(path) => navigate({ to: path, replace: true })}
      socialProviders={["github", "google"]}
      Link={({ href, ...props }) => <Link to={href} {...props} />}
    >
      {children}
    </AuthProvider>
  )
}