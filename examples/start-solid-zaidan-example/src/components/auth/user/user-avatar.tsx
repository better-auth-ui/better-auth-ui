import { useAuth, useSession } from "@better-auth-ui/solid"
import type { User as AuthUserBase } from "better-auth"
import { User } from "lucide-solid"
import type { JSX } from "solid-js"
import { Show } from "solid-js"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type AuthUser = AuthUserBase & {
  displayUsername?: string | null
  username?: string | null
}

export type UserAvatarProps = {
  class?: string
  fallback?: JSX.Element
  image?: string | null
  initials?: string
  isPending?: boolean
  label?: string
  user?: AuthUser
}

const resolveAvatarLabel = (user?: AuthUser, label?: string) =>
  label ??
  user?.displayUsername ??
  user?.username ??
  user?.name ??
  user?.email ??
  "Account"

const resolveAvatarInitials = (
  user?: AuthUser,
  initials?: string,
  label?: string
) => initials ?? resolveAvatarLabel(user, label).slice(0, 2).toUpperCase()

export function UserAvatar(props: UserAvatarProps) {
  const auth = useAuth()
  const session = useSession(auth.authClient, {
    enabled: !props.user && !props.isPending
  })
  const sessionPending = () => session.isPending
  const resolvedUser = () =>
    props.user ?? (session.data?.user as AuthUser | undefined)
  const label = () => resolveAvatarLabel(resolvedUser(), props.label)
  const initials = () =>
    resolveAvatarInitials(resolvedUser(), props.initials, props.label)

  if ((props.isPending || sessionPending()) && !props.user) {
    return (
      <Skeleton
        class={cn(
          "size-9 rounded-full bg-muted text-muted-foreground",
          props.class
        )}
      />
    )
  }

  return (
    <Avatar
      class={cn(
        "size-9 rounded-full bg-muted text-muted-foreground",
        props.class
      )}
    >
      <AvatarImage
        alt={label()}
        src={props.image ?? resolvedUser()?.image ?? undefined}
      />
      <AvatarFallback class="rounded-full bg-muted text-muted-foreground">
        <Show
          fallback={props.fallback ?? <User class="size-4" />}
          when={initials()}
        >
          {(initials) => initials()}
        </Show>
      </AvatarFallback>
    </Avatar>
  )
}
