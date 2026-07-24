"use client"

import { Skeleton } from "@/components/ui/skeleton"

/**
 * Placeholder matching `DeleteOrganization` while the delete permission resolves.
 */
export function DeleteOrganizationSkeleton() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-3.5 w-40 rounded-md" />
        <Skeleton className="h-3 w-64 rounded-md" />
      </div>

      <Skeleton className="h-8 w-36 shrink-0 rounded-md" />
    </div>
  )
}
