import { AuthProvider } from "@better-auth-ui/heroui"
import { Link, useNavigate } from "@tanstack/react-router"
import type { ReactNode } from "react"

import { authClient } from "@/lib/auth-client"

/**
 * Wraps the given children with an AuthProvider configured for the application.
 *
 * @param children - Elements to render inside the AuthProvider
 * @returns The children wrapped with the configured AuthProvider component
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