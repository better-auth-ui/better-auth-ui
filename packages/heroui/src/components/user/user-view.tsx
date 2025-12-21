import { type AnyAuthConfig, useAuth } from "@better-auth-ui/react"
import { cn, Skeleton } from "@heroui/react"
import type { User } from "better-auth"

import { UserAvatar } from "./user-avatar"

export type UserViewProps = AnyAuthConfig & {
  className?: string
  isPending?: boolean
  user?: User & { username?: string | null; displayUsername?: string | null }
}

/**
 * Render a user view that shows the user's avatar alongside their name and email.
 *
 * @param className - Additional CSS classes applied to the outer container
 * @param isPending - When true, force rendering of the loading skeleton (unless an explicit `user` prop is provided)
 * @param user - Optional user object to display; when omitted the current session user is used if available
 * @returns A React element that displays the user's avatar with their name and email
 */
export function UserView({
  className,
  isPending,
  user,
  ...config
}: UserViewProps) {
  const { authClient } = useAuth(config)

  const { data: sessionData, isPending: sessionPending } =
    authClient.useSession()

  const resolvedUser = user ?? sessionData?.user

  if ((isPending || sessionPending) && !user) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <UserAvatar isPending {...config} />

        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-24 rounded-lg" />
          <Skeleton className="h-3 w-32 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-2 truncate", className)}>
      <UserAvatar user={resolvedUser} {...config} />

      <div className="truncate">
        <p className="text-sm font-medium truncate leading-tight">
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
