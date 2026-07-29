import { Link } from "@tanstack/react-router"
import { ArrowRight, Home } from "lucide-react"
import { StatusPage } from "@/components/status-page"
import { statusPageActionClassName } from "@/components/status-page-action"

export function NotFound() {
  return (
    <StatusPage
      code="404"
      title="Page not found"
      description="This address does not match a page in the Better Auth UI docs. The page may have moved, or the link may be outdated."
    >
      <div className="flex flex-wrap gap-3">
        <Link
          to="/docs/$"
          params={{ _splat: "shadcn" }}
          className={statusPageActionClassName()}
        >
          Browse documentation
          <ArrowRight data-icon="inline-end" />
        </Link>
        <Link
          to="/"
          className={statusPageActionClassName({ variant: "outline" })}
        >
          <Home data-icon="inline-start" />
          Back home
        </Link>
      </div>
    </StatusPage>
  )
}
