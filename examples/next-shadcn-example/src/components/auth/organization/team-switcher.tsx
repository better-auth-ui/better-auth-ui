"use client"

import type {
  ListedUserTeam,
  OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useListUserTeams,
  useSetActiveTeam
} from "@better-auth-ui/react/plugins/organization"
import { Check, ChevronsUpDown, Users } from "lucide-react"
import { type ReactElement, useState } from "react"
import { buttonVariants } from "@/components/ui/button"
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
  className?: string
  align?: "center" | "end" | "start"
  trigger?: ReactElement
}

export function TeamSwitcher({
  organizationId,
  teamId,
  onTeamChange,
  syncSession = false,
  allowClear = true,
  className,
  align,
  trigger
}: TeamSwitcherProps) {
  const { authClient } = useAuth<OrganizationAuthClient>()
  const { localization } = useAuthPlugin(organizationPlugin)
  const [open, setOpen] = useState(false)
  const teams = useListUserTeams(authClient, {
    query: { organizationId }
  })
  const setActiveTeam = useSetActiveTeam(authClient)
  const selectedTeam = teams.data?.find((team) => team.id === teamId)

  function selectTeam(team: ListedUserTeam | null) {
    onTeamChange?.(team)
    setOpen(false)

    if (syncSession) {
      setActiveTeam.mutate({ organizationId, teamId: team?.id ?? null })
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      ) : (
        <DropdownMenuTrigger
          className={cn(
            buttonVariants({ variant: "outline" }),
            "justify-between gap-3",
            className
          )}
          disabled={teams.isPending || setActiveTeam.isPending}
        >
          <span className="flex min-w-0 items-center gap-2">
            <Users className="size-4 shrink-0 text-muted-foreground" />
            {teams.isPending ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <span className="truncate">
                {selectedTeam?.name ?? localization.selectTeam}
              </span>
            )}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
        </DropdownMenuTrigger>
      )}
      <DropdownMenuContent align={align} className="min-w-56">
        {allowClear && (
          <DropdownMenuItem onClick={() => selectTeam(null)}>
            <span className="min-w-0 flex-1 truncate">
              {localization.allTeams}
            </span>
            {!teamId && <Check className="size-4" />}
          </DropdownMenuItem>
        )}
        {teams.data?.map((team) => (
          <DropdownMenuItem key={team.id} onClick={() => selectTeam(team)}>
            <span className="min-w-0 flex-1 truncate">{team.name}</span>
            {team.id === teamId && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}
        {!teams.isPending && teams.data?.length === 0 && (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            {localization.noTeams}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
