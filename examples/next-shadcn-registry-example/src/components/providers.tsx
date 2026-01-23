"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ThemeProvider } from "next-themes"
import type { ReactNode } from "react"

import { authClient } from "@/lib/auth-client"
import { AuthProvider } from "./auth/auth-provider"

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter()

  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
      <AuthProvider
        authClient={authClient}
        navigate={({ to, replace }) =>
          replace ? router.replace(to) : router.push(to)
        }
        Link={Link}
      >
        {children}
      </AuthProvider>
    </ThemeProvider>
  )
}
