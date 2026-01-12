import { useSession } from "@better-auth-ui/react"
import { cn, Skeleton } from "@heroui/react"
import type { User } from "better-auth"

import { UserAvatar } from "./user-avatar"

export type UserViewProps = {
  className?: string
  isPending?: boolean
  size?: "sm" | "md" | "lg"
  user?: User & { username?: string | null; displayUsername?: string | null }
}

/**
 * Render a compact user item with an avatar, a primary label (display username, name, or email), and an optional secondary email line.
 *
 * @param isPending - If true and no `user` prop is provided, renders a loading skeleton instead of user details
 * @param size - Avatar size variant; defaults to `"sm"`
 * @param user - Optional user to display; when omitted the current session user is used if available
 * @returns A React element containing the user's avatar and text labels
 */
export function UserView({
  className,
  isPending,
  size = "sm",
  user
}: UserViewProps) {
  const { data: sessionData, isPending: sessionPending } = useSession()

  const resolvedUser = user ?? sessionData?.user

  if ((isPending || sessionPending) && !user) {
    return (
      <div className={cn("flex items-center gap-2 min-w-0", className)}>
        <UserAvatar isPending size={size} />

        <div className="flex flex-col gap-1.5 min-w-0">
          <Skeleton className="h-4 w-24 rounded-lg" />
          <Skeleton className="h-3 w-32 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-2 min-w-0", className)}>
      <UserAvatar user={resolvedUser} size={size} />

      <div className="min-w-0">
        <p className="text-sm font-medium truncate">
          {resolvedUser?.displayUsername ||
            resolvedUser?.name ||
            resolvedUser?.email}
        </p>

        {(resolvedUser?.displayUsername || resolvedUser?.name) && (
          <p className="text-muted text-xs mb-0.5 truncate overflow-x-hidden">
            {resolvedUser?.email}
          </p>
        )}
      </div>
    </div>
  )
}
