import { ApiKeys } from "@/components/auth/api-key/api-keys"
import { AuthProvider } from "@/components/auth/auth-provider"
import { apiKeyPlugin } from "@/lib/auth/api-key-plugin"
import { authClient } from "@/lib/auth-client"

export function ApiKeysDemo() {
  return (
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      plugins={[apiKeyPlugin()]}
      Link={(props) => <a {...props} href={undefined} />}
    >
      <div className="w-full">
        <ApiKeys />
      </div>
    </AuthProvider>
  )
}
