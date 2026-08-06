import { AuthProvider } from "@better-auth-ui/heroui"
import {
  SignInUsername,
  usernamePlugin
} from "@better-auth-ui/heroui/plugins/username"

import { authClient } from "@/lib/auth-client"

export function SignInUsernameDemo() {
  return (
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      plugins={[usernamePlugin({ isUsernameAvailable: true })]}
    >
      <SignInUsername />
    </AuthProvider>
  )
}
