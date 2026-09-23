import { AuthProvider } from "@/components/auth/auth-provider"
import { UserButton } from "@/components/auth/user/user-button"
import { multiSessionPlugin } from "@/lib/auth/multi-session-plugin"
import { authClient } from "@/lib/auth-client"

export function SwitchAccountSubmenuDemo() {
  return (
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      plugins={[multiSessionPlugin()]}
      socialProviders={["github", "google"]}
      Link={(props) => <a {...props} href={undefined} />}
    >
      <UserButton />
    </AuthProvider>
  )
}
