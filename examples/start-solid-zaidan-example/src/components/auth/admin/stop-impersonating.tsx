import {
  type AdminLocalization,
  adminLocalization,
  adminPlugin,
  isImpersonatingSession
} from "@better-auth-ui/core/plugins"
import {
  type AdminAuthClient,
  stopImpersonatingOptions,
  useAuth,
  useSession
} from "@better-auth-ui/solid"
import { createMutation } from "@tanstack/solid-query"
import { UserRoundCheck } from "lucide-solid"
import { Show } from "solid-js"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export type StopImpersonatingProps = {
  class?: string
}

type AdminPluginConfig = {
  id: string
  localization?: Partial<AdminLocalization>
}

/**
 * Restore the administrator's session when the current session is
 * impersonating another user.
 */
export function StopImpersonating(props: StopImpersonatingProps = {}) {
  const auth = useAuth()
  const authClient = auth.authClient as AdminAuthClient
  const session = useSession(auth.authClient)
  const stopImpersonating = createMutation(() =>
    stopImpersonatingOptions(authClient)
  )
  const localization = () => {
    const plugin = (auth.plugins as AdminPluginConfig[]).find(
      (candidate) => candidate.id === adminPlugin.id
    )

    return {
      ...adminLocalization,
      ...plugin?.localization
    }
  }

  return (
    <Show when={isImpersonatingSession(session.data)}>
      <DropdownMenuItem
        class={cn(
          "z-dropdown-menu-item-auth hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-expanded:bg-accent data-expanded:text-accent-foreground",
          props.class
        )}
        disabled={stopImpersonating.isPending}
        onSelect={() => stopImpersonating.mutate(undefined)}
      >
        <Show
          fallback={<UserRoundCheck class="size-4 text-muted-foreground" />}
          when={stopImpersonating.isPending}
        >
          <Spinner />
        </Show>

        {localization().stopImpersonating}
      </DropdownMenuItem>
    </Show>
  )
}
