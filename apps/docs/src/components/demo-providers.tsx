import { AuthProvider } from "@better-auth-ui/heroui/react"
import { authClient } from "@/lib/auth-client"

export function DemoProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      replace={() => {}}
      Link={({ href, ...props }) => <a {...props} />}
    >
      {children}
    </AuthProvider>
  )
}
