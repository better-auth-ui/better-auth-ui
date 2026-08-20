import type {
  ListedUserTeam,
  OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { useAuth } from "@better-auth-ui/solid"
import {
  useListUserTeams,
  useSetActiveTeam
} from "@better-auth-ui/solid/plugins/organization"
import { Check, ChevronsUpDown, Users } from "lucide-solid"
import type { ValidComponent } from "solid-js"
import { createMemo, createSignal, For, Show } from "solid-js"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { cn } from "@/lib/utils"

export type TeamSwitcherProps = {
  organizationId: string
  teamId?: string | null
  onTeamChange?: (team: ListedUserTeam | null) => void
  syncSession?: boolean
  allowClear?: boolean
  class?: string
  trigger?: ValidComponent
}

export function TeamSwitcher(props: TeamSwitcherProps) {
  const auth = useAuth<OrganizationAuthClient>()
  const localization = () => organizationPlugin().localization
  const [open, setOpen] = createSignal(false)
  const teams = useListUserTeams(auth.authClient, () => ({
    query: { organizationId: props.organizationId }
  }))
  const setActiveTeam = useSetActiveTeam(auth.authClient)
  const selectedTeam = createMemo(() =>
    teams.data?.find((team) => team.id === props.teamId)
  )

  function selectTeam(team: ListedUserTeam | null) {
    props.onTeamChange?.(team)
    setOpen(false)

    if (props.syncSession) {
      setActiveTeam.mutate({
        organizationId: props.organizationId,
        teamId: team?.id ?? null
      })
    }
  }

  return (
    <DropdownMenu open={open()} onOpenChange={setOpen}>
      <Show
        when={props.trigger}
        fallback={
          <DropdownMenuTrigger
            as={Button}
            variant="outline"
            class={cn("justify-between gap-3", props.class)}
            disabled={teams.isPending || setActiveTeam.isPending}
          >
            <span class="flex min-w-0 items-center gap-2">
              <Users class="size-4 shrink-0 text-muted-foreground" />
              <Show
                when={!teams.isPending}
                fallback={<Skeleton class="h-4 w-24" />}
              >
                <span class="truncate">
                  {selectedTeam()?.name ?? localization().selectTeam}
                </span>
              </Show>
            </span>
            <ChevronsUpDown class="size-4 shrink-0 text-muted-foreground" />
          </DropdownMenuTrigger>
        }
      >
        {(Trigger) => (
          <DropdownMenuTrigger as={Trigger()} class={props.class} />
        )}
      </Show>
      <DropdownMenuContent class="min-w-56">
        <Show when={props.allowClear !== false}>
          <DropdownMenuItem onClick={() => selectTeam(null)}>
            <span class="min-w-0 flex-1 truncate">
              {localization().allTeams}
            </span>
            <Show when={!props.teamId}>
              <Check class="size-4" />
            </Show>
          </DropdownMenuItem>
        </Show>
        <For each={teams.data ?? []}>
          {(team) => (
            <DropdownMenuItem onClick={() => selectTeam(team)}>
              <span class="min-w-0 flex-1 truncate">{team.name}</span>
              <Show when={team.id === props.teamId}>
                <Check class="size-4" />
              </Show>
            </DropdownMenuItem>
          )}
        </For>
        <Show when={!teams.isPending && teams.data?.length === 0}>
          <div class="px-2 py-1.5 text-sm text-muted-foreground">
            {localization().noTeams}
          </div>
        </Show>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
