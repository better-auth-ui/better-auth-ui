import { AuthProvider } from "@better-auth-ui/shadcn/react"
import { Link, useNavigate } from "@tanstack/react-router"
import type { ReactNode } from "react"

import { authClient } from "@/lib/auth-client"

/**
 * Supplies authentication context and router-based navigation to its subtree for shadcn components.
 *
 * @param children - React nodes to render inside the authentication provider.
 * @returns A React element that wraps `children` with an AuthProvider configured with the app auth client and navigation and Link bindings.
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
