import { User } from "lucide-solid"
import type { JSX } from "solid-js"
import { Show } from "solid-js"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function UserAvatar(props: {
  class?: string
  fallback?: JSX.Element
  image?: string | null
  initials?: string
  label: string
}) {
  return (
    <Avatar
      class={
        props.class ?? "size-9 rounded-full bg-muted text-muted-foreground"
      }
    >
      <AvatarImage alt={props.label} src={props.image ?? undefined} />
      <AvatarFallback class="rounded-full bg-muted text-muted-foreground">
        <Show
          fallback={props.fallback ?? <User class="size-4" />}
          when={props.initials}
        >
          {(initials) => initials()}
        </Show>
      </AvatarFallback>
    </Avatar>
  )
}
