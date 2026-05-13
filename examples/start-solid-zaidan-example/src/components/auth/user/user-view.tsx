import { Show } from "solid-js"
import { UserAvatar } from "./user-avatar"

export function UserView(props: {
  image?: string | null
  initials?: string
  label: string
  secondaryLabel?: string | null
}) {
  return (
    <div class="contents">
      <UserAvatar
        image={props.image}
        initials={props.initials}
        label={props.label}
      />

      <div class="grid min-w-0 flex-1 text-sm leading-tight">
        <span class="truncate font-medium text-foreground">{props.label}</span>

        <Show when={props.secondaryLabel}>
          <span class="truncate text-xs text-muted-foreground">
            {props.secondaryLabel}
          </span>
        </Show>
      </div>
    </div>
  )
}
