import {
  type AdditionalFields,
  fieldsWithModelValues,
  parseAdditionalFieldValues
} from "@better-auth-ui/core"
import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useActiveOrganization,
  useAddTeamMember,
  useCreateTeam,
  useHasPermission,
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
import { AdditionalField } from "../additional-field"

export function OrganizationTeams() {
  const { authClient, localization } = useAuth()
  const { data: activeOrganization } = useActiveOrganization(
    authClient as OrganizationAuthClient
  )
  const {
    localization: labels,
    modelFields,
    teamPolicy
  } = useAuthPlugin(organizationPlugin)
  const client = authClient as OrganizationAuthClient
  const teams = useListTeams(client, {
    query: { organizationId: activeOrganization?.id }
  })
  const members = useListOrganizationMembers(client)
  const createTeam = useCreateTeam(client, {
    onSuccess: () => toast.success(labels.teamCreated)
  })
  const canCreate = useHasPermission(client, {
    organizationId: activeOrganization?.id,
    permissions: { team: ["create"] }
  })
  const [isCreatingFields, setIsCreatingFields] = useState(false)
  const teamLimitReached =
    teamPolicy.maximumTeams !== undefined &&
    (teams.data?.length ?? 0) >= teamPolicy.maximumTeams
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = String(
      new FormData(event.currentTarget).get("name") ?? ""
    ).trim()
    if (
      !name ||
      !activeOrganization ||
      !canCreate.data?.success ||
      teamLimitReached
    )
      return

    setIsCreatingFields(true)
    try {
      const values = await parseAdditionalFieldValues(
        modelFields.team,
        new FormData(event.currentTarget)
      )
      const form = event.currentTarget
      createTeam.mutate(
        { ...values, name, organizationId: activeOrganization.id },
        {
          onSuccess: () => form.reset(),
          onSettled: () => setIsCreatingFields(false)
        }
      )
    } catch (error) {
      toast.danger(error instanceof Error ? error.message : String(error))
      setIsCreatingFields(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-sm font-semibold">{labels.teams}</h2>
        {(canCreate.isPending || canCreate.data?.success) && (
          <Form
            className="grid w-full gap-3 sm:max-w-xl sm:grid-cols-2"
            onSubmit={submit}
          >
            <TextField
              name="name"
              isDisabled={
                canCreate.isPending || createTeam.isPending || teamLimitReached
              }
            >
              <Label>{labels.name}</Label>
              <Input variant="secondary" required />
            </TextField>
            {modelFields.team.map((field) => (
              <AdditionalField
                key={field.name}
                field={field}
                name={field.name}
                isPending={
                  canCreate.isPending ||
                  createTeam.isPending ||
                  isCreatingFields
                }
                optionalLabel={localization.settings.optional}
              />
            ))}
            <Button
              className="self-end"
              type="submit"
              isPending={createTeam.isPending || isCreatingFields}
              isDisabled={canCreate.isPending || teamLimitReached}
            >
              {(createTeam.isPending || isCreatingFields) && (
                <Spinner color="current" size="sm" />
              )}
              {labels.createTeam}
            </Button>
            {teamLimitReached && (
              <p className="text-danger text-sm sm:col-span-2" role="alert">
                {labels.teamLimitReached}
              </p>
            )}
          </Form>
        )}
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
            teamFields={modelFields.team}
            teamCount={teams.data?.length ?? 0}
            maximumMembersPerTeam={teamPolicy.maximumMembersPerTeam}
            allowRemovingAllTeams={teamPolicy.allowRemovingAllTeams}
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
  organizationMembers,
  teamFields,
  teamCount,
  maximumMembersPerTeam,
  allowRemovingAllTeams
}: {
  team: { id: string; name: string; [key: string]: unknown }
  organizationId: string
  organizationMembers: Array<{
    userId: string
    user: { name: string; email: string }
  }>
  teamFields: AdditionalFields
  teamCount: number
  maximumMembersPerTeam?: number
  allowRemovingAllTeams: boolean
}) {
  const { authClient, localization } = useAuth()
  const { localization: labels } = useAuthPlugin(organizationPlugin)
  const client = authClient as OrganizationAuthClient
  const teamMembers = useListTeamMembers(client, { query: { teamId: team.id } })
  const canUpdate = useHasPermission(client, {
    organizationId,
    permissions: { team: ["update"] }
  })
  const canDelete = useHasPermission(client, {
    organizationId,
    permissions: { team: ["delete"] }
  })
  const canAddMember = useHasPermission(client, {
    organizationId,
    permissions: { member: ["update"] }
  })
  const canRemoveMember = useHasPermission(client, {
    organizationId,
    permissions: { member: ["delete"] }
  })
  const [name, setName] = useState(team.name)
  const [isUpdatingFields, setIsUpdatingFields] = useState(false)
  const [userId, setUserId] = useState<string>()
  const updateTeam = useUpdateTeam(client)
  const removeTeam = useRemoveTeam(client)
  const addMember = useAddTeamMember(client, {
    onSuccess: () => setUserId(undefined)
  })
  const removeMember = useRemoveTeamMember(client)
  const memberIds = new Set(teamMembers.data?.map((member) => member.userId))
  const memberLimitReached =
    maximumMembersPerTeam !== undefined &&
    (teamMembers.data?.length ?? 0) >= maximumMembersPerTeam
  const canRemoveTeam = allowRemovingAllTeams || teamCount > 1
  const submitUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canUpdate.data?.success) return
    setIsUpdatingFields(true)
    try {
      const values = await parseAdditionalFieldValues(
        teamFields,
        new FormData(event.currentTarget)
      )
      updateTeam.mutate(
        {
          teamId: team.id,
          data: { ...values, name, organizationId }
        },
        { onSettled: () => setIsUpdatingFields(false) }
      )
    } catch (error) {
      toast.danger(error instanceof Error ? error.message : String(error))
      setIsUpdatingFields(false)
    }
  }

  return (
    <Card>
      <Card.Content className="gap-4">
        <Form
          className="grid items-end gap-3 sm:grid-cols-2"
          onSubmit={submitUpdate}
        >
          <TextField
            className="flex-1"
            isDisabled={canUpdate.isPending || !canUpdate.data?.success}
          >
            <Label>{labels.name}</Label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              variant="secondary"
            />
          </TextField>
          {fieldsWithModelValues(teamFields, team).map((field) => (
            <AdditionalField
              key={field.name}
              field={field}
              name={field.name}
              isPending={
                canUpdate.isPending ||
                !canUpdate.data?.success ||
                updateTeam.isPending ||
                isUpdatingFields
              }
              optionalLabel={localization.settings.optional}
            />
          ))}
          {(canUpdate.isPending || canUpdate.data?.success) && (
            <Button
              type="submit"
              variant="outline"
              isDisabled={
                canUpdate.isPending || updateTeam.isPending || isUpdatingFields
              }
            >
              {localization.settings.saveChanges}
            </Button>
          )}
          {(canDelete.isPending || canDelete.data?.success) && (
            <Button
              type="button"
              variant="danger-soft"
              isDisabled={
                canDelete.isPending || removeTeam.isPending || !canRemoveTeam
              }
              aria-label={
                canRemoveTeam
                  ? labels.deleteTeam
                  : labels.lastTeamRemovalDisabled
              }
              onPress={() => {
                if (!canDelete.data?.success) return
                removeTeam.mutate({ teamId: team.id, organizationId })
              }}
            >
              {labels.deleteTeam}
            </Button>
          )}
        </Form>
        {!canRemoveTeam && canDelete.data?.success && (
          <p className="text-sm text-muted">{labels.lastTeamRemovalDisabled}</p>
        )}
        {(canAddMember.isPending || canAddMember.data?.success) && (
          <div className="flex items-end gap-2">
            <Select
              className="flex-1"
              value={userId}
              onChange={(value) => setUserId(String(value))}
              isDisabled={canAddMember.isPending || memberLimitReached}
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
              isDisabled={
                canAddMember.isPending ||
                !userId ||
                addMember.isPending ||
                memberLimitReached
              }
              onPress={() => {
                if (!canAddMember.data?.success || !userId) return
                addMember.mutate({ teamId: team.id, userId, organizationId })
              }}
            >
              {labels.addTeamMember}
            </Button>
          </div>
        )}
        {canAddMember.data?.success && memberLimitReached && (
          <p className="text-danger text-sm" role="alert">
            {labels.teamMemberLimitReached}
          </p>
        )}
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
                {(canRemoveMember.isPending ||
                  canRemoveMember.data?.success) && (
                  <Button
                    isDisabled={canRemoveMember.isPending}
                    size="sm"
                    variant="outline"
                    onPress={() => {
                      if (!canRemoveMember.data?.success) return
                      removeMember.mutate({
                        teamId: team.id,
                        userId: teamMember.userId,
                        organizationId
                      })
                    }}
                  >
                    {labels.removeTeamMember}
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </Card.Content>
    </Card>
  )
}
