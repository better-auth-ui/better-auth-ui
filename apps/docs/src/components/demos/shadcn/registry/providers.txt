import { Link, useNavigate } from "@tanstack/react-router"
import type { ReactNode } from "react"

import { AuthProvider } from "@/components/auth/auth-provider"
import { authClient } from "@/lib/auth-client"

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
