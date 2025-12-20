import { Account } from "@better-auth-ui/heroui"
import { viewPaths } from "@better-auth-ui/heroui/core"
import { createFileRoute, notFound } from "@tanstack/react-router"

export const Route = createFileRoute("/account/$path")({
  beforeLoad({ params: { path } }) {
    if (!Object.values(viewPaths.account).includes(path)) {
      throw notFound()
    }
  },
  component: AccountPage
})

function AccountPage() {
  const { path } = Route.useParams()

  return (
    <div className="min-h-svh container mx-auto p-4 md:p-6">
      <Account path={path} />
    </div>
  )
}
