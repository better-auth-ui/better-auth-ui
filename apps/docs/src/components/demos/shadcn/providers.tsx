import type { ComponentProps, ReactNode } from "react"

import { AuthProvider } from "@/components/auth/auth-provider"
import { authClient } from "@/lib/auth-client"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      socialProviders={["github", "google"]}
      Link={DemoLink}
    >
      {children}
    </AuthProvider>
  )
}

function DemoLink({ children, ...props }: ComponentProps<"a">) {
  return (
    <a {...props} href={undefined}>
      {children}
    </a>
  )
}
