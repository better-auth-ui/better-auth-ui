"use client"

import { AuthProvider } from "@better-auth-ui/heroui"
import { deleteUserPlugin } from "@better-auth-ui/heroui/plugins/delete-user"
import { Toast } from "@heroui/react"
import { QueryClientProvider } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"

import { authClient } from "@/lib/auth-client"
import { getQueryClient } from "@/lib/query-client"

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter()
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider
        authClient={authClient}
        redirectTo="/settings/account"
        socialProviders={["google", "github"]}
        navigate={({ to, replace }) =>
          replace ? router.replace(to) : router.push(to)
        }
        plugins={[deleteUserPlugin()]}
      >
        {children}

        <Toast.Provider />
      </AuthProvider>
    </QueryClientProvider>
  )
}
