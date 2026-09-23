import { AuthProvider } from "@/components/auth/auth-provider"
import { UserProfile } from "@/components/auth/settings/account/user-profile"
import { usernamePlugin } from "@/lib/auth/username-plugin"
import { authClient } from "@/lib/auth-client"

export function UserProfileUsernameDemo() {
  return (
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      plugins={[usernamePlugin({ isUsernameAvailable: true })]}
      Link={(props) => <a {...props} href={undefined} />}
    >
      <div className="w-full">
        <UserProfile />
      </div>
    </AuthProvider>
  )
}
