import { AuthProvider } from "@/components/auth/auth-provider"
import { SignUp } from "@/components/auth/sign-up"
import { usernamePlugin } from "@/lib/auth/username-plugin"
import { authClient } from "@/lib/auth-client"

export function SignUpUsernameDemo() {
  return (
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      plugins={[usernamePlugin({ isUsernameAvailable: true })]}
      Link={(props) => <a {...props} href={undefined} />}
    >
      <SignUp />
    </AuthProvider>
  )
}
