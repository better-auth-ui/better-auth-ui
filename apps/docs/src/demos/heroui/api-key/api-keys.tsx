import { AuthProvider } from "@better-auth-ui/heroui"
import { ApiKeys, apiKeyPlugin } from "@better-auth-ui/heroui/plugins/api-key"

import { authClient } from "@/lib/auth-client"

export function ApiKeysDemo() {
  return (
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      plugins={[apiKeyPlugin()]}
    >
      <div className="w-full">
        <ApiKeys />
      </div>
    </AuthProvider>
  )
}
