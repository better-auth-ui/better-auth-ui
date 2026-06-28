import { AuthProvider, SignIn } from "@better-auth-ui/heroui"
import { passkeyPlugin } from "@better-auth-ui/heroui/plugins/passkey"

import { authClient } from "@/lib/auth-client"

export function PasskeySignInDemo() {
  return (
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      plugins={[passkeyPlugin()]}
      socialProviders={["github", "google"]}
    >
      <SignIn />
    </AuthProvider>
  )
}
