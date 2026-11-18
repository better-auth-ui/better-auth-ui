import type { ComponentProps } from "react"
import { AuthProvider } from "@/components/auth/auth-provider"
import { DangerZone } from "@/components/auth/delete-user/danger-zone"
import { deleteUserPlugin } from "@/lib/auth/delete-user-plugin"
import { authClient } from "@/lib/auth-client"

export function DangerZoneDemo() {
  return (
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      plugins={[deleteUserPlugin()]}
      socialProviders={["github", "google"]}
      Link={DemoLink}
    >
      <div className="w-full">
        <DangerZone />
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
