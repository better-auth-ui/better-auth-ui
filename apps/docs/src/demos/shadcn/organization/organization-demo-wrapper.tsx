import type { ComponentProps, ReactNode } from "react"

import { AuthProvider } from "@/components/auth/auth-provider"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { authClient } from "@/lib/auth-client"

export function OrganizationDemoWrapper({ children }: { children: ReactNode }) {
  return (
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      plugins={[organizationPlugin()]}
      Link={DemoLink}
    >
      <div className="w-full">{children}</div>
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
