import type { ComponentProps } from "react"
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
      Link={DemoLink}
    >
      <SignInUsername />
    </AuthProvider>
  )
}

function DemoLink({ children, ...props }: ComponentProps<"a">) {
  return (
    <a {...props} href={undefined}>
      {children}
    </a>
  )
}
