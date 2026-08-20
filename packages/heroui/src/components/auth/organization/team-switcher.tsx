import type {
  ListedUserTeam,
  OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useListUserTeams,
  useSetActiveTeam
} from "@better-auth-ui/react/plugins/organization"
import { Check, ChevronsExpandVertical, Persons } from "@gravity-ui/icons"
import {
  Button,
  type ButtonProps,
  cn,
  Dropdown,
  type DropdownPopoverProps,
  Label,
  Skeleton
} from "@heroui/react"
import { type ReactNode, useState } from "react"
import { organizationPlugin } from "../../../lib/auth/organization-plugin"

export type TeamSwitcherProps = {
  organizationId: string
  teamId?: string | null
  onTeamChange?: (team: ListedUserTeam | null) => void
  syncSession?: boolean
  allowClear?: boolean
  className?: string
  placement?: DropdownPopoverProps["placement"]
  trigger?: ReactNode
}

export function TeamSwitcher({
  organizationId,
  teamId,
  onTeamChange,
  syncSession = false,
  allowClear = true,
  className,
  placement,
  trigger,
  variant = "outline",
  ...props
}: TeamSwitcherProps & ButtonProps) {
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
    <Dropdown isOpen={open} onOpenChange={setOpen}>
      {trigger ? (
        <Dropdown.Trigger>{trigger}</Dropdown.Trigger>
      ) : (
        <Button
          variant={variant}
          className={cn("justify-between gap-3", className)}
          isDisabled={teams.isPending || setActiveTeam.isPending}
          {...props}
        >
          <span className="flex min-w-0 items-center gap-2">
            <Persons className="size-4 shrink-0 text-muted" />
            {teams.isPending ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <Label className="truncate">
                {selectedTeam?.name ?? localization.selectTeam}
              </Label>
            )}
          </span>
          <ChevronsExpandVertical className="size-3 shrink-0 text-muted" />
        </Button>
      )}
      <Dropdown.Popover placement={placement}>
        <Dropdown.Menu>
          {allowClear && (
            <Dropdown.Item
              textValue={localization.allTeams}
              onPress={() => selectTeam(null)}
            >
              <Label className="min-w-0 flex-1 truncate">
                {localization.allTeams}
              </Label>
              {!teamId && <Check className="size-4" />}
            </Dropdown.Item>
          )}
          {teams.data?.map((team) => (
            <Dropdown.Item
              key={team.id}
              textValue={team.name}
              onPress={() => selectTeam(team)}
            >
              <Label className="min-w-0 flex-1 truncate">{team.name}</Label>
              {team.id === teamId && <Check className="size-4" />}
            </Dropdown.Item>
          ))}
          {!teams.isPending && teams.data?.length === 0 && (
            <Dropdown.Item isDisabled textValue={localization.noTeams}>
              <Label className="text-muted">{localization.noTeams}</Label>
            </Dropdown.Item>
          )}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  )
}
