import { AuthProvider } from "@better-auth-ui/heroui"
import {
  OrganizationSwitcher,
  organizationPlugin
} from "@better-auth-ui/heroui/plugins/organization"

import { authClient } from "@/lib/auth-client"

export function OrganizationSwitcherDemo() {
  return (
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      plugins={[organizationPlugin()]}
    >
      <OrganizationSwitcher placement="bottom" />
    </AuthProvider>
  )
}
