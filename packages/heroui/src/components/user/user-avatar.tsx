import { useSession } from "@better-auth-ui/react"
import { Person } from "@gravity-ui/icons"
import { Avatar, cn, Skeleton } from "@heroui/react"
import type { User } from "better-auth"
import type { ReactNode } from "react"

export type UserAvatarProps = {
  className?: string
  fallback?: ReactNode
  isPending?: boolean
  user?: User & { username?: string | null; displayUsername?: string | null }
  size?: "sm" | "md" | "lg"
}

/**
 * Render a user avatar that shows the user's image, initials, or a custom fallback; displays a circular skeleton while the session (or explicit pending flag) is pending.
 *
 * @param className - Additional CSS classes applied to the outer avatar container
 * @param fallback - Custom fallback content to render when no image or initials are available
 * @param isPending - When true, force rendering of the loading skeleton (unless an explicit `user` prop is provided)
 * @param user - Optional user object to display; when omitted the current session user is used if available
 * @param size - Visual size of the avatar; one of `"sm"`, `"md"`, or `"lg"` (default: `"sm"`)
 * @returns A React element that displays the user's avatar image, initials, or the provided fallback; renders a circular skeleton while loading
 */
export function UserAvatar({
  className,
  fallback,
  isPending,
  user,
  size = "sm"
}: UserAvatarProps) {
  const { data: sessionData, isPending: sessionPending } = useSession()

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

      <Avatar.Fallback
        className={cn(
          size === "lg" ? "text-xl" : size === "md" ? "text-base" : "text-sm"
        )}
        delayMs={resolvedUser?.image ? 600 : undefined}
      >
        {fallback || initials || <Person className="size-4" />}
      </Avatar.Fallback>
    </Avatar>
  )
}
