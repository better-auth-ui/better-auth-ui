import { AuthProvider } from "@better-auth-ui/heroui"
import { organizationPlugin } from "@better-auth-ui/heroui/plugins/organization"
import type { ReactNode } from "react"

import { authClient } from "@/lib/auth-client"

export function OrganizationDemoWrapper({ children }: { children: ReactNode }) {
  return (
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      plugins={[organizationPlugin()]}
    >
      <div className="w-full">{children}</div>
    </AuthProvider>
  )
}
