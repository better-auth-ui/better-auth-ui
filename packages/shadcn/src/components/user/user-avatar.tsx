"use client"

import type { AnyAuthConfig } from "@better-auth-ui/react"
import type { User } from "better-auth"
import { User2 } from "lucide-react"
import type { ReactNode } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/auth/use-auth"
import { cn } from "@/lib/utils"

export type UserAvatarProps = AnyAuthConfig & {
  className?: string
  fallback?: ReactNode
  isPending?: boolean
  rounded?: boolean
  user?: User & { username?: string | null; displayUsername?: string | null }
}

/**
 * Renders the current user's avatar using session data.
 * Shows a skeleton while loading and falls back to initials when no image is available.
 */
export function UserAvatar({
  className,
  user,
  isPending,
  fallback,
  rounded,
  ...config
}: UserAvatarProps) {
  const { authClient } = useAuth(config)

  const { data: sessionData, isPending: sessionPending } =
    authClient.useSession()

  if ((isPending || sessionPending) && !user) {
    return (
      <Skeleton
        className={cn(
          "size-8",
          rounded ? "rounded-full" : "rounded-lg",
          className
        )}
      />
    )
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
        "size-8 bg-muted text-foreground",
        rounded ? "rounded-full" : "rounded-lg",
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
        {fallback || initials || <User2 />}
      </AvatarFallback>
    </Avatar>
  )
}
