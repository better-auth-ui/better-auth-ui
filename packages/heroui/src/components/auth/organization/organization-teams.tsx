import {
  type AdditionalFields,
  fieldsWithModelValues,
  parseAdditionalFieldValues
} from "@better-auth-ui/core"
import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import {
  useActiveOrganization,
  useAddTeamMember,
  useCreateTeam,
  useHasPermission,
  useListOrganizationMembers,
  useListTeamMembers,
  useListTeams,
  useListUserTeams,
  useRemoveTeam,
  useRemoveTeamMember,
  useUpdateTeam
} from "@better-auth-ui/react/plugins/organization"
import { CirclePlus, Pencil, TrashBin } from "@gravity-ui/icons"
import {
  AlertDialog,
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
import { type FormEvent, useEffect, useState } from "react"
import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { AdditionalField } from "../additional-field"

type Team = { id: string; name: string; [key: string]: unknown }

export function OrganizationTeams() {
  const { authClient } = useAuth()
  const client = authClient as OrganizationAuthClient
  const { data: activeOrganization } = useActiveOrganization(client)
  const { data: session } = useSession(client)
  const {
    localization: labels,
    modelFields,
    teamPolicy
  } = useAuthPlugin(organizationPlugin)
  const teams = useListTeams(client, {
    query: { organizationId: activeOrganization?.id }
  })
  const members = useListOrganizationMembers(client)
  const userTeams = useListUserTeams(client, {
    query: { organizationId: activeOrganization?.id ?? "" }
  })
  const userTeamIds = new Set(userTeams.data?.map((team) => team.id))
  const activeTeamId = (
    session?.session as { activeTeamId?: string | null } | undefined
  )?.activeTeamId
  const canCreate = useHasPermission(client, {
    organizationId: activeOrganization?.id,
    permissions: { team: ["create"] }
  })
  const teamLimitReached =
    teamPolicy.maximumTeams !== undefined &&
    (teams.data?.length ?? 0) >= teamPolicy.maximumTeams
  const [dialogTeam, setDialogTeam] = useState<Team | null>()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-sm font-semibold">{labels.teams}</h2>
          <p className="text-muted text-sm">{labels.teamsDescription}</p>
        </div>
        {(canCreate.isPending || canCreate.data?.success) && (
          <Button
            isDisabled={canCreate.isPending || teamLimitReached}
            onPress={() => setDialogTeam(null)}
          >
            <CirclePlus />
            {labels.createTeam}
          </Button>
        )}
      </div>

      {teamLimitReached && canCreate.data?.success && (
        <p className="text-danger text-sm" role="alert">
          {labels.teamLimitReached}
        </p>
      )}

      {teams.isPending ? (
        <Spinner />
      ) : teams.data?.length ? (
        <Card>
          <Card.Content className="gap-0 p-0">
            {teams.data.map((team) => (
              <div
                className="flex items-center justify-between gap-4 border-b px-4 py-3 last:border-b-0"
                key={team.id}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{team.name}</p>
                  <p className="text-muted text-sm">{labels.team}</p>
                </div>
                <Button
                  onPress={() => setDialogTeam(team)}
                  size="sm"
                  variant="outline"
                >
                  <Pencil />
                  {labels.manage}
                </Button>
              </div>
            ))}
          </Card.Content>
        </Card>
      ) : (
        <Card>
          <Card.Content className="gap-1">
            <p className="text-sm font-medium">{labels.noTeams}</p>
            <p className="text-muted text-sm">{labels.noTeamsDescription}</p>
          </Card.Content>
        </Card>
      )}

      <TeamDialog
        activeTeamId={activeTeamId}
        allowRemovingAllTeams={teamPolicy.allowRemovingAllTeams}
        canListMembers={dialogTeam ? userTeamIds.has(dialogTeam.id) : false}
        isOpen={dialogTeam !== undefined}
        maximumMembersPerTeam={teamPolicy.maximumMembersPerTeam}
        onOpenChange={(open) => !open && setDialogTeam(undefined)}
        organizationId={activeOrganization?.id ?? ""}
        organizationMembers={members.data?.members ?? []}
        team={dialogTeam ?? undefined}
        teamCount={teams.data?.length ?? 0}
        teamFields={modelFields.team}
        teamLimitReached={teamLimitReached}
      />
    </div>
  )
}

function TeamDialog({
  activeTeamId,
  allowRemovingAllTeams,
  canListMembers,
  isOpen,
  maximumMembersPerTeam,
  onOpenChange,
  organizationId,
  organizationMembers,
  team,
  teamCount,
  teamFields,
  teamLimitReached
}: {
  activeTeamId?: string | null
  allowRemovingAllTeams: boolean
  canListMembers: boolean
  isOpen: boolean
  maximumMembersPerTeam?: number
  onOpenChange: (open: boolean) => void
  organizationId: string
  organizationMembers: Array<{
    userId: string
    user: { name: string; email: string }
  }>
  team?: Team
  teamCount: number
  teamFields: AdditionalFields
  teamLimitReached: boolean
}) {
  const { authClient, localization } = useAuth()
  const client = authClient as OrganizationAuthClient
  const { localization: labels } = useAuthPlugin(organizationPlugin)
  const teamMembers = useListTeamMembers(client, {
    query: { teamId: team?.id ?? "" },
    enabled: isOpen && !!team && canListMembers
  })
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
  const [name, setName] = useState("")
  const [isSubmittingFields, setIsSubmittingFields] = useState(false)
  const [userId, setUserId] = useState<string>()
  const createTeam = useCreateTeam(client, {
    onSuccess: () => {
      toast.success(labels.teamCreated)
      onOpenChange(false)
    }
  })
  const updateTeam = useUpdateTeam(client, {
    onSuccess: () => {
      toast.success(labels.teamUpdated)
      onOpenChange(false)
    }
  })
  const removeTeam = useRemoveTeam(client, {
    onSuccess: () => {
      toast.success(labels.teamDeleted)
      onOpenChange(false)
    }
  })
  const addMember = useAddTeamMember(client, {
    onSuccess: () => setUserId(undefined)
  })
  const removeMember = useRemoveTeamMember(client)
  const memberIds = new Set(teamMembers.data?.map((member) => member.userId))
  const memberLimitReached =
    maximumMembersPerTeam !== undefined &&
    (teamMembers.data?.length ?? 0) >= maximumMembersPerTeam
  const isActiveTeam = activeTeamId === team?.id
  const canRemoveFinalTeam = allowRemovingAllTeams || teamCount > 1
  const canRemoveTeam = canRemoveFinalTeam && !isActiveTeam
  const teamRemovalDisabledReason = isActiveTeam
    ? labels.activeTeamRemovalDisabled
    : labels.lastTeamRemovalDisabled

  useEffect(() => {
    if (!isOpen) return
    setName(team?.name ?? "")
    setUserId(undefined)
  }, [isOpen, team])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName || !organizationId || (!team && teamLimitReached)) return
    if (team && !canUpdate.data?.success) return

    setIsSubmittingFields(true)
    try {
      const values = await parseAdditionalFieldValues(
        teamFields,
        new FormData(event.currentTarget)
      )
      if (team) {
        updateTeam.mutate(
          {
            teamId: team.id,
            data: { ...values, name: trimmedName, organizationId }
          },
          { onSettled: () => setIsSubmittingFields(false) }
        )
      } else {
        createTeam.mutate(
          { ...values, name: trimmedName, organizationId },
          { onSettled: () => setIsSubmittingFields(false) }
        )
      }
    } catch (error) {
      toast.danger(error instanceof Error ? error.message : String(error))
      setIsSubmittingFields(false)
    }
  }

  const pending =
    createTeam.isPending || updateTeam.isPending || isSubmittingFields
  const canEdit = !team || canUpdate.data?.success === true

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog className="max-w-xl">
          <Form onSubmit={submit}>
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status="default">
                {team ? <Pencil /> : <CirclePlus />}
              </AlertDialog.Icon>
              <AlertDialog.Heading>
                {team ? labels.renameTeam : labels.createTeam}
              </AlertDialog.Heading>
            </AlertDialog.Header>

            <AlertDialog.Body className="flex max-h-[65vh] flex-col gap-5 overflow-y-auto">
              <p className="text-muted text-sm">{labels.teamsDescription}</p>

              <TextField isDisabled={pending || !canEdit} isRequired>
                <Label>{labels.name}</Label>
                <Input
                  autoFocus
                  onChange={(event) => setName(event.target.value)}
                  value={name}
                  variant="secondary"
                />
              </TextField>

              {fieldsWithModelValues(teamFields, team ?? {}).map((field) => (
                <AdditionalField
                  field={field}
                  isPending={pending || !canEdit}
                  key={field.name}
                  name={field.name}
                  optionalLabel={localization.settings.optional}
                />
              ))}

              {team && canListMembers && (
                <div className="flex flex-col gap-4 border-t pt-5">
                  <div>
                    <h3 className="text-sm font-medium">
                      {labels.teamMembers}
                    </h3>
                    <p className="text-muted text-sm">{labels.addTeamMember}</p>
                  </div>

                  {(canAddMember.isPending || canAddMember.data?.success) && (
                    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-end">
                      <Select
                        className="flex-1"
                        isDisabled={
                          canAddMember.isPending || memberLimitReached
                        }
                        onChange={(value) => setUserId(String(value))}
                        value={userId}
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
                                  textValue={
                                    member.user.name || member.user.email
                                  }
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
                          addMember.mutate({
                            teamId: team.id,
                            userId,
                            organizationId
                          })
                        }}
                        type="button"
                      >
                        <CirclePlus />
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
                    {teamMembers.isPending && <Spinner />}
                    {teamMembers.data?.map((teamMember) => {
                      const member = organizationMembers.find(
                        (candidate) => candidate.userId === teamMember.userId
                      )
                      return (
                        <div
                          className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                          key={teamMember.id}
                        >
                          <span className="truncate text-sm">
                            {member?.user.name ||
                              member?.user.email ||
                              teamMember.userId}
                          </span>
                          {(canRemoveMember.isPending ||
                            canRemoveMember.data?.success) && (
                            <Button
                              aria-label={labels.removeTeamMember}
                              isDisabled={
                                canRemoveMember.isPending ||
                                removeMember.isPending
                              }
                              isIconOnly
                              onPress={() => {
                                if (!canRemoveMember.data?.success) return
                                removeMember.mutate({
                                  teamId: team.id,
                                  userId: teamMember.userId,
                                  organizationId
                                })
                              }}
                              size="sm"
                              type="button"
                              variant="tertiary"
                            >
                              <TrashBin />
                            </Button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {team && !canRemoveTeam && canDelete.data?.success && (
                <p className="text-muted text-sm">
                  {teamRemovalDisabledReason}
                </p>
              )}
            </AlertDialog.Body>

            <AlertDialog.Footer>
              {team && (canDelete.isPending || canDelete.data?.success) && (
                <Button
                  isDisabled={
                    canDelete.isPending ||
                    removeTeam.isPending ||
                    !canRemoveTeam
                  }
                  onPress={() =>
                    removeTeam.mutate({ teamId: team.id, organizationId })
                  }
                  type="button"
                  variant="danger-soft"
                >
                  <TrashBin />
                  {labels.deleteTeam}
                </Button>
              )}
              <Button isDisabled={pending} slot="close" variant="tertiary">
                {localization.settings.cancel}
              </Button>
              {canEdit && (
                <Button
                  isDisabled={
                    pending || !name.trim() || (teamLimitReached && !team)
                  }
                  isPending={pending}
                  type="submit"
                >
                  {pending && <Spinner color="current" size="sm" />}
                  {team ? localization.settings.saveChanges : labels.createTeam}
                </Button>
              )}
            </AlertDialog.Footer>
          </Form>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  )
}
