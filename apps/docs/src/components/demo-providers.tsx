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
        // biome-ignore lint/a11y/useValidAnchor: this is a demo
        Link={({ href, ...props }) => <a href="#" {...props} />}
      >
        {children}
      </AuthProvider>

      <Toaster />
    </>
  )
}
