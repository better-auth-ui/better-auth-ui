"use client"

import {
  type AdditionalFields,
  fieldsWithModelValues,
  getAdditionalFieldDefaultValues,
  getAdditionalFieldSubmitValues,
  validateStringLength
} from "@better-auth-ui/core"
import type { OrganizationTeamsAuthClient } from "@better-auth-ui/core/plugins/organization"
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
import {
  Pencil,
  Plus,
  Trash2,
  UserPlus,
  UserRoundMinus,
  Users
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Button, buttonVariants } from "@/components/ui/button"
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
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import {
  getAuthAdditionalFieldValidators,
  isAuthFormFieldInvalid,
  useAuthForm
} from "../auth-form"

type Team = { id: string; name: string; [key: string]: unknown }

export function OrganizationTeams() {
  const { authClient } = useAuth<OrganizationTeamsAuthClient>()
  const { data: activeOrganization } = useActiveOrganization(authClient)
  const { data: session } = useSession(authClient)
  const { localization, modelFields, teamPolicy } =
    useAuthPlugin(organizationPlugin)
  const teams = useListTeams(authClient, {
    query: { organizationId: activeOrganization?.id }
  })
  const members = useListOrganizationMembers(authClient)
  const userTeams = useListUserTeams(authClient, {
    query: { organizationId: activeOrganization?.id ?? "" }
  })
  const userTeamIds = new Set(userTeams.data?.map((team) => team.id))
  const activeTeamId = (
    session?.session as { activeTeamId?: string | null } | undefined
  )?.activeTeamId
  const canCreate = useHasPermission(authClient, {
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
          <h2 className="text-sm font-semibold">{localization.teams}</h2>
          <p className="text-sm text-muted-foreground">
            {localization.teamsDescription}
          </p>
        </div>
        {(canCreate.isPending || canCreate.data?.success) && (
          <Button
            disabled={canCreate.isPending || teamLimitReached}
            onClick={() => setDialogTeam(null)}
            title={teamLimitReached ? localization.teamLimitReached : undefined}
          >
            <Plus data-icon="inline-start" />
            {localization.createTeam}
          </Button>
        )}
      </div>

      {teamLimitReached && canCreate.data?.success && (
        <p className="text-sm text-destructive" role="alert">
          {localization.teamLimitReached}
        </p>
      )}

      {teams.isPending ? (
        <Spinner />
      ) : teams.data?.length ? (
        <Card>
          <CardContent className="p-0">
            {teams.data.map((team) => (
              <div
                className="flex items-center justify-between gap-4 border-b px-4 py-3 last:border-b-0"
                key={team.id}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{team.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {localization.team}
                  </p>
                </div>
                <Button
                  onClick={() => setDialogTeam(team)}
                  size="sm"
                  variant="outline"
                >
                  <Pencil data-icon="inline-start" />
                  {localization.manage}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col gap-1">
            <p className="text-sm font-medium">{localization.noTeams}</p>
            <p className="text-sm text-muted-foreground">
              {localization.noTeamsDescription}
            </p>
          </CardContent>
        </Card>
      )}

      <TeamDialog
        activeTeamId={activeTeamId}
        allowRemovingAllTeams={teamPolicy.allowRemovingAllTeams}
        canListMembers={dialogTeam ? userTeamIds.has(dialogTeam.id) : false}
        maximumMembersPerTeam={teamPolicy.maximumMembersPerTeam}
        onOpenChange={(open) => !open && setDialogTeam(undefined)}
        open={dialogTeam !== undefined}
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
  maximumMembersPerTeam,
  onOpenChange,
  open,
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
  const { authClient, localization: authLocalization } =
    useAuth<OrganizationTeamsAuthClient>()
  const { localization } = useAuthPlugin(organizationPlugin)
  const teamMembers = useListTeamMembers(authClient, {
    query: { teamId: team?.id ?? "" },
    enabled: open && !!team && canListMembers
  })
  const canUpdate = useHasPermission(authClient, {
    organizationId,
    permissions: { team: ["update"] }
  })
  const canDelete = useHasPermission(authClient, {
    organizationId,
    permissions: { team: ["delete"] }
  })
  const canAddMember = useHasPermission(authClient, {
    organizationId,
    permissions: { member: ["update"] }
  })
  const canRemoveMember = useHasPermission(authClient, {
    organizationId,
    permissions: { member: ["delete"] }
  })
  const [userId, setUserId] = useState("")
  const createTeam = useCreateTeam(authClient, {
    onSuccess: () => {
      toast.success(localization.teamCreated)
      onOpenChange(false)
    }
  })
  const updateTeam = useUpdateTeam(authClient, {
    onSuccess: () => {
      toast.success(localization.teamUpdated)
      onOpenChange(false)
    }
  })
  const removeTeam = useRemoveTeam(authClient, {
    onSuccess: () => {
      toast.success(localization.teamDeleted)
      onOpenChange(false)
    }
  })
  const addMember = useAddTeamMember(authClient, {
    onSuccess: () => setUserId("")
  })
  const removeMember = useRemoveTeamMember(authClient)
  const memberIds = new Set(teamMembers.data?.map((member) => member.userId))
  const availableMembers = organizationMembers
    .filter((member) => !memberIds.has(member.userId))
    .map((member) => ({
      label: member.user.name || member.user.email,
      value: member.userId
    }))
  const memberLimitReached =
    maximumMembersPerTeam !== undefined &&
    (teamMembers.data?.length ?? 0) >= maximumMembersPerTeam
  const isActiveTeam = activeTeamId === team?.id
  const canRemoveFinalTeam = allowRemovingAllTeams || teamCount > 1
  const canRemoveTeam = canRemoveFinalTeam && !isActiveTeam
  const teamRemovalDisabledReason = isActiveTeam
    ? localization.activeTeamRemovalDisabled
    : localization.lastTeamRemovalDisabled

  const configuredTeamFields = useMemo(
    () => fieldsWithModelValues(teamFields, team ?? {}),
    [team, teamFields]
  )
  const form = useAuthForm({
    defaultValues: {
      additionalFields: getAdditionalFieldDefaultValues(configuredTeamFields),
      name: team?.name ?? ""
    },
    onSubmit: async ({ value }) => {
      const name = value.name.trim()
      if (!name || !organizationId || (!team && teamLimitReached)) return
      if (team && !canUpdate.data?.success) return

      const data = {
        ...getAdditionalFieldSubmitValues(
          configuredTeamFields,
          value.additionalFields
        ),
        name,
        organizationId
      }

      try {
        if (team) await updateTeam.mutateAsync({ teamId: team.id, data })
        else await createTeam.mutateAsync(data)
      } catch {
        // The mutation reports the error through its configured handler.
      }
    }
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      additionalFields: getAdditionalFieldDefaultValues(configuredTeamFields),
      name: team?.name ?? ""
    })
    setUserId("")
  }, [configuredTeamFields, form, open, team?.name])

  const pending = createTeam.isPending || updateTeam.isPending
  const canEdit = !team || canUpdate.data?.success === true

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <form.AppForm>
          <form.AuthFormRoot className="flex flex-col gap-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users />
                {team ? localization.renameTeam : localization.createTeam}
              </DialogTitle>
              <DialogDescription>
                {localization.teamsDescription}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              <form.AppField
                name="name"
                validators={{
                  onChange: ({ value }) =>
                    validateStringLength(value, {
                      requiredMessage: authLocalization.auth.fieldRequired,
                      trim: true
                    })
                }}
              >
                {(field) => {
                  const isInvalid = isAuthFormFieldInvalid(field.state.meta)
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="organization-team-name">
                        {localization.name}
                      </FieldLabel>
                      <Input
                        aria-invalid={isInvalid}
                        autoFocus
                        disabled={pending || !canEdit}
                        id="organization-team-name"
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        value={field.state.value}
                      />
                      <field.AuthFormFieldError />
                    </Field>
                  )
                }}
              </form.AppField>

              {configuredTeamFields.map((configuredField) => (
                <form.AppField
                  key={configuredField.name}
                  name={`additionalFields.${configuredField.name}`}
                  validators={getAuthAdditionalFieldValidators(
                    configuredField,
                    authLocalization.auth.fieldRequired
                  )}
                >
                  {(field) => (
                    <field.AuthFormAdditionalField
                      field={configuredField}
                      isPending={pending || !canEdit}
                      optionalLabel={authLocalization.settings.optional}
                    />
                  )}
                </form.AppField>
              ))}
            </div>

            {team && canListMembers && (
              <div className="flex flex-col gap-4 border-t pt-5">
                <div>
                  <h3 className="text-sm font-medium">
                    {localization.teamMembers}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {localization.addTeamMember}
                  </p>
                </div>

                {(canAddMember.isPending || canAddMember.data?.success) && (
                  <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-end">
                    <Field className="flex-1">
                      <FieldLabel>{localization.addTeamMember}</FieldLabel>
                      <Select
                        disabled={canAddMember.isPending || memberLimitReached}
                        items={availableMembers}
                        onValueChange={(value) => setUserId(value ?? "")}
                        value={userId}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={localization.selectMember}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {availableMembers.map((member) => (
                              <SelectItem
                                key={member.value}
                                value={member.value}
                              >
                                {member.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Button
                      disabled={
                        canAddMember.isPending ||
                        !userId ||
                        addMember.isPending ||
                        memberLimitReached
                      }
                      onClick={() => {
                        if (!canAddMember.data?.success || !userId) return
                        addMember.mutate({
                          teamId: team.id,
                          userId,
                          organizationId
                        })
                      }}
                      type="button"
                    >
                      <UserPlus data-icon="inline-start" />
                      {localization.addTeamMember}
                    </Button>
                  </div>
                )}

                {canAddMember.data?.success && memberLimitReached && (
                  <p className="text-sm text-destructive" role="alert">
                    {localization.teamMemberLimitReached}
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
                        className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
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
                            aria-label={localization.removeTeamMember}
                            disabled={
                              canRemoveMember.isPending ||
                              removeMember.isPending
                            }
                            onClick={() => {
                              if (!canRemoveMember.data?.success) return
                              removeMember.mutate({
                                teamId: team.id,
                                userId: teamMember.userId,
                                organizationId
                              })
                            }}
                            size="icon-sm"
                            type="button"
                            variant="ghost"
                          >
                            <UserRoundMinus />
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {team && !canRemoveTeam && canDelete.data?.success && (
              <p className="text-sm text-muted-foreground">
                {teamRemovalDisabledReason}
              </p>
            )}

            <DialogFooter className="sm:justify-between">
              {team && (canDelete.isPending || canDelete.data?.success) && (
                <AlertDialog>
                  <AlertDialogTrigger
                    className={buttonVariants({ variant: "destructive" })}
                    disabled={
                      canDelete.isPending ||
                      removeTeam.isPending ||
                      !canRemoveTeam
                    }
                    type="button"
                  >
                    <Trash2 data-icon="inline-start" />
                    {localization.deleteTeam}
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {localization.deleteTeam}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {localization.deleteTeamDescription}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        {authLocalization.settings.cancel}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className={buttonVariants({ variant: "destructive" })}
                        onClick={() =>
                          removeTeam.mutate({
                            teamId: team.id,
                            organizationId
                          })
                        }
                      >
                        <Trash2 data-icon="inline-start" />
                        {localization.deleteTeam}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <DialogClose
                  className={buttonVariants({ variant: "outline" })}
                  disabled={pending}
                  type="button"
                >
                  {authLocalization.settings.cancel}
                </DialogClose>
                {canEdit && (
                  <form.AuthFormSubmitButton
                    disabled={pending || (teamLimitReached && !team)}
                  >
                    {team
                      ? authLocalization.settings.saveChanges
                      : localization.createTeam}
                  </form.AuthFormSubmitButton>
                )}
              </div>
            </DialogFooter>
          </form.AuthFormRoot>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  )
}
