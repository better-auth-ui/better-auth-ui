import type { ComponentProps } from "react"
import { AuthProvider } from "@/components/auth/auth-provider"
import { MagicLink } from "@/components/auth/magic-link"
import { magicLinkPlugin } from "@/lib/auth/magic-link-plugin"
import { authClient } from "@/lib/auth-client"

export function MagicLinkDemo() {
  return (
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      plugins={[magicLinkPlugin()]}
      socialProviders={["github", "google"]}
      Link={DemoLink}
    >
      <MagicLink />
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
