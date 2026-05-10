import { createFileRoute } from "@tanstack/solid-router"

import { SignIn } from "@/components/auth/sign-in"

export const Route = createFileRoute("/")({
  component: HomePage
})

function HomePage() {
  return <SignIn />
}
