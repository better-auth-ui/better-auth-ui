import { Link, useNavigate } from "@tanstack/react-router"
import { ThemeProvider } from "next-themes"
import type { ReactNode } from "react"

import { AuthProvider } from "@/components/auth/auth-provider"
import { authClient } from "@/lib/auth-client"
import { Toaster } from "./ui/sonner"

export function Providers({ children }: { children: ReactNode }) {
  const navigate = useNavigate()

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider
        authClient={authClient}
        magicLink
        socialProviders={["github", "google"]}
        navigate={(path) => navigate({ to: path })}
        replace={(path) => navigate({ to: path, replace: true })}
        Link={({ href, ...props }) => <Link to={href} {...props} />}
      >
        {children}

        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  )
}
