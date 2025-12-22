import { AuthProvider } from "@better-auth-ui/heroui/react"
import { Toaster } from "sonner"
import { authClient } from "@/lib/auth-client"

export function DemoProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthProvider
        authClient={authClient}
        multiSession
        navigate={() => {}}
        replace={() => {}}
        Link={({ href, ...props }) => <a {...props} />}
      >
        {children}
      </AuthProvider>

      <Toaster />
    </>
  )
}
