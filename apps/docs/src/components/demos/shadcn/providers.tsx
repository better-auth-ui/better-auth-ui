import { AuthProvider } from "@better-auth-ui/shadcn"
import { Link, useNavigate } from "@tanstack/react-router"
import type { ReactNode } from "react"

import { authClient } from "@/lib/auth-client"

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
