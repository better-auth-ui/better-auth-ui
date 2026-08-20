import {
  type AdditionalFields,
  fieldsWithModelValues,
  parseAdditionalFieldValues
} from "@better-auth-ui/core"
import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
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
} from "@better-auth-ui/solid/plugins/organization"
import { createSignal, For, Show } from "solid-js"
import { toast } from "solid-sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { AdditionalField } from "../additional-field"

type MemberOption = { id: string; label: string }

export function OrganizationTeams() {
  const auth = useAuth<OrganizationAuthClient>()
  const activeOrganization = useActiveOrganization(auth.authClient)
  const config = useAuthPlugin(organizationPlugin)
  const teams = useListTeams(auth.authClient, () => ({
    query: { organizationId: activeOrganization.data?.id }
  }))
  const members = useListOrganizationMembers(auth.authClient)
  const createTeam = useCreateTeam(auth.authClient, () => ({
    onSuccess: () => toast.success(config.localization.teamCreated)
  }))
  const [isCreatingFields, setIsCreatingFields] = createSignal(false)
  const teamLimitReached = () =>
    config.teamPolicy.maximumTeams !== undefined &&
    (teams.data?.length ?? 0) >= config.teamPolicy.maximumTeams

  async function handleCreate(event: SubmitEvent) {
    event.preventDefault()
    const form = event.currentTarget as HTMLFormElement
    const name = String(new FormData(form).get("name") ?? "").trim()
    if (!name || !activeOrganization.data || teamLimitReached()) return

    setIsCreatingFields(true)
    try {
      const values = await parseAdditionalFieldValues(
        config.modelFields.team,
        new FormData(form)
      )
      createTeam.mutate(
        { ...values, name, organizationId: activeOrganization.data.id },
        {
          onSuccess: () => form.reset(),
          onSettled: () => setIsCreatingFields(false)
        }
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error))
      setIsCreatingFields(false)
    }
  }

  return (
    <div class="flex flex-col gap-4">
      <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 class="text-sm font-semibold">{config.localization.teams}</h2>
          <p class="text-sm text-muted-foreground">
            {config.localization.teamsDescription}
          </p>
        </div>
        <form
          class="grid w-full gap-3 sm:max-w-xl sm:grid-cols-2"
          onSubmit={handleCreate}
        >
          <Field>
            <FieldLabel for="new-team-name">
              {config.localization.name}
            </FieldLabel>
            <Input
              disabled={teamLimitReached()}
              id="new-team-name"
              name="name"
              required
            />
          </Field>
          <For each={config.modelFields.team}>
            {(field) => (
              <AdditionalField
                field={field}
                isPending={createTeam.isPending || isCreatingFields()}
                name={field.name}
                optionalLabel={auth.localization.settings.optional}
              />
            )}
          </For>
          <Button
            class="self-end"
            type="submit"
            disabled={
              createTeam.isPending || isCreatingFields() || teamLimitReached()
            }
          >
            {config.localization.createTeam}
          </Button>
          <Show when={teamLimitReached()}>
            <p class="text-destructive text-sm sm:col-span-2" role="alert">
              {config.localization.teamLimitReached}
            </p>
          </Show>
        </form>
      </div>
      <Show
        when={teams.data?.length}
        fallback={
          <Card>
            <CardContent class="flex flex-col gap-1">
              <p class="text-sm font-medium">{config.localization.noTeams}</p>
              <p class="text-sm text-muted-foreground">
                {config.localization.noTeamsDescription}
              </p>
            </CardContent>
          </Card>
        }
      >
        <For each={teams.data}>
          {(team) => (
            <TeamCard
              organizationId={activeOrganization.data?.id ?? ""}
              organizationMembers={members.data?.members ?? []}
              team={team}
              teamFields={config.modelFields.team}
              teamCount={teams.data?.length ?? 0}
              maximumMembersPerTeam={config.teamPolicy.maximumMembersPerTeam}
              allowRemovingAllTeams={config.teamPolicy.allowRemovingAllTeams}
            />
          )}
        </For>
      </Show>
    </div>
  )
}

function TeamCard(props: {
  organizationId: string
  organizationMembers: Array<{
    userId: string
    user: { name: string; email: string }
  }>
  team: { id: string; name: string }
  teamFields: AdditionalFields
  teamCount: number
  maximumMembersPerTeam?: number
  allowRemovingAllTeams: boolean
}) {
  const auth = useAuth<OrganizationAuthClient>()
  const config = useAuthPlugin(organizationPlugin)
  const teamMembers = useListTeamMembers(auth.authClient, () => ({
    query: { teamId: props.team.id }
  }))
  const updateTeam = useUpdateTeam(auth.authClient)
  const removeTeam = useRemoveTeam(auth.authClient)
  const [name, setName] = createSignal(props.team.name)
  const [isUpdatingFields, setIsUpdatingFields] = createSignal(false)
  const [selectedMember, setSelectedMember] = createSignal<MemberOption>()
  const addMember = useAddTeamMember(auth.authClient, () => ({
    onSuccess: () => setSelectedMember(undefined)
  }))
  const removeMember = useRemoveTeamMember(auth.authClient)
  const memberOptions = () => {
    const memberIds = new Set(teamMembers.data?.map((member) => member.userId))
    return props.organizationMembers
      .filter((member) => !memberIds.has(member.userId))
      .map((member) => ({
        id: member.userId,
        label: member.user.name || member.user.email
      }))
  }
  const memberLimitReached = () =>
    props.maximumMembersPerTeam !== undefined &&
    (teamMembers.data?.length ?? 0) >= props.maximumMembersPerTeam
  const canRemoveTeam = () => props.allowRemovingAllTeams || props.teamCount > 1

  const handleUpdate = async (event: SubmitEvent) => {
    event.preventDefault()
    setIsUpdatingFields(true)
    try {
      const values = await parseAdditionalFieldValues(
        props.teamFields,
        new FormData(event.currentTarget as HTMLFormElement)
      )
      updateTeam.mutate(
        {
          teamId: props.team.id,
          data: {
            ...values,
            name: name(),
            organizationId: props.organizationId
          }
        },
        { onSettled: () => setIsUpdatingFields(false) }
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error))
      setIsUpdatingFields(false)
    }
  }

  return (
    <Card>
      <CardContent class="flex flex-col gap-4">
        <form
          class="grid items-end gap-3 sm:grid-cols-2"
          onSubmit={handleUpdate}
        >
          <Field class="flex-1">
            <FieldLabel for={`team-name-${props.team.id}`}>
              {config.localization.name}
            </FieldLabel>
            <Input
              id={`team-name-${props.team.id}`}
              value={name()}
              onInput={(event) => setName(event.currentTarget.value)}
            />
          </Field>
          <For
            each={fieldsWithModelValues(
              props.teamFields,
              props.team as Record<string, unknown>
            )}
          >
            {(field) => (
              <AdditionalField
                field={field}
                isPending={updateTeam.isPending || isUpdatingFields()}
                name={field.name}
                optionalLabel={auth.localization.settings.optional}
              />
            )}
          </For>
          <Button
            type="submit"
            disabled={updateTeam.isPending || isUpdatingFields()}
            variant="outline"
          >
            {auth.localization.settings.saveChanges}
          </Button>
          <Button
            type="button"
            disabled={removeTeam.isPending || !canRemoveTeam()}
            title={
              canRemoveTeam()
                ? config.localization.deleteTeam
                : config.localization.lastTeamRemovalDisabled
            }
            variant="destructive"
            onClick={() => {
              if (!window.confirm(config.localization.deleteTeam)) return
              removeTeam.mutate({
                teamId: props.team.id,
                organizationId: props.organizationId
              })
            }}
          >
            {config.localization.deleteTeam}
          </Button>
        </form>
        <Show when={!canRemoveTeam()}>
          <p class="text-sm text-muted-foreground">
            {config.localization.lastTeamRemovalDisabled}
          </p>
        </Show>
        <div class="flex items-end gap-2">
          <Field class="flex-1">
            <FieldLabel>{config.localization.addTeamMember}</FieldLabel>
            <Select<MemberOption>
              disabled={memberLimitReached()}
              options={memberOptions()}
              optionTextValue="label"
              optionValue="id"
              value={selectedMember()}
              onChange={(value) => setSelectedMember(value ?? undefined)}
              itemComponent={(itemProps) => (
                <SelectItem item={itemProps.item}>
                  {itemProps.item.rawValue.label}
                </SelectItem>
              )}
            >
              <SelectTrigger class="w-full">
                <SelectValue<MemberOption>>
                  {(state) =>
                    (state.selectedOption() as MemberOption | undefined)?.label
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent />
            </Select>
          </Field>
          <Button
            disabled={
              !selectedMember() || addMember.isPending || memberLimitReached()
            }
            onClick={() => {
              const member = selectedMember()
              if (!member) return
              addMember.mutate({
                teamId: props.team.id,
                userId: member.id,
                organizationId: props.organizationId
              })
            }}
          >
            {config.localization.addTeamMember}
          </Button>
        </div>
        <Show when={memberLimitReached()}>
          <p class="text-destructive text-sm" role="alert">
            {config.localization.teamMemberLimitReached}
          </p>
        </Show>
        <For each={teamMembers.data}>
          {(teamMember) => {
            const member = () =>
              props.organizationMembers.find(
                (candidate) => candidate.userId === teamMember.userId
              )
            return (
              <div class="flex items-center justify-between gap-3">
                <span class="text-sm">
                  {member()?.user.name ||
                    member()?.user.email ||
                    teamMember.userId}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    removeMember.mutate({
                      teamId: props.team.id,
                      userId: teamMember.userId,
                      organizationId: props.organizationId
                    })
                  }
                >
                  {config.localization.removeTeamMember}
                </Button>
              </div>
            )
          }}
        </For>
      </CardContent>
    </Card>
  )
}
