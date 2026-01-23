"use client"

import { AuthProvider } from "@better-auth-ui/heroui"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
  const router = useRouter()

  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
      <RouterProvider navigate={router.push}>
        <AuthProvider
          authClient={authClient}
          socialProviders={["google", "github"]}
          magicLink
          multiSession
          navigate={({ to, replace }) =>
            replace ? router.replace(to) : router.push(to)
          }
          Link={Link}
        >
          {children}

          <Toaster />
        </AuthProvider>
      </RouterProvider>
    </ThemeProvider>
  )
}
