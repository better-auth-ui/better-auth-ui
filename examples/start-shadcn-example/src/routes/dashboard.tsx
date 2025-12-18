import { UserButton } from "@better-auth-ui/shadcn"
import { useAuthenticate } from "@better-auth-ui/shadcn/react"
import { createFileRoute } from "@tanstack/react-router"
import { Spinner } from "@/components/ui/spinner"

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
      <UserButton />
    </div>
  )
}
