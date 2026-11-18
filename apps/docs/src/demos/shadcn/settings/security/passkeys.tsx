import type { ComponentProps } from "react"
import { AuthProvider } from "@/components/auth/auth-provider"
import { Passkeys } from "@/components/auth/passkey/passkeys"
import { passkeyPlugin } from "@/lib/auth/passkey-plugin"
import { authClient } from "@/lib/auth-client"

export function PasskeysDemo() {
  return (
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      plugins={[passkeyPlugin()]}
      Link={DemoLink}
    >
      <div className="w-full">
        <Passkeys />
      </div>
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
