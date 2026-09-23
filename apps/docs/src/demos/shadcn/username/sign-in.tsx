import { AuthProvider } from "@/components/auth/auth-provider"
import { SignInUsername } from "@/components/auth/username/sign-in-username"
import { usernamePlugin } from "@/lib/auth/username-plugin"
import { authClient } from "@/lib/auth-client"

export function SignInUsernameDemo() {
  return (
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      plugins={[usernamePlugin({ isUsernameAvailable: true })]}
      Link={(props) => <a {...props} href={undefined} />}
    >
      <SignInUsername />
    </AuthProvider>
  )
}
