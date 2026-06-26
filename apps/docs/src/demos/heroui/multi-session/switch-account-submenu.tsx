import { AuthProvider, UserButton } from "@better-auth-ui/heroui"
import { multiSessionPlugin } from "@better-auth-ui/heroui/plugins/multi-session"
import { authClient } from "@/lib/auth-client"

export function SwitchAccountSubmenuDemo() {
  return (
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      plugins={[multiSessionPlugin()]}
      socialProviders={["github", "google"]}
    >
      <UserButton />
    </AuthProvider>
  )
}
