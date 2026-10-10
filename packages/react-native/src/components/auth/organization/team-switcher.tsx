import type { OrganizationTeamsAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useListTeams } from "@better-auth-ui/react/plugins/organization"
import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { useAuthNavigation } from "../../../navigation/navigation-context"
import { Select } from "../../../primitives/menu"
export type TeamSwitcherProps = {
  organizationId: string
  organizationSlug: string
  className?: string
  onSelectionChange?: (teamId: string) => void
}
/** Team selection belongs to the route, scoped to an explicit organization. */
export function TeamSwitcher({
  organizationId,
  organizationSlug,
  onSelectionChange,
  className
}: TeamSwitcherProps) {
  const { authClient } = useAuth()
  const { localization } = useAuthPlugin(organizationPlugin)
  const navigation = useAuthNavigation()
  const teams = useListTeams(authClient as OrganizationTeamsAuthClient, {
    query: { organizationId }
  })
  const selected = navigation.getParam("teamId")
  return (
    <Select
      className={className}
      label={localization.selectTeam}
      isDisabled={teams.isPending || teams.isError}
      selectedKey={
        teams.data?.some((team) => team.id === selected) ? selected : undefined
      }
      options={(teams.data ?? []).map((team) => ({
        key: team.id,
        label: team.name
      }))}
      onSelectionChange={(teamId) => {
        if (!teams.data?.some((team) => team.id === teamId)) return
        if (onSelectionChange) onSelectionChange(teamId)
        else
          navigation.push(
            {
              section: "organization",
              view:
                navigation.current()?.section === "organization"
                  ? navigation.current()!.view
                  : "teams",
              slug: organizationSlug
            },
            { params: { teamId }, replace: true }
          )
      }}
    />
  )
}
