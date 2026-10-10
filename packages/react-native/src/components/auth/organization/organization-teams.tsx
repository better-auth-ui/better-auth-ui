import { AdditionalField } from "../additional-field"
import { TeamSwitcher } from "./team-switcher"
import { useAuthNavigation } from "../../../navigation/navigation-context"
import { useAllOrganizationMembers } from "./use-all-members"
import {
  fieldsWithModelValues,
  getAdditionalFieldDefaultValues,
  getAdditionalFieldSubmitValues,
  validateStringLength
} from "@better-auth-ui/core"
import type {
  OrganizationTeamsAuthClient,
  CreateTeamParams,
  UpdateTeamParams
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useListTeams,
  useListTeamMembers,
  useHasPermission,
  useCreateTeam,
  useUpdateTeam,
  useRemoveTeam,
  useAddTeamMember,
  useRemoveTeamMember
} from "@better-auth-ui/react/plugins/organization"
import { useState } from "react"
import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import type { CardSlotProps } from "../../../lib/auth-plugin"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Description } from "../../../primitives/description"
import { SearchField } from "../../../primitives/inputs-extra"
import { Select } from "../../../primitives/menu"
import { Skeleton } from "../../../primitives/skeleton"
import { Box, Txt } from "../../../primitives/styled"
import { useAuthForm, getAuthAdditionalFieldValidators } from "../auth-form"

type Team = { id: string; name: string; [key: string]: unknown }
type TeamAction = { type: "create" } | { type: "edit" | "delete"; team: Team }
export type OrganizationTeamsProps = CardSlotProps & {
  organizationId: string
  organizationSlug: string
}

export function OrganizationTeams({
  organizationId,
  organizationSlug,
  ...props
}: OrganizationTeamsProps) {
  const { authClient } = useAuth()
  const { localization, teamPolicy, modelFields } =
    useAuthPlugin(organizationPlugin)
  const client = authClient as OrganizationTeamsAuthClient
  const teams = useListTeams(client, { query: { organizationId } })
  const create = useHasPermission(client, {
    organizationId,
    permissions: { team: ["create"] }
  })
  const update = useHasPermission(client, {
    organizationId,
    permissions: { team: ["update"] }
  })
  const remove = useHasPermission(client, {
    organizationId,
    permissions: { team: ["delete"] }
  })
  const [search, setSearch] = useState("")
  const [action, setAction] = useState<TeamAction>()
  const navigation = useAuthNavigation()
  const [selected, setSelected] = useState<string | undefined>(
    navigation.getParam("teamId") ?? ""
  )
  const routeTeamId = navigation.getParam("teamId")
  const [previousRouteTeamId, setPreviousRouteTeamId] = useState(routeTeamId)
  if (previousRouteTeamId !== routeTeamId) {
    setPreviousRouteTeamId(routeTeamId)
    setSelected(routeTeamId)
  }
  const atLimit =
    teamPolicy.maximumTeams !== undefined &&
    (teams.data?.length ?? 0) >= teamPolicy.maximumTeams
  return (
    <Box className={props.className ?? "gap-4"}>
      <Txt className="font-semibold">{localization.teams}</Txt>
      <Description>{localization.teamsDescription}</Description>
      <TeamSwitcher
        organizationId={organizationId}
        organizationSlug={organizationSlug}
        onSelectionChange={(teamId) => {
          setSelected(teamId)
          navigation.push(
            { section: "organization", view: "teams", slug: organizationSlug },
            { replace: true, params: { teamId } }
          )
        }}
      />
      <SearchField
        aria-label={localization.search}
        placeholder={localization.search}
        value={search}
        onChangeText={setSearch}
      />
      <Button
        isDisabled={!create.data?.success || teams.isPending || atLimit}
        onPress={() => setAction({ type: "create" })}
      >
        {localization.createTeam}
      </Button>
      {atLimit ? (
        <Description>{localization.teamLimitReached}</Description>
      ) : null}
      {teams.isPending ? <Skeleton className="h-20 w-full" /> : null}
      {teams.error ? (
        <Txt accessibilityRole="alert">{teams.error.message}</Txt>
      ) : null}
      {teams.data?.length === 0 ? (
        <Description>{localization.noTeamsDescription}</Description>
      ) : null}
      {teams.data
        ?.filter((team) =>
          team.name.toLowerCase().includes(search.trim().toLowerCase())
        )
        .map((team) => (
          <Card key={team.id} variant={props.variant}>
            <Card.Content className="gap-3">
              <Txt className="font-medium">{team.name}</Txt>
              {fieldsWithModelValues(modelFields.team, team).map((field) => (
                <AdditionalField
                  key={field.name}
                  name={field.name}
                  field={{ ...field, readOnly: true }}
                  value={
                    getAdditionalFieldDefaultValues([field])[field.name] ?? null
                  }
                  onChange={() => {}}
                  onBlur={() => {}}
                />
              ))}
              <Button onPress={() => setSelected(team.id)}>
                {localization.teamMembers}
              </Button>
              <Button
                isDisabled={!update.data?.success}
                onPress={() => setAction({ type: "edit", team })}
              >
                {localization.renameTeam}
              </Button>
              <Button
                variant="danger"
                isDisabled={
                  !remove.data?.success ||
                  routeTeamId === team.id ||
                  (!teamPolicy.allowRemovingAllTeams &&
                    (teams.data?.length ?? 0) <= 1)
                }
                onPress={() => setAction({ type: "delete", team })}
              >
                {localization.deleteTeam}
              </Button>
              {routeTeamId === team.id ? (
                <Description>
                  {localization.activeTeamRemovalDisabled}
                </Description>
              ) : null}
              {!teamPolicy.allowRemovingAllTeams && teams.data?.length === 1 ? (
                <Description>
                  {localization.lastTeamRemovalDisabled}
                </Description>
              ) : null}
            </Card.Content>
          </Card>
        ))}
      {action ? (
        <TeamDialog
          key={
            action.type === "create" ? "create" : action.team.id + action.type
          }
          action={action}
          organizationId={organizationId}
          onClose={() => setAction(undefined)}
        />
      ) : null}
      {selected && teams.data?.some((team) => team.id === selected) ? (
        <AlertDialog
          isOpen
          onOpenChange={(open) => {
            if (!open) setSelected(undefined)
          }}
        >
          <AlertDialog.CloseTrigger />
          <AlertDialog.Body>
            <TeamMembers
              key={selected}
              teamId={selected}
              organizationId={organizationId}
            />
          </AlertDialog.Body>
        </AlertDialog>
      ) : null}
    </Box>
  )
}

function TeamDialog({
  action,
  organizationId,
  onClose
}: {
  action: TeamAction
  organizationId: string
  onClose: () => void
}) {
  const { authClient, localization: common } = useAuth()
  const { localization, modelFields, teamPolicy } =
    useAuthPlugin(organizationPlugin)
  const client = authClient as OrganizationTeamsAuthClient
  const teams = useListTeams(client, { query: { organizationId } })
  const navigation = useAuthNavigation()
  const create = useCreateTeam(client),
    update = useUpdateTeam(client),
    remove = useRemoveTeam(client)
  const fields =
    action.type === "create"
      ? modelFields.team
      : fieldsWithModelValues(modelFields.team, action.team)
  const pending = create.isPending || update.isPending || remove.isPending
  const form = useAuthForm({
    defaultValues: {
      name: action.type === "create" ? "" : action.team.name,
      additionalFields: getAdditionalFieldDefaultValues(fields)
    },
    onSubmit: async ({ value }) => {
      if (action.type === "create" || action.type === "delete") {
        const fresh = await teams.refetch()
        if (fresh.error) throw fresh.error
        if (
          action.type === "create" &&
          teamPolicy.maximumTeams !== undefined &&
          (fresh.data?.length ?? 0) >= teamPolicy.maximumTeams
        )
          throw new Error(localization.teamLimitReached)
        if (action.type === "delete") {
          if (navigation.getParam("teamId") === action.team.id)
            throw new Error(localization.activeTeamRemovalDisabled)
          if (
            !teamPolicy.allowRemovingAllTeams &&
            (fresh.data?.length ?? 0) <= 1
          )
            throw new Error(localization.lastTeamRemovalDisabled)
        }
      }
      const extra = getAdditionalFieldSubmitValues(
        fields,
        value.additionalFields
      )
      if (action.type === "create")
        await create.mutateAsync({
          ...extra,
          name: value.name.trim(),
          organizationId
        } as CreateTeamParams)
      else if (action.type === "edit")
        await update.mutateAsync({
          teamId: action.team.id,
          organizationId,
          data: { ...extra, name: value.name.trim() }
        } as UpdateTeamParams)
      else await remove.mutateAsync({ teamId: action.team.id, organizationId })
      onClose()
    }
  })
  const title =
    action.type === "create"
      ? localization.createTeam
      : action.type === "edit"
        ? localization.renameTeam
        : localization.deleteTeam
  return (
    <AlertDialog
      isOpen
      onOpenChange={(open) => {
        if (!open && !pending) onClose()
      }}
    >
      <AlertDialog.Header>
        <AlertDialog.Heading>{title}</AlertDialog.Heading>
      </AlertDialog.Header>
      <AlertDialog.Body>
        <form.AppForm>
          <form.AuthFormRoot className="gap-4">
            {action.type === "delete" ? (
              <Description>{localization.deleteTeamDescription}</Description>
            ) : (
              <>
                <form.AppField
                  name="name"
                  validators={{
                    onChange: ({ value }) =>
                      validateStringLength(value, {
                        requiredMessage: common.auth.fieldRequired,
                        trim: true
                      })
                  }}
                >
                  {(field) => (
                    <field.AuthFormTextField
                      label={localization.name}
                      isDisabled={pending}
                    />
                  )}
                </form.AppField>
                {fields.map((configured) => (
                  <form.AppField
                    key={configured.name}
                    name={`additionalFields.${configured.name}`}
                    validators={getAuthAdditionalFieldValidators(
                      configured,
                      common.auth.fieldRequired
                    )}
                  >
                    {(field) => (
                      <field.AuthFormAdditionalField
                        field={configured}
                        isPending={pending}
                      />
                    )}
                  </form.AppField>
                ))}
              </>
            )}
            <AlertDialog.Footer>
              <Button isDisabled={pending} onPress={onClose}>
                {common.settings.cancel}
              </Button>
              <form.AuthFormSubmitButton
                isPending={pending}
                variant={action.type === "delete" ? "danger" : "primary"}
              >
                {title}
              </form.AuthFormSubmitButton>
            </AlertDialog.Footer>
          </form.AuthFormRoot>
        </form.AppForm>
      </AlertDialog.Body>
    </AlertDialog>
  )
}

function TeamMembers({
  organizationId,
  teamId
}: {
  organizationId: string
  teamId: string
}) {
  const { authClient, localization: common } = useAuth()
  const { localization, teamPolicy } = useAuthPlugin(organizationPlugin)
  const client = authClient as OrganizationTeamsAuthClient
  const members = useListTeamMembers(client, { query: { teamId } })
  const organizationMembers = useAllOrganizationMembers(organizationId)
  const allowed = useHasPermission(client, {
    organizationId,
    permissions: { team: ["update"] }
  })
  const add = useAddTeamMember(client),
    remove = useRemoveTeamMember(client)
  const [selected, setSelected] = useState<string>()
  const [removing, setRemoving] = useState<string>()
  const atLimit =
    teamPolicy.maximumMembersPerTeam !== undefined &&
    (members.data?.length ?? 0) >= teamPolicy.maximumMembersPerTeam
  const candidates =
    organizationMembers.data?.members.filter(
      (member) =>
        !members.data?.some((existing) => existing.userId === member.userId)
    ) ?? []
  return (
    <Box className="gap-3">
      <Txt className="font-semibold">{localization.teamMembers}</Txt>
      {members.isPending ? <Skeleton className="h-20 w-full" /> : null}
      {members.error ? (
        <Txt accessibilityRole="alert">{members.error.message}</Txt>
      ) : null}
      {members.data?.map((member) => (
        <Box key={member.id} className="gap-2">
          <Txt>
            {organizationMembers.data?.members.find(
              (person) => person.userId === member.userId
            )?.user.name ?? member.userId}
          </Txt>
          <Button
            variant="danger"
            isDisabled={!allowed.data?.success}
            onPress={() => setRemoving(member.userId)}
          >
            {localization.removeTeamMember}
          </Button>
        </Box>
      ))}
      <Select
        label={localization.selectMember}
        selectedKey={selected}
        options={candidates.map((member) => ({
          key: member.userId,
          label: member.user.name || member.user.email
        }))}
        onSelectionChange={setSelected}
        isDisabled={
          !allowed.data?.success || organizationMembers.isPending || atLimit
        }
      />
      <Button
        isPending={add.isPending}
        isDisabled={
          !allowed.data?.success ||
          !selected ||
          members.isPending ||
          atLimit ||
          !candidates.some((member) => member.userId === selected)
        }
        onPress={() => {
          if (selected)
            add.mutate(
              { teamId, userId: selected },
              { onSuccess: () => setSelected(undefined) }
            )
        }}
      >
        {localization.addTeamMember}
      </Button>
      {atLimit ? (
        <Description>{localization.teamMemberLimitReached}</Description>
      ) : null}
      <AlertDialog
        isOpen={!!removing}
        onOpenChange={(open) => {
          if (!open && !remove.isPending) setRemoving(undefined)
        }}
      >
        <AlertDialog.Header>
          <AlertDialog.Heading>
            {localization.removeTeamMember}
          </AlertDialog.Heading>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <Button
            isDisabled={remove.isPending}
            onPress={() => setRemoving(undefined)}
          >
            {common.settings.cancel}
          </Button>
          <Button
            variant="danger"
            isPending={remove.isPending}
            isDisabled={!allowed.data?.success}
            onPress={() => {
              if (removing)
                remove.mutate(
                  { teamId, userId: removing },
                  { onSuccess: () => setRemoving(undefined) }
                )
            }}
          >
            {localization.removeTeamMember}
          </Button>
        </AlertDialog.Footer>
      </AlertDialog>
    </Box>
  )
}
