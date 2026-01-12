"use client"

import type { User } from "better-auth"

import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "@/hooks/auth/use-session"
import { cn } from "@/lib/utils"
import { UserAvatar } from "./user-avatar"

export type UserViewProps = {
  className?: string
  isPending?: boolean
  user?: User & { username?: string | null; displayUsername?: string | null }
}

/**
 * Display a user's avatar alongside their primary display name and email.
 *
 * If `user` is omitted, the current session user is used when available. When `isPending` is true (or the session is pending) and no explicit `user` is provided, a loading skeleton is shown instead of user details.
 *
 * @param isPending - When true, force rendering of the loading skeleton unless an explicit `user` prop is provided
 * @param user - Optional user object to display; when omitted the current session user is used if available
 * @returns A React element containing the user's avatar and name/email, or a skeleton loading state when pending and no explicit user is provided
 */
export function UserView({ className, isPending, user }: UserViewProps) {
  const { data: sessionData, isPending: sessionPending } = useSession()

  const resolvedUser = user ?? sessionData?.user

  if ((isPending || sessionPending) && !user) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <UserAvatar isPending />

        <div className="grid flex-1 gap-1 text-left text-sm">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <UserAvatar user={resolvedUser} />

      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">
          {resolvedUser?.displayUsername ||
            resolvedUser?.name ||
            resolvedUser?.email}
        </span>

        {(resolvedUser?.displayUsername || resolvedUser?.name) && (
          <span className="text-muted-foreground truncate text-xs">
            {resolvedUser?.email}
          </span>
        )}
      </div>
    </div>
  )
}
