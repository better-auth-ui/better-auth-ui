import { AuthProvider, UserProfile } from "@better-auth-ui/heroui"
import { usernamePlugin } from "@better-auth-ui/heroui/plugins/username"

import { authClient } from "@/lib/auth-client"

export function UserProfileUsernameDemo() {
  return (
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      plugins={[usernamePlugin({ isUsernameAvailable: true })]}
    >
      <div className="w-full">
        <UserProfile />
      </div>
    </AuthProvider>
  )
}
