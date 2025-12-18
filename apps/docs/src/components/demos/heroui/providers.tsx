import { AuthProvider } from "@better-auth-ui/heroui/react"
import { Link, useNavigate } from "@tanstack/react-router"
import type { ReactNode } from "react"

import { authClient } from "@/lib/auth-client"

/**
 * Wraps content with the auth UI provider configured for the app's router and client.
 *
 * @param children - React nodes to render inside the provider
 * @returns A React element that renders an AuthProvider wired to the app's authClient and router
 */
export function Providers({ children }: { children: ReactNode }) {
  const navigate = useNavigate()

  return (
    <AuthProvider
      authClient={authClient}
      navigate={(path) => navigate({ to: path })}
      replace={(path) => navigate({ to: path, replace: true })}
      Link={({ href, ...props }) => <Link to={href} {...props} />}
    >
      {children}
    </AuthProvider>
  )
}
