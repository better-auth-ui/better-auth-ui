import { AuthProvider } from "@better-auth-ui/heroui"
import { Toast } from "@heroui/react"
import { Link, useNavigate } from "@tanstack/react-router"
import { useTheme } from "next-themes"
import type { ReactNode } from "react"
import { RouterProvider } from "react-aria-components"
import { authClient } from "@/lib/auth-client"

/**
 * Wraps the app UI with theme, routing, authentication, and global toast providers.
 *
 * @param children - The application UI to render inside the providers
 * @returns A React element containing ThemeProvider > RouterProvider > AuthProvider with the provided `children` and a global `Toaster`
 */
export function Providers({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  return (
    <RouterProvider navigate={(path) => navigate({ href: path })}>
      <AuthProvider
        authClient={authClient}
        socialProviders={["google", "github"]}
        magicLink
        multiSession
        navigate={navigate}
        settings={{
          theme,
          setTheme
        }}
        Link={Link}
      >
        {children}

        <Toast.Container />
      </AuthProvider>
    </RouterProvider>
  )
}
