import { AuthProvider } from "@/components/auth/auth-provider"
import { MagicLink } from "@/components/auth/magic-link"
import { magicLinkPlugin } from "@/lib/auth/magic-link-plugin"
import { authClient } from "@/lib/auth-client"

export function MagicLinkDemo() {
  return (
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      plugins={[magicLinkPlugin()]}
      socialProviders={["github", "google"]}
      Link={(props) => <a {...props} href={undefined} />}
    >
      <MagicLink />
    </AuthProvider>
  )
}
