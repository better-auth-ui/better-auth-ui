import { AuthProvider } from "@better-auth-ui/heroui"
import {
  ManageAccounts,
  multiSessionPlugin
} from "@better-auth-ui/heroui/plugins/multi-session"

import { authClient } from "@/lib/auth-client"

export function ManageAccountsDemo() {
  return (
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      plugins={[multiSessionPlugin()]}
    >
      <div className="w-full">
        <ManageAccounts />
      </div>
    </AuthProvider>
  )
}
