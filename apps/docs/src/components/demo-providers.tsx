import { AuthProvider } from "@better-auth-ui/heroui"
import { Toaster } from "sonner"
import { authClient } from "@/lib/auth-client"

/**
 * Wraps content with a demo-configured AuthProvider and renders a global Toaster.
 *
 * @param children - The React nodes to render inside the demo AuthProvider
 * @returns The rendered provider-wrapped children and a Toaster element
 */
export function DemoProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthProvider
        authClient={authClient}
        magicLink
        multiSession
        navigate={() => {}}
        replace={() => {}}
        socialProviders={["github", "google"]}
        settings={{
          theme: "system",
          setTheme: () => {}
        }}
        Link={({ href, ...props }) => (
          // biome-ignore lint/a11y/useValidAnchor: this is a demo
          <a href="#" onClick={(e) => e.preventDefault()} {...props} />
        )}
      >
        {children}
      </AuthProvider>

      <Toaster />
    </>
  )
}
