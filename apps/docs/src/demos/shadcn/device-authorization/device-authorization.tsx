import { AuthProvider } from "@/components/auth/auth-provider"
import { DeviceAuthorization } from "@/components/auth/device-authorization/device-authorization"
import { deviceAuthorizationPlugin } from "@/lib/auth/device-authorization-plugin"
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
