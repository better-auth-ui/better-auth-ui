"use client"

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
import { type FormEvent, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { organizationPlugin } from "@/lib/auth/organization-plugin"

export function OrganizationTeams() {
  const { authClient } = useAuth<OrganizationAuthClient>()
  const { data: activeOrganization } = useActiveOrganization(authClient)
  const { localization } = useAuthPlugin(organizationPlugin)
  const teams = useListTeams(authClient, {
    query: { organizationId: activeOrganization?.id }
  })
  const members = useListOrganizationMembers(authClient)
  const createTeam = useCreateTeam(authClient, {
    onSuccess: () => toast.success(localization.teamCreated)
  })

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const name = String(new FormData(form).get("name") ?? "").trim()
    if (!name || !activeOrganization) return
    createTeam.mutate({ name, organizationId: activeOrganization.id })
    form.reset()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-sm font-semibold">{localization.teams}</h2>
          <p className="text-sm text-muted-foreground">
            {localization.teamsDescription}
          </p>
        </div>
        <form className="flex items-end gap-2" onSubmit={handleCreate}>
          <Field>
            <FieldLabel htmlFor="new-team-name">{localization.name}</FieldLabel>
            <Input id="new-team-name" name="name" required />
          </Field>
          <Button type="submit" disabled={createTeam.isPending}>
            {createTeam.isPending && <Spinner />}
            {localization.createTeam}
          </Button>
        </form>
      </div>
      {teams.isPending ? (
        <Spinner />
      ) : teams.data?.length ? (
        teams.data.map((team) => (
          <TeamCard
            key={team.id}
            organizationId={activeOrganization?.id ?? ""}
            organizationMembers={members.data?.members ?? []}
            team={team}
          />
        ))
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{localization.noTeams}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {localization.noTeamsDescription}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function TeamCard({
  organizationId,
  organizationMembers,
  team
}: {
  organizationId: string
  organizationMembers: Array<{
    userId: string
    user: { name: string; email: string }
  }>
  team: { id: string; name: string }
}) {
  const { authClient, localization: authLocalization } =
    useAuth<OrganizationAuthClient>()
  const { localization } = useAuthPlugin(organizationPlugin)
  const teamMembers = useListTeamMembers(authClient, {
    query: { teamId: team.id }
  })
  const updateTeam = useUpdateTeam(authClient)
  const removeTeam = useRemoveTeam(authClient)
  const [name, setName] = useState(team.name)
  const [userId, setUserId] = useState("")
  const addMember = useAddTeamMember(authClient, {
    onSuccess: () => setUserId("")
  })
  const removeMember = useRemoveTeamMember(authClient)
  const memberIds = new Set(teamMembers.data?.map((member) => member.userId))

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 pt-6">
        <div className="flex flex-col items-end gap-2 sm:flex-row">
          <Field className="flex-1">
            <FieldLabel htmlFor={`team-name-${team.id}`}>
              {localization.name}
            </FieldLabel>
            <Input
              id={`team-name-${team.id}`}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
          <Button
            disabled={updateTeam.isPending}
            variant="outline"
            onClick={() =>
              updateTeam.mutate({
                teamId: team.id,
                data: { name, organizationId }
              })
            }
          >
            {authLocalization.settings.saveChanges}
          </Button>
          <Button
            disabled={removeTeam.isPending}
            variant="destructive"
            onClick={() => {
              if (!window.confirm(localization.deleteTeam)) return
              removeTeam.mutate({ teamId: team.id, organizationId })
            }}
          >
            {localization.deleteTeam}
          </Button>
        </div>
        <div className="flex items-end gap-2">
          <Field className="flex-1">
            <FieldLabel>{localization.addTeamMember}</FieldLabel>
            <Select
              value={userId}
              onValueChange={(value) => setUserId(value ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={localization.selectMember} />
              </SelectTrigger>
              <SelectContent>
                {organizationMembers
                  .filter((member) => !memberIds.has(member.userId))
                  .map((member) => (
                    <SelectItem key={member.userId} value={member.userId}>
                      {member.user.name || member.user.email}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </Field>
          <Button
            disabled={!userId || addMember.isPending}
            onClick={() =>
              userId &&
              addMember.mutate({ teamId: team.id, userId, organizationId })
            }
          >
            {localization.addTeamMember}
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
                  onClick={() =>
                    removeMember.mutate({
                      teamId: team.id,
                      userId: teamMember.userId,
                      organizationId
                    })
                  }
                >
                  {localization.removeTeamMember}
                </Button>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
