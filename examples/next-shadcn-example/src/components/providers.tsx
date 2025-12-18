"use client"

import { AuthProvider } from "@better-auth-ui/shadcn/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ThemeProvider } from "next-themes"
import type { ReactNode } from "react"

import { authClient } from "@/lib/auth-client"

/**
 * Wraps children with ThemeProvider and AuthProvider configured for the application.
 *
 * @param children - React nodes to render inside the providers.
 * @returns A React element tree consisting of ThemeProvider (defaulting to the system theme) that contains AuthProvider wired to the app's auth client and Next.js navigation helpers.
 */
export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter()

  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
      <AuthProvider
        authClient={authClient}
        navigate={router.push}
        replace={router.replace}
        Link={Link}
      >
        {children}
      </AuthProvider>
    </ThemeProvider>
  )
}
