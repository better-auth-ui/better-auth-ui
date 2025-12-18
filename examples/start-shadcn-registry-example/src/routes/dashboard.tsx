import { createFileRoute, Link } from "@tanstack/react-router"

import { Spinner } from "@/components/ui/spinner"
import { useAuthenticate } from "@/hooks/auth/use-authenticate"

export const Route = createFileRoute("/dashboard")({
  component: Dashboard
})

function Dashboard() {
  const { data: sessionData } = useAuthenticate()

  if (!sessionData) {
    return (
      <div className="min-h-svh flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl">Hello, {sessionData.user.email}</h1>

      <Link to="/auth/$path" params={{ path: "sign-out" }}>
        Sign Out
      </Link>
    </div>
  )
}
