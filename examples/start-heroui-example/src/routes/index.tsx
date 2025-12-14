import { UserButton } from "@better-auth-ui/heroui"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({ component: App })

function App() {
  return (
    <div className="min-h-svh flex items-center justify-center flex-col gap-4">
      <UserButton />
    </div>
  )
}
