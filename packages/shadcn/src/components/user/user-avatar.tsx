"use client"

import type { User } from "better-auth"
import { User2 } from "lucide-react"
import type { ReactNode } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "@/hooks/auth/use-session"
import { cn } from "@/lib/utils"

export type UserAvatarProps = {
  className?: string
  fallback?: ReactNode
  isPending?: boolean
  user?: User & { username?: string | null; displayUsername?: string | null }
}

/**
 * Render a circular user avatar using the provided user or the current session user.
 *
 * Shows the user's image when available; otherwise displays the provided `fallback`, the user's first two uppercase initials, or a default icon. If `isPending` is true or the session is loading and no `user` prop is supplied, renders a skeleton placeholder.
 *
 * @param className - Additional CSS classes applied to the avatar container
 * @param user - Optional user object to display instead of the session user
 * @param isPending - When true, show the skeleton placeholder if no `user` is provided
 * @param fallback - Node to render inside the avatar fallback area before initials or the default icon
 * @returns The avatar element
 */
export function UserAvatar({
  className,
  user,
  isPending,
  fallback
}: UserAvatarProps) {
  const { data: sessionData, isPending: sessionPending } = useSession()

  if ((isPending || sessionPending) && !user) {
    return <Skeleton className={cn("size-8 rounded-full", className)} />
  }

  const resolvedUser = user ?? sessionData?.user

  const initials = (
    resolvedUser?.username ||
    resolvedUser?.name ||
    resolvedUser?.email
  )
    ?.slice(0, 2)
    .toUpperCase()

  return (
    <Avatar
      className={cn(
        "size-8 bg-muted text-foreground text-sm rounded-full",
        className
      )}
    >
      <AvatarImage
        src={resolvedUser?.image ?? undefined}
        alt={
          resolvedUser?.displayUsername ||
          resolvedUser?.name ||
          resolvedUser?.email
        }
      />

      <AvatarFallback delayMs={resolvedUser?.image ? 600 : undefined}>
        {fallback || initials || <User2 className="size-4" />}
      </AvatarFallback>
    </Avatar>
  )
}
