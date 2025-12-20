import { AuthProvider } from "@better-auth-ui/heroui/react"
import { Link, useNavigate } from "@tanstack/react-router"
import { ThemeProvider } from "next-themes"
import type { ReactNode } from "react"
import { RouterProvider } from "react-aria-components"
import { Toaster } from "sonner"

import { authClient } from "@/lib/auth-client"

/**
 * Wraps the app UI with theme, routing, authentication, and global toast providers.
 *
 * @param children - The application UI to render inside the providers
 * @returns A React element containing ThemeProvider > RouterProvider > AuthProvider with the provided `children` and a global `Toaster`
 */
export function Providers({ children }: { children: ReactNode }) {
  const navigate = useNavigate()

  return (
    <ThemeProvider defaultTheme="system" enableSystem>
      <RouterProvider navigate={(path) => navigate({ to: path })}>
        <AuthProvider
          authClient={authClient}
          socialProviders={["google", "github"]}
          magicLink
          navigate={(path) => navigate({ to: path })}
          replace={(path) => navigate({ to: path, replace: true })}
          Link={({ href, ...props }) => <Link to={href} {...props} />}
        >
          {children}

          <Toaster />
        </AuthProvider>
      </RouterProvider>
    </ThemeProvider>
  )
}
