import type { ComponentProps } from "react"
import { AuthProvider } from "@/components/auth/auth-provider"
import { SignIn } from "@/components/auth/sign-in"
import { passkeyPlugin } from "@/lib/auth/passkey-plugin"
import { authClient } from "@/lib/auth-client"

export function PasskeySignInDemo() {
  return (
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      plugins={[passkeyPlugin()]}
      socialProviders={["github", "google"]}
      Link={DemoLink}
    >
      <SignIn />
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
