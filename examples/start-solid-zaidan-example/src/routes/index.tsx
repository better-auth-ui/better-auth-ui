import { createFileRoute } from "@tanstack/solid-router"

import { AuthProvider } from "@/components/auth/auth-provider"
import { SignIn } from "@/components/auth/sign-in"

export const Route = createFileRoute("/")({
  component: HomePage
})

function HomePage() {
  return (
    <div class="grow flex items-center justify-center flex-col gap-4">
      <AuthProvider>
        <SignIn />
      </AuthProvider>
    </div>
  )
}
