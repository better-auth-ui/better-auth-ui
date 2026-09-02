import {
  type AdditionalFields,
  fieldsWithModelValues,
  getAdditionalFieldDefaultValues,
  getAdditionalFieldSubmitValues,
  getFormFieldErrors,
  validateStringLength
} from "@better-auth-ui/core"
import type { OrganizationTeamsAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/solid"
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
} from "@better-auth-ui/solid/plugins/organization"
import {
  Pencil,
  Plus,
  Trash2,
  UserPlus,
  UserRoundMinus,
  Users
} from "lucide-solid"
import { createEffect, createSignal, For, Show } from "solid-js"
import { toast } from "solid-sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import {
  createAuthForm,
  getAuthAdditionalFieldValidators,
  isAuthFormFieldInvalid
} from "../auth-form"

type MemberOption = { id: string; label: string }
type Team = { id: string; name: string; [key: string]: unknown }

export function OrganizationTeams() {
  const auth = useAuth<OrganizationTeamsAuthClient>()
  const activeOrganization = useActiveOrganization(auth.authClient)
  const config = useAuthPlugin(organizationPlugin)
  const session = useSession(auth.authClient)
  const teams = useListTeams(auth.authClient, () => ({
    query: { organizationId: activeOrganization.data?.id }
  }))
  const members = useListOrganizationMembers(auth.authClient)
  const userTeams = useListUserTeams(auth.authClient, () => ({
    query: { organizationId: activeOrganization.data?.id ?? "" }
  }))
  const userTeamIds = () => new Set(userTeams.data?.map((team) => team.id))
  const activeTeamId = () =>
    (session.data?.session as { activeTeamId?: string | null } | undefined)
      ?.activeTeamId
  const canCreate = useHasPermission(auth.authClient, () => ({
    organizationId: activeOrganization.data?.id,
    permissions: { team: ["create"] }
  }))
  const teamLimitReached = () =>
    config.teamPolicy.maximumTeams !== undefined &&
    (teams.data?.length ?? 0) >= config.teamPolicy.maximumTeams
  const [dialogTeam, setDialogTeam] = createSignal<Team | null>()

  return (
    <div class="flex flex-col gap-4">
      <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 class="text-sm font-semibold">{config.localization.teams}</h2>
          <p class="text-sm text-muted-foreground">
            {config.localization.teamsDescription}
          </p>
        </div>
        <Show when={canCreate.isPending || canCreate.data?.success}>
          <Button
            disabled={canCreate.isPending || teamLimitReached()}
            onClick={() => setDialogTeam(null)}
            title={
              teamLimitReached()
                ? config.localization.teamLimitReached
                : undefined
            }
          >
            <Plus />
            {config.localization.createTeam}
          </Button>
        </Show>
      </div>

      <Show when={teamLimitReached() && canCreate.data?.success}>
        <p class="text-destructive text-sm" role="alert">
          {config.localization.teamLimitReached}
        </p>
      </Show>

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
        <Card>
          <CardContent class="p-0">
            <For each={teams.data}>
              {(team) => (
                <div class="flex items-center justify-between gap-4 border-b px-4 py-3 last:border-b-0">
                  <div class="min-w-0">
                    <p class="truncate text-sm font-medium">{team.name}</p>
                    <p class="text-sm text-muted-foreground">
                      {config.localization.team}
                    </p>
                  </div>
                  <Button
                    onClick={() => setDialogTeam(team)}
                    size="sm"
                    variant="outline"
                  >
                    <Pencil />
                    {config.localization.manage}
                  </Button>
                </div>
              )}
            </For>
          </CardContent>
        </Card>
      </Show>

      <TeamDialog
        activeTeamId={activeTeamId()}
        allowRemovingAllTeams={config.teamPolicy.allowRemovingAllTeams}
        canListMembers={
          dialogTeam() ? userTeamIds().has(dialogTeam()?.id ?? "") : false
        }
        maximumMembersPerTeam={config.teamPolicy.maximumMembersPerTeam}
        onOpenChange={(open) => !open && setDialogTeam(undefined)}
        open={dialogTeam() !== undefined}
        organizationId={activeOrganization.data?.id ?? ""}
        organizationMembers={members.data?.members ?? []}
        team={dialogTeam() ?? undefined}
        teamCount={teams.data?.length ?? 0}
        teamFields={config.modelFields.team}
        teamLimitReached={teamLimitReached()}
      />
    </div>
  )
}

function TeamDialog(props: {
  activeTeamId?: string | null
  allowRemovingAllTeams: boolean
  canListMembers: boolean
  maximumMembersPerTeam?: number
  onOpenChange: (open: boolean) => void
  open: boolean
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
  const auth = useAuth<OrganizationTeamsAuthClient>()
  const config = useAuthPlugin(organizationPlugin)
  const teamMembers = useListTeamMembers(auth.authClient, () => ({
    query: { teamId: props.team?.id ?? "" },
    enabled: props.open && !!props.team && props.canListMembers
  }))
  const canUpdate = useHasPermission(auth.authClient, () => ({
    organizationId: props.organizationId,
    permissions: { team: ["update"] }
  }))
  const canDelete = useHasPermission(auth.authClient, () => ({
    organizationId: props.organizationId,
    permissions: { team: ["delete"] }
  }))
  const canAddMember = useHasPermission(auth.authClient, () => ({
    organizationId: props.organizationId,
    permissions: { member: ["update"] }
  }))
  const canRemoveMember = useHasPermission(auth.authClient, () => ({
    organizationId: props.organizationId,
    permissions: { member: ["delete"] }
  }))
  const [selectedMember, setSelectedMember] = createSignal<MemberOption>()
  const createTeam = useCreateTeam(auth.authClient, () => ({
    onSuccess: () => {
      toast.success(config.localization.teamCreated)
      props.onOpenChange(false)
    }
  }))
  const updateTeam = useUpdateTeam(auth.authClient, () => ({
    onSuccess: () => {
      toast.success(config.localization.teamUpdated)
      props.onOpenChange(false)
    }
  }))
  const removeTeam = useRemoveTeam(auth.authClient, () => ({
    onSuccess: () => {
      toast.success(config.localization.teamDeleted)
      props.onOpenChange(false)
    }
  }))
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
  const isActiveTeam = () => props.activeTeamId === props.team?.id
  const canRemoveFinalTeam = () =>
    props.allowRemovingAllTeams || props.teamCount > 1
  const canRemoveTeam = () => canRemoveFinalTeam() && !isActiveTeam()
  const teamRemovalDisabledReason = () =>
    isActiveTeam()
      ? config.localization.activeTeamRemovalDisabled
      : config.localization.lastTeamRemovalDisabled
  const canEdit = () => !props.team || canUpdate.data?.success === true

  const configuredTeamFields = () =>
    fieldsWithModelValues(props.teamFields, props.team ?? {})
  const form = createAuthForm(() => ({
    defaultValues: {
      additionalFields: getAdditionalFieldDefaultValues(configuredTeamFields()),
      name: props.team?.name ?? ""
    },
    onSubmit: async ({ value }) => {
      const name = value.name.trim()
      if (
        !name ||
        !props.organizationId ||
        (!props.team && props.teamLimitReached)
      )
        return
      if (props.team && !canUpdate.data?.success) return

      const data = {
        ...getAdditionalFieldSubmitValues(
          configuredTeamFields(),
          value.additionalFields
        ),
        name,
        organizationId: props.organizationId
      }

      try {
        if (props.team) {
          await updateTeam.mutateAsync({ teamId: props.team.id, data })
        } else {
          await createTeam.mutateAsync(data)
        }
      } catch {
        // The mutation reports the error through its configured handler.
      }
    }
  }))

  createEffect(() => {
    if (!props.open) return
    form.reset({
      additionalFields: getAdditionalFieldDefaultValues(configuredTeamFields()),
      name: props.team?.name ?? ""
    })
    setSelectedMember(undefined)
  })

  const pending = () => createTeam.isPending || updateTeam.isPending

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent class="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <form.AppForm>
          <form.AuthFormRoot class="flex flex-col gap-6">
            <DialogHeader>
              <div class="flex size-10 items-center justify-center rounded-md bg-muted">
                <Users class="size-4.5" />
              </div>
              <DialogTitle>
                {props.team
                  ? config.localization.renameTeam
                  : config.localization.createTeam}
              </DialogTitle>
              <DialogDescription>
                {config.localization.teamsDescription}
              </DialogDescription>
            </DialogHeader>

            <div class="flex flex-col gap-4">
              <form.AppField
                name="name"
                validators={{
                  onChange: ({ value }) =>
                    validateStringLength(value, {
                      requiredMessage: auth.localization.auth.fieldRequired,
                      trim: true
                    })
                }}
              >
                {(field) => {
                  const isInvalid = () =>
                    isAuthFormFieldInvalid(field().state.meta)
                  return (
                    <Field data-invalid={isInvalid()}>
                      <FieldLabel for="organization-team-name">
                        {config.localization.name}
                      </FieldLabel>
                      <Input
                        aria-invalid={isInvalid()}
                        autofocus
                        disabled={pending() || !canEdit()}
                        id="organization-team-name"
                        name={field().name}
                        onBlur={field().handleBlur}
                        onInput={(event) =>
                          field().handleChange(event.currentTarget.value)
                        }
                        value={field().state.value}
                      />
                      <FieldError
                        errors={getFormFieldErrors(field().state.meta.errors)}
                      />
                    </Field>
                  )
                }}
              </form.AppField>

              <For each={configuredTeamFields()}>
                {(configuredField) => (
                  <form.AppField
                    name={`additionalFields.${configuredField.name}`}
                    validators={getAuthAdditionalFieldValidators(
                      configuredField,
                      auth.localization.auth.fieldRequired
                    )}
                  >
                    {(field) => (
                      <field.AuthFormAdditionalField
                        field={configuredField}
                        isPending={pending() || !canEdit()}
                        optionalLabel={auth.localization.settings.optional}
                      />
                    )}
                  </form.AppField>
                )}
              </For>
            </div>

            <Show when={props.team && props.canListMembers}>
              <div class="flex flex-col gap-4 border-t pt-5">
                <div>
                  <h3 class="text-sm font-medium">
                    {config.localization.teamMembers}
                  </h3>
                  <p class="text-sm text-muted-foreground">
                    {config.localization.addTeamMember}
                  </p>
                </div>

                <Show
                  when={canAddMember.isPending || canAddMember.data?.success}
                >
                  <div class="flex flex-col items-stretch gap-2 sm:flex-row sm:items-end">
                    <Field class="flex-1">
                      <FieldLabel>
                        {config.localization.addTeamMember}
                      </FieldLabel>
                      <Select<MemberOption>
                        disabled={
                          canAddMember.isPending || memberLimitReached()
                        }
                        itemComponent={(itemProps) => (
                          <SelectItem item={itemProps.item}>
                            {itemProps.item.rawValue.label}
                          </SelectItem>
                        )}
                        onChange={(value) =>
                          setSelectedMember(value ?? undefined)
                        }
                        options={memberOptions()}
                        optionTextValue="label"
                        optionValue="id"
                        value={selectedMember()}
                      >
                        <SelectTrigger class="w-full">
                          <SelectValue<MemberOption>>
                            {(state) =>
                              (
                                state.selectedOption() as
                                  | MemberOption
                                  | undefined
                              )?.label
                            }
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent />
                      </Select>
                    </Field>
                    <Button
                      disabled={
                        canAddMember.isPending ||
                        !selectedMember() ||
                        addMember.isPending ||
                        memberLimitReached()
                      }
                      onClick={() => {
                        const member = selectedMember()
                        if (
                          !canAddMember.data?.success ||
                          !member ||
                          !props.team
                        )
                          return
                        addMember.mutate({
                          teamId: props.team.id,
                          userId: member.id,
                          organizationId: props.organizationId
                        })
                      }}
                      type="button"
                    >
                      <UserPlus />
                      {config.localization.addTeamMember}
                    </Button>
                  </div>
                </Show>

                <Show when={canAddMember.data?.success && memberLimitReached()}>
                  <p class="text-destructive text-sm" role="alert">
                    {config.localization.teamMemberLimitReached}
                  </p>
                </Show>

                <div class="flex flex-col gap-2">
                  <For each={teamMembers.data}>
                    {(teamMember) => {
                      const member = () =>
                        props.organizationMembers.find(
                          (candidate) => candidate.userId === teamMember.userId
                        )
                      return (
                        <div class="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
                          <span class="truncate text-sm">
                            {member()?.user.name ||
                              member()?.user.email ||
                              teamMember.userId}
                          </span>
                          <Show
                            when={
                              canRemoveMember.isPending ||
                              canRemoveMember.data?.success
                            }
                          >
                            <Button
                              aria-label={config.localization.removeTeamMember}
                              disabled={
                                canRemoveMember.isPending ||
                                removeMember.isPending
                              }
                              onClick={() => {
                                if (
                                  !canRemoveMember.data?.success ||
                                  !props.team
                                )
                                  return
                                removeMember.mutate({
                                  teamId: props.team.id,
                                  userId: teamMember.userId,
                                  organizationId: props.organizationId
                                })
                              }}
                              size="icon-sm"
                              type="button"
                              variant="ghost"
                            >
                              <UserRoundMinus />
                            </Button>
                          </Show>
                        </div>
                      )
                    }}
                  </For>
                </div>
              </div>
            </Show>

            <Show
              when={props.team && !canRemoveTeam() && canDelete.data?.success}
            >
              <p class="text-sm text-muted-foreground">
                {teamRemovalDisabledReason()}
              </p>
            </Show>

            <DialogFooter class="sm:justify-between">
              <Show
                when={
                  props.team && (canDelete.isPending || canDelete.data?.success)
                }
              >
                <Button
                  disabled={
                    canDelete.isPending ||
                    removeTeam.isPending ||
                    !canRemoveTeam()
                  }
                  onClick={() => {
                    if (!props.team) return
                    removeTeam.mutate({
                      teamId: props.team.id,
                      organizationId: props.organizationId
                    })
                  }}
                  type="button"
                  variant="destructive"
                >
                  <Trash2 />
                  {config.localization.deleteTeam}
                </Button>
              </Show>

              <div class="flex flex-col-reverse gap-2 sm:flex-row">
                <DialogClose
                  as={Button}
                  disabled={pending()}
                  type="button"
                  variant="outline"
                >
                  {auth.localization.settings.cancel}
                </DialogClose>
                <Show when={canEdit()}>
                  <form.AuthFormSubmitButton
                    disabled={
                      pending() || (props.teamLimitReached && !props.team)
                    }
                  >
                    {props.team
                      ? auth.localization.settings.saveChanges
                      : config.localization.createTeam}
                  </form.AuthFormSubmitButton>
                </Show>
              </div>
            </DialogFooter>
          </form.AuthFormRoot>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  )
}
