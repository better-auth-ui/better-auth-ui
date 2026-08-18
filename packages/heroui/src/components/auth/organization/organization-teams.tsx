import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useActiveOrganization,
  useAddTeamMember,
  useCreateTeam,
  useListOrganizationMembers,
  useListTeamMembers,
  useListTeams,
  useRemoveTeam,
  useRemoveTeamMember,
  useUpdateTeam
} from "@better-auth-ui/react/plugins/organization"
import {
  Button,
  Card,
  Form,
  Input,
  Label,
  ListBox,
  Select,
  Spinner,
  TextField,
  toast
} from "@heroui/react"
import { type FormEvent, useState } from "react"
import { organizationPlugin } from "../../../lib/auth/organization-plugin"

export function OrganizationTeams() {
  const { authClient } = useAuth()
  const { data: activeOrganization } = useActiveOrganization(
    authClient as OrganizationAuthClient
  )
  const { localization: labels } = useAuthPlugin(organizationPlugin)
  const client = authClient as OrganizationAuthClient
  const teams = useListTeams(client, {
    query: { organizationId: activeOrganization?.id }
  })
  const members = useListOrganizationMembers(client)
  const createTeam = useCreateTeam(client, {
    onSuccess: () => toast.success(labels.teamCreated)
  })
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = String(
      new FormData(event.currentTarget).get("name") ?? ""
    ).trim()
    if (name && activeOrganization) {
      createTeam.mutate({ name, organizationId: activeOrganization.id })
    }
    event.currentTarget.reset()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-sm font-semibold">{labels.teams}</h2>
        <Form className="flex items-end gap-2" onSubmit={submit}>
          <TextField name="name" isDisabled={createTeam.isPending}>
            <Label>{labels.name}</Label>
            <Input variant="secondary" required />
          </TextField>
          <Button type="submit" isPending={createTeam.isPending}>
            {createTeam.isPending && <Spinner color="current" size="sm" />}
            {labels.createTeam}
          </Button>
        </Form>
      </div>
      {teams.isPending ? (
        <Spinner />
      ) : teams.data?.length ? (
        teams.data.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            organizationId={activeOrganization?.id ?? ""}
            organizationMembers={members.data?.members ?? []}
          />
        ))
      ) : (
        <Card>
          <Card.Content>
            <p className="text-sm font-medium">{labels.noTeams}</p>
            <p className="text-sm text-muted">{labels.noTeamsDescription}</p>
          </Card.Content>
        </Card>
      )}
    </div>
  )
}

function TeamCard({
  team,
  organizationId,
  organizationMembers
}: {
  team: { id: string; name: string }
  organizationId: string
  organizationMembers: Array<{
    userId: string
    user: { name: string; email: string }
  }>
}) {
  const { authClient, localization } = useAuth()
  const { localization: labels } = useAuthPlugin(organizationPlugin)
  const client = authClient as OrganizationAuthClient
  const teamMembers = useListTeamMembers(client, { query: { teamId: team.id } })
  const [name, setName] = useState(team.name)
  const [userId, setUserId] = useState<string>()
  const updateTeam = useUpdateTeam(client)
  const removeTeam = useRemoveTeam(client)
  const addMember = useAddTeamMember(client, {
    onSuccess: () => setUserId(undefined)
  })
  const removeMember = useRemoveTeamMember(client)
  const memberIds = new Set(teamMembers.data?.map((member) => member.userId))

  return (
    <Card>
      <Card.Content className="gap-4">
        <div className="flex items-end gap-2">
          <TextField className="flex-1">
            <Label>{labels.name}</Label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              variant="secondary"
            />
          </TextField>
          <Button
            variant="outline"
            onPress={() =>
              updateTeam.mutate({
                teamId: team.id,
                data: { name, organizationId }
              })
            }
          >
            {localization.settings.saveChanges}
          </Button>
          <Button
            variant="danger-soft"
            onPress={() =>
              removeTeam.mutate({ teamId: team.id, organizationId })
            }
          >
            {labels.deleteTeam}
          </Button>
        </div>
        <div className="flex items-end gap-2">
          <Select
            className="flex-1"
            value={userId}
            onChange={(value) => setUserId(String(value))}
          >
            <Label>{labels.addTeamMember}</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {organizationMembers
                  .filter((member) => !memberIds.has(member.userId))
                  .map((member) => (
                    <ListBox.Item
                      id={member.userId}
                      key={member.userId}
                      textValue={member.user.name || member.user.email}
                    >
                      {member.user.name || member.user.email}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
              </ListBox>
            </Select.Popover>
          </Select>
          <Button
            isDisabled={!userId || addMember.isPending}
            onPress={() =>
              userId &&
              addMember.mutate({ teamId: team.id, userId, organizationId })
            }
          >
            {labels.addTeamMember}
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {teamMembers.data?.map((teamMember) => {
            const member = organizationMembers.find(
              (candidate) => candidate.userId === teamMember.userId
            )
            return (
              <div
                className="flex items-center justify-between gap-3"
                key={teamMember.id}
              >
                <span className="text-sm">
                  {member?.user.name || member?.user.email || teamMember.userId}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() =>
                    removeMember.mutate({
                      teamId: team.id,
                      userId: teamMember.userId,
                      organizationId
                    })
                  }
                >
                  {labels.removeTeamMember}
                </Button>
              </div>
            )
          })}
        </div>
      </Card.Content>
    </Card>
  )
}
