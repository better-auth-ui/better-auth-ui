import { createFileRoute } from "@tanstack/solid-router"

import { UserButton } from "@/components/auth/user/user-button"

export const Route = createFileRoute("/")({
  component: HomePage
})

function HomePage() {
  return (
    <div class="grow flex items-center justify-center flex-col gap-4">
      <UserButton />
    </div>
  )
}
