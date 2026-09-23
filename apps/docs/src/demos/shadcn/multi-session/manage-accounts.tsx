import { AuthProvider } from "@/components/auth/auth-provider"
import { ManageAccounts } from "@/components/auth/multi-session/manage-accounts"
import { multiSessionPlugin } from "@/lib/auth/multi-session-plugin"
import { authClient } from "@/lib/auth-client"

export function ManageAccountsDemo() {
  return (
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      plugins={[multiSessionPlugin()]}
      Link={(props) => <a {...props} href={undefined} />}
    >
      <div className="w-full">
        <ManageAccounts />
      </div>
    </AuthProvider>
  )
}
