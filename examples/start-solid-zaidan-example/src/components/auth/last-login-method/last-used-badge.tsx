import { useLastLoginMethod } from "@better-auth-ui/solid"
import { Show } from "solid-js"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type LastUsedBadgeProps = {
  /** Login method IDs that should display the indicator. */
  method: string | string[]
  /** Use the shorter label in constrained layouts. */
  compact?: boolean
  /** Float the compact indicator over the top-right edge of its container. */
  floating?: boolean
}

/**
 * Displays an indicator when one of the supplied method IDs matches Better
 * Auth's stored last login method.
 */
export function LastUsedBadge(props: LastUsedBadgeProps) {
  const { method: lastLoginMethod, localization } = useLastLoginMethod()
  const methods = () =>
    Array.isArray(props.method) ? props.method : [props.method]
  const isLastUsed = () => {
    const method = lastLoginMethod()

    return method !== null && methods().includes(method)
  }

  return (
    <Show when={isLastUsed()}>
      <Badge
        class={cn(
          props.floating &&
            "pointer-events-none absolute top-0 right-0 z-10 translate-x-1/4 -translate-y-1/2 shadow-sm"
        )}
        variant={props.floating ? "default" : "secondary"}
      >
        {props.compact || props.floating
          ? localization.lastUsedShort
          : localization.lastUsed}
      </Badge>
    </Show>
  )
}
