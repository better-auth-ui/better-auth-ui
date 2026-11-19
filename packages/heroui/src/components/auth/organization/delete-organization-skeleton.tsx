import { Skeleton } from "@heroui/react"
import type { JSX } from "react/jsx-runtime"

/**
 * Placeholder matching {@link DeleteOrganization} while the delete permission resolves.
 */
export function DeleteOrganizationSkeleton(): JSX.Element {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-3.5 w-40 rounded-lg" />
        <Skeleton className="h-3 w-64 rounded-lg" />
      </div>

      <Skeleton className="h-8 w-36 shrink-0 rounded-full" />
    </div>
  )
}
