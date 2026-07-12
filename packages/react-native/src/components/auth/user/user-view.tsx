import {
  type UsernameAuthClient,
  useAuth,
  useSession
} from "@better-auth-ui/react"
import type { User } from "better-auth"
import { Text, View } from "react-native"
import { cn } from "../../../lib/cn"
import type { AvatarSize } from "../../../primitives/avatar"
import { Skeleton } from "../../../primitives/skeleton"
import { UserAvatar } from "./user-avatar"

export type UserViewProps = {
  className?: string
  isPending?: boolean
  size?: AvatarSize
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
  user
}: UserViewProps) {
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
      <View className={cn("flex-row items-center gap-2", className)}>
        <UserAvatar
          isPending
          size={size === "lg" ? "md" : "sm"}
          className={size === "sm" ? "size-5" : undefined}
        />

        <View className="gap-1">
          <Skeleton className="h-3.5 w-24 rounded-lg" />

          {!hideSubtitle ? <Skeleton className="h-3 w-32 rounded-lg" /> : null}
        </View>
      </View>
    )
  }

  return (
    <View className={cn("flex-row items-center gap-2", className)}>
      <UserAvatar
        user={resolvedUser}
        size={size === "lg" ? "md" : "sm"}
        className={size === "sm" ? "size-5" : undefined}
      />

      <View>
        <Text className="text-sm font-medium leading-tight">
          {resolvedUser?.displayUsername ||
            resolvedUser?.name ||
            resolvedUser?.email}
        </Text>

        {!hideSubtitle &&
        (resolvedUser?.displayUsername || resolvedUser?.name) ? (
          <Text className="text-xs leading-tight text-neutral-500">
            {resolvedUser?.email}
          </Text>
        ) : null}
      </View>
    </View>
  )
}
