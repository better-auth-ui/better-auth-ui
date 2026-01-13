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
 * Render a compact user item with an avatar, a primary label (display username, name, or email), and an optional secondary email line.
 *
 * @param isPending - If true and no `user` prop is provided, renders a loading skeleton instead of user details
 * @param className - Additional CSS classes applied to the outer container
 * @param user - Optional user object to display; when omitted the current session user is used
 * @returns A React element showing the user's avatar with their identifying information
 */
export function UserView({ className, isPending, user }: UserViewProps) {
  const { data: sessionData, isPending: sessionPending } = useSession({
    enabled: !user && !isPending
  })

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
