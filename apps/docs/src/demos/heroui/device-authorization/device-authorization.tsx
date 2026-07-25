import { AuthProvider } from "@better-auth-ui/heroui"
import {
  DeviceAuthorization,
  deviceAuthorizationPlugin
} from "@better-auth-ui/heroui/plugins"

import { authClient } from "@/lib/auth-client"

export function DeviceAuthorizationDemo() {
  return (
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      plugins={[deviceAuthorizationPlugin()]}
    >
      <DeviceAuthorization />
    </AuthProvider>
  )
}
