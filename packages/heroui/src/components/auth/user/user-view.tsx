import type { UsernameAuthClient } from "@better-auth-ui/core/plugins/username"
import { useAuth, useSession } from "@better-auth-ui/react"
import { type AvatarProps, cn, Skeleton } from "@heroui/react"
import type { User } from "better-auth"
import type { ComponentProps } from "react"
import { UserAvatar } from "./user-avatar"

export type UserViewProps = {
  className?: string
  isPending?: boolean
  size?: AvatarProps["size"]
  /**
   * When true, the subtitle line (email when name/username is shown) is hidden.
   * @default false
   */
  hideSubtitle?: boolean
  /** @remarks `User` */
  user?: Partial<User> & {
    username?: string | null
    displayUsername?: string | null
  }
}

/**
 * Render a compact user item with an avatar, a primary label (display username, name, or email), and an optional subtitle (email).
 *
 * @param isPending - If true and no `user` prop is provided, renders a loading skeleton instead of user details
 * @param size - Avatar size variant; defaults to `"md"`
 * @param hideSubtitle - When true, omits the muted subtitle row under the primary label
 * @param user - Optional user to display; when omitted the current session user is used if available
 * @returns A React element containing the user's avatar and text labels
 */
export function UserView({
  className,
  isPending,
  size = "md",
  hideSubtitle = false,
  user,
  ...props
}: UserViewProps & ComponentProps<"div">) {
  const { authClient } = useAuth()
  const { data: session, isPending: sessionPending } = useSession(
    authClient as UsernameAuthClient,
    {
      enabled: !user && !isPending
    }
  )

  const resolvedUser = user ?? session?.user

  if ((isPending || sessionPending) && !user) {
    return (
      <div
        className={cn("flex items-center gap-2 min-w-0", className)}
        {...props}
      >
        <UserAvatar
          isPending
          className={size === "sm" ? "size-5 [&>span]:text-xs" : undefined}
          size={size === "lg" ? "md" : "sm"}
        />

        <div className="flex flex-col gap-1 min-w-0">
          <Skeleton className="h-3.5 w-24 rounded-lg" />

          {!hideSubtitle ? <Skeleton className="h-3 w-32 rounded-lg" /> : null}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn("flex items-center gap-2 min-w-0", className)}
      {...props}
    >
      <UserAvatar
        className={size === "sm" ? "size-5 [&>span]:text-xs" : undefined}
        user={resolvedUser}
        size={size === "lg" ? "md" : "sm"}
      />

      <div className="flex flex-col min-w-0">
        <p className="text-foreground text-sm font-medium leading-tight truncate">
          {resolvedUser?.displayUsername ||
            resolvedUser?.name ||
            resolvedUser?.email}
        </p>

        {!hideSubtitle &&
        (resolvedUser?.displayUsername || resolvedUser?.name) ? (
          <p className="text-muted text-xs leading-tight truncate overflow-x-hidden">
            {resolvedUser?.email}
          </p>
        ) : null}
      </div>
    </div>
  )
}
