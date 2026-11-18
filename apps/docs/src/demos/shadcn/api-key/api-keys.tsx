import type { ComponentProps } from "react"
import { ApiKeys } from "@/components/auth/api-key/api-keys"
import { AuthProvider } from "@/components/auth/auth-provider"
import { apiKeyPlugin } from "@/lib/auth/api-key-plugin"
import { authClient } from "@/lib/auth-client"

export function ApiKeysDemo() {
  return (
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      plugins={[apiKeyPlugin()]}
      Link={DemoLink}
    >
      <div className="w-full">
        <ApiKeys />
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
