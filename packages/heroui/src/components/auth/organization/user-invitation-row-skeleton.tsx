import { Skeleton } from "@heroui/react"
import type { JSX } from "react/jsx-runtime"

/**
 * Placeholder row matching {@link UserInvitationRow} while invitations load.
 */
export function UserInvitationRowSkeleton(): JSX.Element {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="size-10 shrink-0 rounded-xl" />

      <div className="flex flex-col gap-1">
        <Skeleton className="h-4 w-40 rounded-lg" />
        <Skeleton className="h-3 w-28 rounded-lg" />
      </div>
    </div>
  )
}
