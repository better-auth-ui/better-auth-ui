import { AuthProvider } from "@better-auth-ui/heroui"
import {
  MagicLink,
  magicLinkPlugin
} from "@better-auth-ui/heroui/plugins/magic-link"

import { authClient } from "@/lib/auth-client"

export function MagicLinkDemo() {
  return (
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      plugins={[magicLinkPlugin()]}
      socialProviders={["github", "google"]}
    >
      <MagicLink />
    </AuthProvider>
  )
}
