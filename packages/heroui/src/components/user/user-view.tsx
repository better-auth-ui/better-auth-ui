import type { AnyAuthConfig } from "@better-auth-ui/react"
import { cn, Skeleton } from "@heroui/react"
import type { User } from "better-auth"

import { useAuth } from "../../hooks/use-auth"
import { UserAvatar } from "./user-avatar"

export type UserViewProps = AnyAuthConfig & {
  className?: string
  isPending?: boolean
  size?: "sm" | "md" | "lg"
  user?: User & { username?: string | null; displayUsername?: string | null }
}

/**
 * Render a user view that shows the user's avatar alongside their name and email.
 *
 * @param className - Additional CSS classes applied to the outer container
 * @param isPending - When true, force rendering of the loading skeleton (unless an explicit `user` prop is provided)
 * @param size - Size variant for the avatar ("sm" | "md" | "lg"), defaults to "sm"
 * @param user - Optional user object to display; when omitted the current session user is used if available
 * @returns A React element that displays the user's avatar with their name and email
 */
export function UserView({
  className,
  isPending,
  size = "sm",
  user,
  ...config
}: UserViewProps) {
  const { authClient } = useAuth(config)

  const { data: sessionData, isPending: sessionPending } =
    authClient.useSession()

  const resolvedUser = user ?? sessionData?.user

  if ((isPending || sessionPending) && !user) {
    return (
      <div className={cn("flex items-center gap-2 min-w-0", className)}>
        <UserAvatar isPending size={size} {...config} />

        <div className="flex flex-col gap-1.5 min-w-0">
          <Skeleton className="h-4 w-24 rounded-lg" />
          <Skeleton className="h-3 w-32 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-2 min-w-0", className)}>
      <UserAvatar user={resolvedUser} size={size} {...config} />

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
