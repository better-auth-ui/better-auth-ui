import { Skeleton } from "../../../primitives/skeleton"
import { Box } from "../../../primitives/styled"

/**
 * Placeholder matching {@link DeleteOrganization} while the delete permission resolves.
 */
export function DeleteOrganizationSkeleton() {
  return (
    <Box className="flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <Box className="flex-col gap-1">
        <Skeleton className="h-3.5 w-40 rounded-lg" />
        <Skeleton className="h-3 w-64 rounded-lg" />
      </Box>

      <Skeleton className="h-8 w-36 shrink-0 rounded-full" />
    </Box>
  )
}
