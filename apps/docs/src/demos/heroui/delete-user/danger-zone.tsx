import { AuthProvider } from "@better-auth-ui/heroui"
import {
  DangerZone,
  deleteUserPlugin
} from "@better-auth-ui/heroui/plugins/delete-user"

import { authClient } from "@/lib/auth-client"

export function DangerZoneDemo() {
  return (
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      plugins={[deleteUserPlugin()]}
      socialProviders={["github", "google"]}
    >
      <div className="w-full">
        <DangerZone />
      </div>
    </AuthProvider>
  )
}
