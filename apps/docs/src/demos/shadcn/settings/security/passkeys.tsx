import { AuthProvider } from "@/components/auth/auth-provider"
import { Passkeys } from "@/components/auth/passkey/passkeys"
import { passkeyPlugin } from "@/lib/auth/passkey-plugin"
import { authClient } from "@/lib/auth-client"

export function PasskeysDemo() {
  return (
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      plugins={[passkeyPlugin()]}
      Link={(props) => <a {...props} href={undefined} />}
    >
      <div className="w-full">
        <Passkeys />
      </div>
    </AuthProvider>
  )
}
