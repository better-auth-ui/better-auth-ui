"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ThemeProvider } from "next-themes"
import type { ReactNode } from "react"

import { authClient } from "@/lib/auth-client"
import { AuthProvider } from "./auth/auth-provider"

/**
 * Wraps application content with theme and authentication providers.
 *
 * @param children - React nodes to be rendered inside the providers
 * @returns The provided children wrapped with ThemeProvider and AuthProvider, wiring authentication navigation to the Next.js router
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
