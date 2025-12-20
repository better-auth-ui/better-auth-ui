import { type AnyAuthConfig, useAuth } from "@better-auth-ui/react"
import { UserIcon } from "@heroicons/react/24/outline"
import { Avatar, cn, Skeleton } from "@heroui/react"
import type { User } from "better-auth"
import type { ReactNode } from "react"

export type UserAvatarProps = AnyAuthConfig & {
  className?: string
  fallback?: ReactNode
  isPending?: boolean
  user?: User & { username?: string | null; displayUsername?: string | null }
  size?: "sm" | "md" | "lg"
}

export function UserAvatar({
  className,
  fallback,
  isPending,
  user,
  size = "sm",
  ...config
}: UserAvatarProps) {
  const { authClient } = useAuth(config)

  const { data: sessionData, isPending: sessionPending } =
    authClient.useSession()

  if ((isPending || sessionPending) && !user) {
    return (
      <Skeleton
        className={cn(
          "rounded-full",
          size === "sm" ? "size-8" : size === "md" ? "size-10" : "size-12",
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
    <Avatar size={size} className={cn("rounded-full", className)}>
      <Avatar.Image
        alt={
          resolvedUser?.displayUsername ||
          resolvedUser?.name ||
          resolvedUser?.email
        }
        src={resolvedUser?.image ?? undefined}
      />

      <Avatar.Fallback delayMs={resolvedUser?.image ? 600 : undefined}>
        {fallback || initials || <UserIcon className="size-4" />}
      </Avatar.Fallback>
    </Avatar>
  )
}
