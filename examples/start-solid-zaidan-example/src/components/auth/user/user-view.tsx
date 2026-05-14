import { useAuth, useSession } from "@better-auth-ui/solid"
import type { User as AuthUserBase } from "better-auth"
import { Show } from "solid-js"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { UserAvatar } from "./user-avatar"

type AuthUser = AuthUserBase & {
  displayUsername?: string | null
  username?: string | null
}

export type UserViewProps = {
  class?: string
  image?: string | null
  initials?: string
  isPending?: boolean
  label?: string
  secondaryLabel?: string | null
  user?: AuthUser
}

const resolvePrimaryLabel = (user?: AuthUser, label?: string) =>
  label ??
  user?.displayUsername ??
  user?.username ??
  user?.name ??
  user?.email ??
  "Account"

const resolveSecondaryLabel = (
  user?: AuthUser,
  secondaryLabel?: string | null
) =>
  secondaryLabel ??
  (user?.displayUsername || user?.username || user?.name
    ? user?.email
    : undefined)

export function UserView(props: UserViewProps) {
  const auth = useAuth()
  const session = useSession(auth.authClient, {
    enabled: !props.user && !props.isPending && !props.label
  })
  const sessionPending = () => session.isPending
  const resolvedUser = () =>
    props.user ?? (session.data?.user as AuthUser | undefined)
  const label = () => resolvePrimaryLabel(resolvedUser(), props.label)
  const secondaryLabel = () =>
    resolveSecondaryLabel(resolvedUser(), props.secondaryLabel)

  if ((props.isPending || sessionPending()) && !props.user && !props.label) {
    return (
      <div class={cn("flex items-center gap-2", props.class)}>
        <UserAvatar isPending />
        <div class="grid flex-1 gap-1 text-left text-sm">
          <Skeleton class="h-4 w-24" />
          <Skeleton class="h-3 w-32" />
        </div>
      </div>
    )
  }

  return (
    <div class={cn("contents", props.class)}>
      <UserAvatar
        user={resolvedUser()}
        image={props.image}
        initials={props.initials}
        label={label()}
      />

      <div class="grid min-w-0 flex-1 text-sm leading-tight">
        <span class="truncate font-medium text-foreground">{label()}</span>

        <Show when={secondaryLabel()}>
          <span class="truncate text-xs text-muted-foreground">
            {secondaryLabel()}
          </span>
        </Show>
      </div>
    </div>
  )
}
