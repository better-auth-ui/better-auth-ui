import { Skeleton } from "../../../primitives/skeleton"
import { Box } from "../../../primitives/styled"

/**
 * Loading placeholder for a single API key row. Mirrors the heroui
 * `ApiKeySkeleton`, adapted for React Native: `div`s become `View`s and
 * flex classes are RN's row/column equivalents.
 */
export function ApiKeySkeleton() {
  return (
    <Box className="flex-row items-center justify-between">
      <Box className="flex-row items-center gap-3">
        <Skeleton className="size-10 rounded-xl" />

        <Box className="flex-col gap-1">
          <Skeleton className="h-4 w-28 rounded-lg" />
          <Skeleton className="h-3 w-36 rounded-lg" />
          <Skeleton className="h-3 w-32 rounded-lg" />
        </Box>
      </Box>
    </Box>
  )
}
