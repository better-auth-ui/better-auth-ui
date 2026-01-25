import { useAuthenticate, useUpdateUser } from "@better-auth-ui/heroui/react"
import { Spinner } from "@heroui/react"
import { createFileRoute, Link } from "@tanstack/react-router"

export const Route = createFileRoute("/dashboard")({
  component: Dashboard
})

function Dashboard() {
  const { data: sessionData } = useAuthenticate()
  const { mutate } = useUpdateUser()

  if (!sessionData) {
    return (
      <div className="min-h-svh flex items-center justify-center">
        <Spinner color="current" />
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
