import type { ErrorComponentProps } from "@tanstack/react-router"
import { Link } from "@tanstack/react-router"
import { Home, RotateCcw } from "lucide-react"
import { StatusPage } from "@/components/status-page"
import { statusPageActionClassName } from "@/components/status-page-action"

export function ErrorPage({ error, reset }: ErrorComponentProps) {
  const message =
    error instanceof Error ? error.message : "An unknown error occurred."

  return (
    <StatusPage
      code="500"
      title="The docs hit an error"
      description="We could not load this page. Try again, or return home if the problem continues."
    >
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className={statusPageActionClassName()}
          onClick={reset}
        >
          <RotateCcw data-icon="inline-start" />
          Try again
        </button>
        <Link
          to="/"
          className={statusPageActionClassName({ variant: "outline" })}
        >
          <Home data-icon="inline-start" />
          Back home
        </Link>
      </div>

      {import.meta.env.DEV && (
        <details className="max-w-md text-sm">
          <summary className="cursor-pointer font-medium text-fd-foreground">
            Technical details
          </summary>
          <pre className="mt-3 max-h-40 overflow-auto rounded-lg border border-fd-border bg-fd-muted/50 p-3 text-xs whitespace-pre-wrap text-fd-muted-foreground">
            {message}
          </pre>
        </details>
      )}
    </StatusPage>
  )
}
