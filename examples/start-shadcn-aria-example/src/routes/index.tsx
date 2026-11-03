import { createFileRoute } from "@tanstack/react-router"

import { UserButton } from "@/components/auth/user/user-button"

export const Route = createFileRoute("/")({ component: App })

function App() {
  return (
    <div className="grow flex items-center justify-center flex-col gap-4">
      <UserButton />
    </div>
  )
}
