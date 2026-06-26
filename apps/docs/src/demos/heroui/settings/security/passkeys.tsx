import { AuthProvider } from "@better-auth-ui/heroui"
import { Passkeys, passkeyPlugin } from "@better-auth-ui/heroui/plugins/passkey"

import { authClient } from "@/lib/auth-client"

export function PasskeysDemo() {
  return (
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      plugins={[passkeyPlugin()]}
    >
      <div className="w-full">
        <Passkeys />
      </div>
    </AuthProvider>
  )
}
